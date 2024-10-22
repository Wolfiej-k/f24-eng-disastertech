-- Grant privileges on the database and all tables
CREATE ROLE t4sg WITH LOGIN PASSWORD 'disaster-tech-labs';
GRANT ALL PRIVILEGES ON DATABASE "offline-ai" TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO t4sg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO t4sg;

-- Load pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG documents and their vector embeddings
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search heuristic (compare with HNSW)
CREATE INDEX ON documents USING ivfflat (embedding vector_ip_ops)
