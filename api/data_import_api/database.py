from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from . import config

# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@host.docker.internal:5432/data_import"
SQLALCHEMY_DATABASE_URL = f"postgresql://{config.DB_USER_NAME}:{config.DB_USER_PASS}@db:{config.DB_PORT}/{config.DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()