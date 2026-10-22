"""Database setup & ORM: Engine, Base and Session"""
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from backend.app.config import settings


class Base(DeclarativeBase):
    """Template Class for the following SQLAlchemy Models"""
    pass


# Engine: manages connections to the database
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG, # Show SQL in dev
    pool_pre_ping=True, # Test Connection before usage
    pool_recycle=300 # Recycle the engine every 5 min
)

# Session factory: Creates new sessions on demand
LocalSession = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_database() -> Generator[Session, None, None]:
    """FastAPI dependency: yields SQLAlchemy Session. closes it after.

    Usage in a route:
        @app.get("/items")
        def read_items(db: Session = Depends(get_database)):
            Instructions for getting items:
    """
    database_session = LocalSession()
    try:
        yield database_session
    finally:
        database_session.close()