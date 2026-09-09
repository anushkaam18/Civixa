from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database
# This creates civixa.db inside the backend folder.
SQLALCHEMY_DATABASE_URL = "sqlite:///./civixa.db"

# SQLite needs this option when used with FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Factory for creating fresh database sessions per request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all database models
Base = declarative_base()


# FastAPI dependency to provide an isolated DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()