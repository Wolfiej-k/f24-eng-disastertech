import requests
from typing import Generator, Optional

from documents import search_chunks

LLAMA_URL = "http://llama:8080"
CHUNK_SIZE = 512
MAX_TOKENS = 128

def build_prompt(query: str, top_k=5) -> Optional[str]:
  """Augment query with vector documents."""
  context = "\n".join([chunk.text for chunk in search_chunks(query, top_k)])
  return f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"

def stream_llama(prompt) -> Generator[str, None, None]:
  """Complete query text using llama.cpp's stream API."""
  yield ""

  try:
    response = requests.post(
      f"{LLAMA_URL}/completion",
      json={"prompt": prompt, "max_tokens": MAX_TOKENS},
      stream=True
    )

    if not response.ok:
      yield "Error: Unable to complete request."

    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
      if chunk:
        yield chunk.decode('utf-8')
  except requests.exceptions.RequestException as e:
    yield f"Error: {str(e)}"
