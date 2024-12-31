import requests
import json

from documents import search_chunks

LLAMA_URL = "http://llama:8080"
SYSTEM_PROMPT = "You assist people in natural disaster zones who have limited access to information. " + \
                "Using the following documents, answer their questions about survival in various " + \
                "scenarios. If you do not know how to respond to a prompt, say \"I'm not sure\" " + \
                "and stop immediately. Never fabricate information not present in the documents. " + \
                "Your response should be formatted for plain-text without markdown."

def parse_message(message: dict):
  """Parse message object."""
  return {
    "role": "user" if message["type"] == "query" else "assistant",
    "content": message["content"],
  }

def build_context(query: str, history: list[dict], top_docs=5, top_hist=10):
  """Augment query with vector documents."""
  prompt = SYSTEM_PROMPT + " "
  for i, chunk in enumerate(search_chunks(query, top_docs), 1):
    prompt += f"Document {i}: {chunk.text} "

  context = [{"role": "system", "content": prompt}]
  for message in history[-top_hist:]:
    context.append(parse_message(message))
  context.append({"role": "user", "content": query})

  return context

def stream_llama(context: list[dict], max_tokens=128):
  """Complete query text using llama.cpp's stream API."""
  try:
    response = requests.post(
      f"{LLAMA_URL}/v1/chat/completions",
      json={
        "messages": context,
        "max_tokens": max_tokens,
        "stream": True,
      },
      stream=True
    )

    if not response.ok:
      yield "Error: Unable to complete request."

    for line in response.iter_lines(decode_unicode=True):
      if line and line.startswith("data: "):
        data_str = line[len("data: "):]
        if data_str == "[DONE]":
          break

        data = json.loads(data_str)
        content = data["choices"][0]["delta"].get("content", "")
        if content:
          yield content

  except Exception as e:
    yield f"Error: {str(e)}"
