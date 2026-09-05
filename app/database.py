from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL format: postgresql://<user>:<password>@<host>:<port>/<dbname>
SQLALCHEMY_DATABASE_URL = "postgresql://civixa_user:civixa_secret_123@localhost:5432/civixa_db"

# Create the SQLAlchemy engine that manages the connection pool
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Factory for creating fresh database sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all our database models
Base = declarative_base()

# FastAPI dependency to provide an isolated DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
