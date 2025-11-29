import pytest
from fastapi.testclient import TestClient
from backend.server import app
from backend.database.connection import get_db
import bcrypt


client = TestClient(app)


def test_register_and_login():
    db = get_db()
    # cleanup test user
    db.users.delete_many({"email": "testuser@example.com"})

    # register
    res = client.post("/api/auth/register", json={"username": "testuser", "email": "testuser@example.com", "password": "secret123"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "testuser@example.com"

    # login
    res2 = client.post("/api/auth/login", json={"email": "testuser@example.com", "password": "secret123"})
    assert res2.status_code == 200
    # cookies should be set
    assert "access_token" in res2.cookies

    # me
    res3 = client.get("/api/auth/me", cookies={"access_token": res2.cookies.get("access_token")})
    assert res3.status_code == 200
    assert res3.json()["email"] == "testuser@example.com"
