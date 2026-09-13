from fastapi.testclient import TestClient
import pytest

from main import app, limiter
from claude import generate_app_structure

client = TestClient(app)

SERVICE_TOKEN = "test-service-token"


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    # Isolate the in-memory 20/minute limiter between tests: the rate-limit
    # test itself issues 21 requests and would otherwise exhaust the shared
    # "testclient" key for every test that runs after it.
    limiter.reset()
    yield
    limiter.reset()


def _auth_headers(token=SERVICE_TOKEN):
    return {"X-Service-Token": token}


def test_generate_requires_service_token():
    response = client.post("/generate", json={"prompt": "a simple todo app"})
    assert response.status_code == 401
    assert "X-Service-Token" in response.json()["detail"]


def test_generate_rejects_wrong_service_token():
    response = client.post(
        "/generate",
        json={"prompt": "a simple todo app"},
        headers=_auth_headers("wrong-token"),
    )
    assert response.status_code == 401


def test_generate_rate_limit_returns_429():
    import os

    os.environ["SERVICE_TOKEN"] = SERVICE_TOKEN
    try:
        statuses = []
        for _ in range(21):
            res = client.post(
                "/generate",
                json={"prompt": "a simple todo app", "packageName": "com.example.todo"},
                headers=_auth_headers(),
            )
            statuses.append(res.status_code)
        # The first 20 pass the 20/minute limit; the 21st is rejected.
        assert statuses[:20].count(200) == 20
        assert statuses[20] == 429
    finally:
        os.environ.pop("SERVICE_TOKEN", None)


def test_root_responds():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_generate_returns_project_and_structure():
    import os

    os.environ["SERVICE_TOKEN"] = SERVICE_TOKEN
    try:
        response = client.post(
            "/generate",
            json={"prompt": "a simple todo app", "packageName": "com.example.todo"},
            headers=_auth_headers(),
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
    finally:
        os.environ.pop("SERVICE_TOKEN", None)


def test_generate_reports_claude_when_key_present(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    monkeypatch.setenv("SERVICE_TOKEN", SERVICE_TOKEN)
    import main as main_module

    original = main_module.generate_app_structure
    main_module.generate_app_structure = lambda prompt, package_name: {"app": {}}
    try:
        response = client.post(
            "/generate",
            json={"prompt": "todo app", "packageName": "com.example.todo"},
            headers=_auth_headers(),
        )
        assert response.status_code == 200
        assert "(Claude)" in response.json()["message"]
    finally:
        main_module.generate_app_structure = original


def test_generate_rejects_missing_prompt():
    import os

    os.environ["SERVICE_TOKEN"] = SERVICE_TOKEN
    try:
        response = client.post("/generate", json={}, headers=_auth_headers())
        assert response.status_code == 422
    finally:
        os.environ.pop("SERVICE_TOKEN", None)

class _FakeMessage:
    class _Block:
        def __init__(self, text):
            self.type = "text"
            self.text = text

    def __init__(self, text):
        self.content = [self._Block(text)]


class _FakeClient:
    def __init__(self, text, fail=False):
        self._text = text
        self._fail = fail
        self.messages = self

    def create(self, **kwargs):
        if self._fail:
            raise RuntimeError("api down")
        return _FakeMessage(self._text)


def test_claude_returns_none_without_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert generate_app_structure("todo app", "com.example.todo") is None


def test_claude_parses_json_from_response():
    fake = _FakeClient('Here you go:\n```json\n{"app": {"src": {"main": {}}}}\n```')
    structure = generate_app_structure(
        "todo app", "com.example.todo", client=fake
    )
    assert structure == {"app": {"src": {"main": {}}}}


def test_claude_falls_back_to_none_on_api_error():
    fake = _FakeClient("ignored", fail=True)
    assert generate_app_structure("todo app", "com.example.todo", client=fake) is None


def test_claude_falls_back_to_none_on_non_dict():
    fake = _FakeClient("[1, 2, 3]")
    assert generate_app_structure("todo app", "com.example.todo", client=fake) is None
