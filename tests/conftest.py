import asyncio
import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import Base, engine, SessionLocal

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="session")
def client():
    # create tables in test DB (ensure DATABASE_URL points to a test DB locally)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c