from sentence_transformers import SentenceTransformer
import re
import datetime
from dataclasses import dataclass, asdict

from database import get_database

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def chunk_text(text: str, max_length=500):
  """Split text into chunks of at most `max_length` tokens.
  Keeps sentences together where possible."""
  sentences = re.split(r'(?<=[.!?]) +', text)
  chunks, current, length = [], [], 0

  for sentence in sentences:
    words = sentence.split()
    tokens = len(words)

    if length + tokens <= max_length:
      current.extend(words)
      length += tokens
    else:
      chunks.append(" ".join(current))
      current = words
      length = tokens

    while length > max_length:
      chunks.append(" ".join(current[:max_length]))
      current = current[max_length:]
      length = len(current)

  if current:
    chunks.append(" ".join(current[:max_length]))

  return chunks

def embed_text(text: str):
  """Compute normalized embedding of input text."""
  embedding = model.encode(text, normalize_embeddings=True)
  return embedding.tolist()

@dataclass
class Document:
  """Document in the database."""
  id: int
  title: str
  content: str
  searches: int
  created_at: datetime.datetime

  @staticmethod
  def from_tuple(t: tuple):
    return Document(t[0], t[1], t[2], t[3], t[4])

  def __dict__(self):
    return asdict(self)

def get_documents():
  """Get all documents from the database."""
  conn = get_database()
  with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM documents;")
    documents = cursor.fetchall()
  return list(map(Document.from_tuple, documents))

def create_document(title: str, content: str):
  """Insert document into database."""
  chunks = chunk_text(content)
  embeddings = map(embed_text, chunks)

  with get_database() as conn:
    with conn.cursor() as cursor:
      cursor.execute("""
          INSERT INTO documents (title, content)
          VALUES (%s, %s) RETURNING id;
        """, (title, content))
      doc_id = cursor.fetchone()[0]

      for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        cursor.execute("""
            INSERT INTO document_chunks (doc_id, chunk_index, chunk_text, embedding)
            VALUES (%s, %s, %s, %s);
          """, (doc_id, i, chunk, embedding))

def get_document(id: int):
  """Get one document from the database."""
  conn = get_database()
  with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM documents WHERE id = %s;", (id,))
    document = cursor.fetchone()
  return Document.from_tuple(document) if document else None

def update_document(id: int, title: str, content: str):
  """Update a document in the database."""
  chunks = chunk_text(content)
  embeddings = map(embed_text, chunks)

  with get_database() as conn:
    with conn.cursor() as cursor:
      cursor.execute("""
        UPDATE documents
        SET title = %s, content = %s
        WHERE id = %s;
      """, (title, content, id))

      cursor.execute("DELETE FROM document_chunks WHERE doc_id = %s;", (id,))

      for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        cursor.execute("""
            INSERT INTO document_chunks (doc_id, chunk_index, chunk_text, embedding)
            VALUES (%s, %s, %s, %s);
          """, (id, i, chunk, embedding))

def delete_document(id: int):
  """Delete a document from the database."""
  with get_database() as conn:
    with conn.cursor() as cursor:
      cursor.execute("DELETE FROM document_chunks where doc_id = %s;", (id,))
      cursor.execute("DELETE FROM documents where id = %s;", (id,))

@dataclass
class Chunk:
  """Chunk of text and similarity to query."""
  text: str
  similarity: float
  doc_id: int

  @staticmethod
  def from_tuple(t: tuple):
    return Chunk(t[0], t[1], t[2])

  def __dict__(self):
    return asdict(self)

def search_chunks(query: str, top_k: int):
  """Get top-k chunks matching query."""
  embedding = embed_text(query)
  conn = get_database()
  with conn.cursor() as cursor:
    cursor.execute("""
        SELECT chunk_text, similarity, doc_id
        FROM (
          SELECT chunk_text, embedding <#> %s::vector AS similarity, doc_id
          FROM document_chunks
        ) subquery
        WHERE similarity <= -0.5
        ORDER BY similarity ASC
        LIMIT %s;
      """, (embedding, top_k))
    results = cursor.fetchall()
  return list(map(Chunk.from_tuple, results))

def update_chunks(doc_ids: list[int]):
  """Increment search counter for documents."""
  with get_database() as conn:
    with conn.cursor() as cursor:
      cursor.execute("""
          UPDATE documents SET searches = searches + 1
          WHERE id = ANY(%s);
        """, (doc_ids,))
