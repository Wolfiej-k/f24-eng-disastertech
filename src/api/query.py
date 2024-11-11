import requests
from typing import Optional

from documents import search_chunks

LLAMA_URL = "http://llama:8080"
TOP_K = 5

def query_llama(query: str) -> Optional[dict]:
  """Complete query text using llama.cpp."""
  context = "\n".join([chunk.text for chunk in search_chunks(query, TOP_K)])
  prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"
  response = requests.post(f"{LLAMA_URL}/completion", json={"prompt": prompt})
  return response.json() if response.ok else None
