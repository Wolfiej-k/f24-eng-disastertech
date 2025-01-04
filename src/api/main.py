from flask import Flask, request, jsonify, Response, stream_with_context
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, verify_jwt_in_request
from http import HTTPStatus
import psycopg2
import os
import json

from documents import get_documents, create_document, get_document, update_document, delete_document
from query import build_context, stream_llama
from stats import container_stats, container_health
from database import get_database

AUTH_SECRET = os.getenv("AUTH_SECRET")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = AUTH_SECRET

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

@app.route("/register", methods=["POST"])
def handle_register():
  secret = request.headers.get("X-Secret")
  if not secret or secret != ADMIN_PASSWORD:
    return jsonify({"msg": "Invalid credentials"}), HTTPStatus.UNAUTHORIZED

  data = request.get_json()
  username = data.get("username")
  password = data.get("password")
  if not username or not password:
    return jsonify({"msg": "Missing username or password"}), HTTPStatus.BAD_REQUEST

  hash = bcrypt.generate_password_hash(password).decode('utf-8')
  try:
    with get_database() as conn:
      with conn.cursor() as cursor:
        cursor.execute("INSERT INTO users (username, hash) VALUES (%s, %s)", (username, hash))
    return jsonify({"msg": "User registered"}), HTTPStatus.CREATED
  except psycopg2.IntegrityError:
    return jsonify({"msg": "User already exists"}), HTTPStatus.CONFLICT
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/login", methods=["POST"])
def handle_login():
  data = request.get_json()
  username = data.get("username")
  password = data.get("password")
  if not username or not password:
    return jsonify({"msg": "Missing username or password"}), HTTPStatus.BAD_REQUEST

  try:
    conn = get_database()
    with conn.cursor() as cursor:
      cursor.execute("SELECT hash FROM users WHERE username = %s", (username,))
      hash = cursor.fetchone()
      if hash and bcrypt.check_password_hash(hash[0], password):
        token = create_access_token(identity={"username": username})
        return jsonify({"token": token}), HTTPStatus.OK
      return jsonify({"msg": "Invalid credentials"}), HTTPStatus.UNAUTHORIZED
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/documents", methods=["GET", "POST"])
@jwt_required()
def handle_documents():
  try:
    if request.method == "GET":
      return jsonify(get_documents()), HTTPStatus.OK
    elif request.method == "POST":
      data = request.get_json()
      title = data.get("title")
      content = data.get("content")
      if not title or not content:
        return jsonify({"msg": "Missing title or content"}), HTTPStatus.BAD_REQUEST

      create_document(title, content)
      return jsonify({"msg": "Document created"}), HTTPStatus.CREATED
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/documents/<int:id>", methods=["GET", "PUT", "DELETE"])
def handle_document(id: int):
  try:
    document = get_document(id)
    if not document:
      return jsonify({"msg": "Document not found"}), HTTPStatus.NOT_FOUND

    if request.method == "GET":
      return jsonify(document), HTTPStatus.OK

    try:
      verify_jwt_in_request()
    except:
      return jsonify({"msg": "Invalid credentials"}), HTTPStatus.UNAUTHORIZED

    if request.method == "PUT":
      data = request.get_json()
      title = data.get("title")
      content = data.get("content")
      if not title or not content:
        return jsonify({"msg": "Missing title or content"}), HTTPStatus.BAD_REQUEST

      update_document(id, title, content)
      return jsonify({"msg": "Document updated"}), HTTPStatus.OK

    if request.method == "DELETE":
      delete_document(id)
      return jsonify({"msg": "Document deleted"}), HTTPStatus.OK
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/query", methods=["POST"])
def handle_query():
  data = request.get_json()
  query = data.get("query")
  history = data.get("history", [])
  if not query:
    return jsonify({"msg": "Missing query"}), HTTPStatus.BAD_REQUEST

  try:
    context, doc_ids = build_context(query, history)
    stream = stream_llama(context)
    response = Response(stream_with_context(stream), content_type='text/plain')
    response.headers["X-Query-Sources"] = json.dumps(doc_ids)
    return response
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/stats", methods=["GET"])
@jwt_required()
def handle_stats():
  try:
    return jsonify(container_stats()), HTTPStatus.OK
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route("/health", methods=["GET"])
@jwt_required()
def handle_health():
  try:
    return jsonify(container_health()), HTTPStatus.OK
  except:
    return jsonify({"msg": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=os.getenv("API_PORT"))
