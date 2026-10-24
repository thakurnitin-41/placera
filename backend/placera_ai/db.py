"""PostgreSQL connection setup; no connection opens until explicitly requested."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
class Base(DeclarativeBase): pass
def database_url():
    url=os.getenv("DATABASE_URL","").strip()
    if not url: raise RuntimeError("DATABASE_URL is required; configure PostgreSQL in your local environment.")
    return url
def make_session_factory(url=None):
    engine=create_engine(url or database_url(),pool_pre_ping=True)
    return sessionmaker(bind=engine,autoflush=False,expire_on_commit=False),engine