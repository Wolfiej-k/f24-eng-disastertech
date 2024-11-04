from flask import Flask, request, jsonify
import psycopg2
import os
import numpy as np
from sentence_transformers import SentenceTransformer

# Flask web server.
app = Flask(__name__)

# Embedding model, we should experiment!
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# Postgres database connection.
conn = psycopg2.connect(
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=os.getenv("POSTGRES_HOST"),
)


# Compute normed embedding of given text.
def compute_embedding(text: str) -> list:
    embedding = np.linalg.norm(model.encode(text)).tolist()
    return embedding


# Create document object from tuple.
def parse_document(doc: tuple) -> dict:
    return {
        "id": doc[0],
        "title": doc[1],
        "content": doc[2],
        "embedding": doc[3],
        "created_at": doc[4],
    }


# Get all documents.
@app.route("/documents", methods=["GET"])
def get_documents():
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM documents")
        docs = cursor.fetchall()

    return jsonify([parse_document(doc) for doc in docs]), 200


# Get a single document by ID
@app.route("/documents/<int:id>", methods=["GET"])
def get_document(id: int):
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, title, content, created_at FROM documents WHERE id = %s;", (id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"message": "Document not found"}), 404
        document = {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "created_at": row[3].isoformat(),
        }
    return jsonify(document), 200


# Create a single document.
@app.route("/documents", methods=["POST"])
def create_document():
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    embedding = compute_embedding(content)

    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO documents (title, content, embedding) VALUES (%s, %s, %s);",
            (title, content, embedding),
        )
        conn.commit()

    return jsonify({"message": "Document created"}), 201


# Update a single document.
@app.route("/documents/<int:id>", methods=["PUT"])
def update_document(id: int):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    embedding = compute_embedding(content)

    with conn.cursor() as cursor:
        cursor.execute(
            """
        UPDATE documents
        SET title = %s, content = %s, embedding = %s
        WHERE id = %s;
        """,
            (title, content, embedding, id),
        )
        conn.commit()

    return jsonify({"message": "Document updated"}), 200


# Delete a single document.
@app.route("/documents/<int:id>", methods=["DELETE"])
def delete_document(id: int):
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM documents WHERE id = %s;", (id,))
        conn.commit()

    return jsonify({"message": "Document deleted"}), 200


# Partially update a single document
@app.route("/documents/<int:id>", methods=["PATCH"])
def patch_document(id: int):
    data = request.get_json()
    if not data:
        return jsonify({"message": "No input data provided"}), 400

    fields = []
    values = []

    content_updated = False
    new_content = None

    if "title" in data:
        fields.append("title = %s")
        values.append(data["title"])

    if "content" in data:
        fields.append("content = %s")
        values.append(data["content"])
        content_updated = True
        new_content = data["content"]

    # If content is updated, recompute the embedding
    if content_updated:
        embedding = compute_embedding(new_content)
        fields.append("embedding = %s")
        values.append(embedding)

    if not fields:
        return jsonify({"message": "No valid fields provided for update"}), 400

    values.append(id)
    sql = f"UPDATE documents SET {', '.join(fields)} WHERE id = %s;"

    with conn.cursor() as cursor:
        cursor.execute(sql, tuple(values))
        conn.commit()

    return jsonify({"message": "Document updated"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
