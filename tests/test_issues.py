def test_create_project_and_issue(client):
    # register and login a user
    client.post("/api/auth/register", json={"email": "bob@example.com", "password": "password", "full_name": "Bob"})
    r = client.post("/api/auth/login", data={"username": "bob@example.com", "password": "password"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # create project
    pr = client.post("/api/projects/", json={"name": "Proj A", "description": ""}, headers=headers)
    assert pr.status_code == 200
    pid = pr.json()["id"]
    # create issue
    isr = client.post(f"/api/issues/projects/{pid}/", json={"title": "First issue", "description": "desc"}, headers=headers)
    assert isr.status_code == 200
    issue = isr.json()
    assert issue["title"] == "First issue"