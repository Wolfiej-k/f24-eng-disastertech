from flask import Flask, request, jsonify
import psycopg2
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from datetime import datetime
from psycopg2.extras import Json
import subprocess
import requests
import docker
import psutil

# Initialize the model and Flask app
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')  # Use any model that fits your needs
app = Flask(__name__)

# Load environment variables
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_HOST = os.getenv('POSTGRES_HOST')

# Database connection
conn = psycopg2.connect(
    dbname=POSTGRES_DB,
    user=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    host=POSTGRES_HOST
)

# Helper function: Chunk text into manageable parts
def chunk_text(text, max_length=500):
    words = text.split()
    chunks = [' '.join(words[i:i + max_length]) for i in range(0, len(words), max_length)]
    print(f"Chunking Result: {len(chunks)} chunks")
    for idx, chunk in enumerate(chunks):
        print(f"Chunk {idx}: {chunk[:50]}...")  # Print first 50 characters for inspection
    return chunks


# Helper function: Compute embedding for a text chunk
def compute_embedding(text):
    embedding = model.encode(text, normalize_embeddings=True)  # Normalized embeddings
    return embedding.tolist()

@app.route("/documents", methods=['POST'])
def create_document():
    data = request.json
    title = data.get("title")
    content = data.get("content")

    # Chunk content and compute embeddings for each chunk
    chunks = chunk_text(content)
    embeddings = [compute_embedding(chunk) for chunk in chunks]

    with conn.cursor() as cursor:
        # Store document metadata
        cursor.execute("""
            INSERT INTO documents (title, content, created_at)
            VALUES (%s, %s, %s) RETURNING id;
        """, (title, content, datetime.utcnow()))
        doc_id = cursor.fetchone()[0]

        # Store chunks and their embeddings
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            cursor.execute("""
                INSERT INTO document_chunks (doc_id, chunk_index, chunk_text, embedding)
                VALUES (%s, %s, %s, %s);
            """, (doc_id, i, chunk, embedding))  # Directly pass the list, no Json() wrapper


        conn.commit()

    return jsonify({"id": doc_id}), 201

@app.route("/search", methods=['GET'])
def search_documents():
    query = request.args.get('query')
    top_k = int(request.args.get('top_k', 5))

    # Compute the embedding for the query
    query_embedding = compute_embedding(query)

    with conn.cursor() as cursor:
        # Use pgvector to find the most similar chunks
        cursor.execute("""
            SELECT doc_id, chunk_text, chunk_index,
                  1 - (embedding <-> %s::vector) AS similarity  -- Correct cast to vector
            FROM document_chunks
            ORDER BY similarity DESC
            LIMIT %s;
        """, (query_embedding, top_k))
        results = cursor.fetchall()

    # Group results by document for aggregated relevance
    grouped_results = {}
    for doc_id, chunk_text, chunk_index, similarity in results:
        if doc_id not in grouped_results:
            grouped_results[doc_id] = {"chunks": [], "score": 0}
        grouped_results[doc_id]["chunks"].append({
            "chunk_index": chunk_index,
            "chunk_text": chunk_text,
            "similarity": similarity
        })
        grouped_results[doc_id]["score"] += similarity

    # Sort documents by total relevance score
    sorted_results = sorted(grouped_results.items(), key=lambda x: -x[1]["score"])

    return jsonify({"results": sorted_results}), 200

@app.route("/documents/<int:id>", methods=['GET'])
def get_document(id):
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM documents WHERE id = %s;", (id,))
        document = cursor.fetchone()

    if document:
        return jsonify({
            "id": document[0],
            "title": document[1],
            "content": document[2],
            "created_at": document[3]
        })
    else:
        return jsonify({"error": "Document not found"}), 404


def get_container_stats(container_name):
    """Get essential stats for a container"""
    try:
        client = docker.from_env()
        container = client.containers.get(container_name)
        stats = container.stats(stream=False)

        # Calculate CPU percentage safely
        try:
            cpu_percent = 0.0
            if 'cpu_stats' in stats and 'precpu_stats' in stats:
                cpu_delta = float(stats['cpu_stats']['cpu_usage']['total_usage'] -
                                stats['precpu_stats']['cpu_usage']['total_usage'])
                system_delta = float(stats['cpu_stats']['system_cpu_usage'] -
                                   stats['precpu_stats']['system_cpu_usage'])
                if system_delta > 0:
                    cpu_percent = (cpu_delta / system_delta) * 100.0
        except:
            cpu_percent = 0.0

        # Calculate memory usage safely
        try:
            mem_usage = stats['memory_stats']['usage']
            mem_limit = stats['memory_stats']['limit']
            mem_percent = (mem_usage / mem_limit) * 100.0
        except:
            mem_usage = 0
            mem_limit = 0
            mem_percent = 0.0

        return {
            "status": container.status,
            "cpu_percent": round(cpu_percent, 2),
            "memory": {
                "usage_mb": round(mem_usage / (1024 * 1024), 2),
                "limit_mb": round(mem_limit / (1024 * 1024), 2),
                "percent": round(mem_percent, 2)
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.route("/monitoring", methods=['GET'])
def get_monitoring():
    try:
        # Monitor all containers
        containers = {
            "frontend": "frontend",
            "backend": "backend",
            "llama": "llama",
            "database": "database"
        }

        # Collect stats for each container
        container_stats = {}
        for name, container_id in containers.items():
            stats = get_container_stats(container_id)
            if "error" not in stats:
                container_stats[name] = stats
            else:
                container_stats[name] = {
                    "status": "error",
                    "error": stats["error"]
                }

        # Add Llama-specific metrics if available
        try:
            llama_response = requests.get('http://llama:8080/metrics', timeout=2)
            if llama_response.status_code == 200:
                container_stats["llama"]["metrics"] = llama_response.json()
        except:
            pass

        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "containers": container_stats,
            "host": {
                "cpu_percent": psutil.cpu_percent(),
                "memory_percent": round(psutil.virtual_memory().percent, 2)
            }
        }

        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route("/monitoring/health", methods=['GET'])
def health_check():
    try:
        containers = ["frontend", "backend", "llama", "database"]
        client = docker.from_env()

        health = {
            "status": "healthy",
            "containers": {}
        }

        for container in containers:
            try:
                status = client.containers.get(container).status
                health["containers"][container] = status
                if status != "running":
                    health["status"] = "degraded"
            except:
                health["containers"][container] = "not_found"
                health["status"] = "degraded"

        return jsonify(health), 200 if health["status"] == "healthy" else 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
