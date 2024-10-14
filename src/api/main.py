from flask import Flask, request, jsonify
import psycopg2
import os
from datetime import datetime
import numpy as np

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

# Execute setup.sql
# def execute_sql_file(filename):
#     with open(filename, 'r') as file:
#         sql = file.read()
#     with conn.cursor() as cursor:
#         cursor.execute(sql)
#     conn.commit()

# Execute the setup.sql script
# execute_sql_file('../../setup.sql')

# Embedding model (example using a dummy model)
def compute_embedding(text):
    # Dummy embedding: replace with actual model
    return np.random.rand(100).tolist()

@app.route("/documents", methods=['POST'])
def create_document():
    data = request.json
    title = data.get("title")
    content = data.get("content")
    embedding = compute_embedding(content)

    with conn.cursor() as cursor:
        cursor.execute("""
        INSERT INTO documents (title, content, embedding)
        VALUES (%s, %s, %s) RETURNING id;
        """, (title, content, embedding))
        doc_id = cursor.fetchone()[0]
        conn.commit()

    return jsonify({"id": doc_id}), 201

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
            "embedding": document[3],
            "created_at": document[4]
        })
    else:
        return jsonify({"error": "Document not found"}), 404

@app.route("/documents/<int:id>", methods=['PUT'])
def update_document(id):
    data = request.json
    title = data.get("title")
    content = data.get("content")
    embedding = compute_embedding(content)

    with conn.cursor() as cursor:
        cursor.execute("""
        UPDATE documents
        SET title = %s, content = %s, embedding = %s
        WHERE id = %s;
        """, (title, content, embedding, id))
        conn.commit()

    return jsonify({"message": "Document updated"}), 200

@app.route("/documents/<int:id>", methods=['DELETE'])
def delete_document(id):
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM documents WHERE id = %s;", (id,))
        conn.commit()

    return jsonify({"message": "Document deleted"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
