"""PostgreSQL connection setup; no connection opens until explicitly requested."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

class Base(DeclarativeBase):
    pass

def database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise RuntimeError("DATABASE_URL is required; configure PostgreSQL in your local environment.")
    if url.startswith("postgres://"):
        url = "postgresql+psycopg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url

def make_session_factory(url=None):
    raw_url = (url or database_url()).strip()
    if raw_url.startswith("postgres://"):
        raw_url = "postgresql+psycopg://" + raw_url[len("postgres://"):]
    elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        raw_url = "postgresql+psycopg://" + raw_url[len("postgresql://"):]
    engine = create_engine(raw_url, pool_pre_ping=True)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False), engine