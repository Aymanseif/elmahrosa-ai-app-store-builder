from fastapi.testclient import TestClient

from main import app
from claude import generate_app_structure

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


def test_generate_reports_claude_when_key_present(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    import main as main_module

    original = main_module.generate_app_structure
    main_module.generate_app_structure = lambda prompt, package_name: {"app": {}}
    try:
        response = client.post(
            "/generate",
            json={"prompt": "todo app", "packageName": "com.example.todo"},
        )
        assert response.status_code == 200
        assert "(Claude)" in response.json()["message"]
    finally:
        main_module.generate_app_structure = original
