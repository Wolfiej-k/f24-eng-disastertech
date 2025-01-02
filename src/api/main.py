from flask import Flask, request, jsonify, Response, stream_with_context
from http import HTTPStatus
import os
import json

from documents import get_documents, create_document, get_document, update_document, delete_document
from query import build_context, stream_llama
from stats import container_stats, container_health

app = Flask(__name__)

@app.route("/documents", methods=["GET", "POST"])
def handle_documents():
  if request.method == "GET":
    return jsonify(get_documents()), HTTPStatus.OK
  elif request.method == "POST":
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
      return "", HTTPStatus.BAD_REQUEST

    create_document(title, content)
    return "", HTTPStatus.CREATED

@app.route("/documents/<int:id>", methods=["GET", "PUT", "DELETE"])
def handle_document(id: int):
  document = get_document(id)
  if not document:
    return "", HTTPStatus.NOT_FOUND

  if request.method == "GET":
    return jsonify(document), HTTPStatus.OK
  elif request.method == "PUT":
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
      return "", HTTPStatus.BAD_REQUEST

    update_document(id, title, content)
    return "", HTTPStatus.OK
  elif request.method == "DELETE":
    delete_document(id)
    return jsonify(document), HTTPStatus.OK

@app.route("/query", methods=["POST"])
def handle_query():
  data = request.get_json()
  query = data.get("query")
  history = data.get("history", [])

  if not data.get("query"):
    return "", HTTPStatus.BAD_REQUEST

  context, doc_ids = build_context(query, history)
  stream = stream_llama(context)

  response = Response(
    stream_with_context(stream),
    content_type='text/plain'
  )
  response.headers["X-Query-Sources"] = json.dumps(doc_ids)

  return response

@app.route("/stats", methods=["GET"])
def handle_stats():
  return jsonify(container_stats()), HTTPStatus.OK

@app.route("/health", methods=["GET"])
def handle_health():
  return jsonify(container_health()), HTTPStatus.OK

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=os.getenv("API_PORT"))
