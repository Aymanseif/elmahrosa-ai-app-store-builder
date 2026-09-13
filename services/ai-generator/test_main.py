from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_responds():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_generate_returns_project_and_structure():
    response = client.post(
        "/generate",
        json={"prompt": "a simple todo app", "packageName": "com.example.todo"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["projectId"]
    assert "message" in data
    structure = data["structure"]
    assert "app" in structure
    main_dir = structure["app"]["src"]["main"]
    assert "MainActivity.kt" in main_dir["java"]["com"]["example"]["app"]
    assert "AndroidManifest.xml" in main_dir["java"]["com"]["example"]["app"]
    # The requested package name must be reflected in the generated manifest
    assert "com.example.todo" in main_dir["java"]["com"]["example"]["app"]["AndroidManifest.xml"]


def test_generate_rejects_missing_prompt():
    response = client.post("/generate", json={})
    assert response.status_code == 422