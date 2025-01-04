-- Grant privileges on the database and all tables
CREATE ROLE t4sg WITH LOGIN PASSWORD 'disaster-tech-lab';
GRANT ALL PRIVILEGES ON DATABASE "offline-ai" TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO t4sg;

-- Admin-authorized users
CREATE TABLE users (
  username TEXT PRIMARY KEY,
  hash TEXT NOT NULL
);

-- Logs of past queries
CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Load pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents for RAG
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  searches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Embeddings of document chunks
CREATE TABLE document_chunks (
  id SERIAL PRIMARY KEY,
  doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(384)  -- Adjust size to match model
);

-- Search heuristic (compare with HNSW)
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_ip_ops)
