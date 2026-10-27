"""Database setup: engine, session, and base."""
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# Engine: manages connections to the database
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,       # Show SQL in dev
    pool_pre_ping=True,         # Test connections before use
    pool_recycle=300,           # Recycle every 5 min
    connect_args={"connect_timeout": 5}
)

# Session factory: creates new sessions on demand
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a DB session, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables in the database."""
    from app.models import User, Category, Expense  # noqa: F401

    Base.metadata.create_all(bind=engine)