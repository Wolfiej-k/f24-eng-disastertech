import requests
import json
import os

from documents import search_chunks, update_chunks
from database import get_database

LLAMA_URL = "http://llama:8080"
SYSTEM_PROMPT = "You assist people in natural disaster zones who have limited access to information. " + \
                "Using the following documents, answer their questions about survival in various " + \
                "scenarios. Your response should be formatted for plain-text without markdown."
TOP_DOCUMENTS = int(os.getenv("TOP_DOCUMENTS", 5))
TOP_HISTORY = int(os.getenv("TOP_HISTORY", 10))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 128))

def build_context(query: str, history: list[dict]):
  """Augment query with vector documents."""
  chunks = search_chunks(query, TOP_DOCUMENTS)
  doc_ids = list(set([chunk.doc_id for chunk in chunks]))
  update_chunks(doc_ids)

  prompt = SYSTEM_PROMPT + " "
  for chunk in chunks:
    prompt += f"Document {chunk.doc_id}: {chunk.text} "

  context = [{"role": "system", "content": prompt}]
  for message in history[-TOP_HISTORY:]:
    context.append({
      "role": "user" if message["type"] == "query" else "assistant",
      "content": message["content"],
    })
  context.append({"role": "user", "content": query})

  return context, doc_ids

def log_query(query: str, response: str):
  """Log query and response in the database."""
  with get_database() as conn:
    with conn.cursor() as cursor:
      cursor.execute("""
          INSERT INTO queries (query, response)
          VALUES (%s, %s);
        """, (query,response))

def stream_llama(context: list[dict]):
  """Complete query text using llama.cpp's stream API."""
  try:
    response = requests.post(
      f"{LLAMA_URL}/v1/chat/completions",
      json={
        "messages": context,
        "max_tokens": MAX_TOKENS,
        "stream": True,
      },
      stream=True
    )

    if not response.ok:
      yield "Error: Unable to complete request."
      return

    total_content = ""
    for line in response.iter_lines(decode_unicode=True):
      if line and line.startswith("data: "):
        data_str = line[len("data: "):]
        if data_str == "[DONE]":
          break

        data = json.loads(data_str)
        content = data["choices"][0]["delta"].get("content", "")
        if content:
          total_content += content
          yield content
    log_query(context[-1]["content"], total_content)

  except Exception as e:
    yield f"Error: {str(e)}"
