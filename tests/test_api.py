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

def test_watchlists_endpoints(client):
    response = client.get("/api/watchlists")
    assert response.status_code == 200
    data = response.json()
    assert "watchlists" in data
    assert len(data["watchlists"]) >= 4

    create_resp = client.post("/api/watchlists", json={
        "name": "Test Tracker",
        "query": "LangGraph",
        "category": "Framework",
        "channel": "In-app",
        "tags": ["LangGraph"]
    })
    assert create_resp.status_code == 200
    created_id = create_resp.json()["id"]

    scan_resp = client.post(f"/api/watchlists/{created_id}/scan")
    assert scan_resp.status_code == 200
    assert "hits" in scan_resp.json()

    del_resp = client.delete(f"/api/watchlists/{created_id}")
    assert del_resp.status_code == 200

def test_arena_endpoints(client):
    scenarios_resp = client.get("/api/arena/scenarios")
    assert scenarios_resp.status_code == 200
    data = scenarios_resp.json()
    assert "scenarios" in data
    assert "contenders" in data
    assert len(data["scenarios"]) >= 3

    sim_resp = client.post("/api/arena/simulate", json={
        "scenario_id": data["scenarios"][0]["id"],
        "contender_a": "react_baseline",
        "contender_b": "supervisor_specialists"
    })
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert "winner" in sim_data
    assert "contender_a" in sim_data
    assert "contender_b" in sim_data
    assert len(sim_data["contender_a"]["trace"]) > 0

def test_settings_endpoints(client):
    settings_resp = client.get("/api/settings")
    assert settings_resp.status_code == 200
    settings = settings_resp.json()
    assert "active_llm_provider" in settings

    update_resp = client.post("/api/settings", json={
        "fast_rag_timeout_s": 2.5
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["fast_rag_timeout_s"] == 2.5

    test_conn = client.post("/api/settings/test-connection", json={"provider": "groq"})
    assert test_conn.status_code == 200
    assert "latency_ms" in test_conn.json()

