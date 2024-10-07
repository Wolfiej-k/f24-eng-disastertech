CREATE EXTENSION IF NOT EXISTS vector;

-- RAG documents and their vector embeddings
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search heuristic (compare with HNSW)
CREATE INDEX ON documents USING ivfflat (embedding vector_ip_ops)