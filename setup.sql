-- Create the t4sg user with the specified password
CREATE ROLE t4sg WITH LOGIN PASSWORD 'disaster-tech-labs';

-- Grant privileges on the database offline-ai to t4sg
GRANT ALL PRIVILEGES ON DATABASE "offline-ai" TO t4sg;

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
