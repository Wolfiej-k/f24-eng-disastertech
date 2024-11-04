CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table to store metadata
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chunks table with pgvector embeddings for retrieval
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,
    doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(384)  -- Adjust size to match your model
);

-- Search heuristic (compare with HNSW)
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_ip_ops)
