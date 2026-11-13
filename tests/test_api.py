import pytest
from fastapi.testclient import TestClient
from services.api.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_graph_endpoints(client):
    response = client.get("/api/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 20
    assert len(data["edges"]) >= 20

def test_bench_endpoints(client):
    response = client.get("/api/bench/suites")
    assert response.status_code == 200
    suites = response.json().get("suites", [])
    assert len(suites) >= 4

    lb_resp = client.get("/api/bench/leaderboard")
    assert lb_resp.status_code == 200
    lb = lb_resp.json().get("entries", [])
    assert len(lb) >= 5

def test_library_endpoints(client):
    response = client.get("/api/library/collections")
    assert response.status_code == 200
    colls = response.json().get("collections", [])
    assert len(colls) >= 4

    export_resp = client.post("/api/library/export", json={"item_id": "seed_memos_2", "format": "obsidian"})
    assert export_resp.status_code == 200
    assert "content" in export_resp.json()

def test_launchpad_endpoints(client):
    response = client.get("/api/launchpad/templates")
    assert response.status_code == 200
    templates = response.json().get("templates", [])
    assert len(templates) >= 4
    for t in templates:
        assert "terraform" in t
        assert "dockerfile" in t
        assert "cli_command" in t
