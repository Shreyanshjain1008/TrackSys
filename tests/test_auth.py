def test_register_and_login(client):
    # register
    r = client.post("/api/auth/register", json={"email": "alice@example.com", "password": "password", "full_name": "Alice"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "alice@example.com"
    # login
    r2 = client.post("/api/auth/login", data={"username": "alice@example.com", "password": "password"})
    assert r2.status_code == 200
    token = r2.json()["access_token"]
    assert token