import psycopg2
import os

conn = psycopg2.connect(
  dbname=os.getenv("POSTGRES_DB"),
  user=os.getenv("POSTGRES_USER"),
  password=os.getenv("POSTGRES_PASSWORD"),
  host=os.getenv("POSTGRES_HOST"),
)

def get_database():
  """Get database connection."""
  return conn
