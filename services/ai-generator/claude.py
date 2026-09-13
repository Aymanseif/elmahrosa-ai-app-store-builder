import json
import os

import anthropic

DEFAULT_MODEL = "claude-sonnet-4-5"

STRUCTURE_PROMPT = """You are an Android app code generator. Generate a complete, buildable \
Android app for this request:

Request: {prompt}
Package name: {package_name}

Respond with a single JSON object and nothing else (no markdown fences). The JSON \
represents the file tree: folders are nested objects, files map their name to the \
full file content as a string. Required files:
- app/src/main/java/<package path>/MainActivity.kt (Jetpack Compose, package \
"{package_name}")
- app/src/main/java/<package path>/AndroidManifest.xml (package="{package_name}", \
minimal permissions)
- app/src/main/res/values/strings.xml
- app/build.gradle.kts and build.gradle.kts at the project root

Use real, working code. Every string value must be the complete file content.
"""


def generate_app_structure(prompt, package_name, client=None):
    """Ask Claude to generate an Android app file structure.

    Returns the parsed structure dict, or None when generation is unavailable
    or fails — callers fall back to the template mock in that case. A client
    may be injected for tests; otherwise one is built from ANTHROPIC_API_KEY
    (returns None immediately when the key is not configured).
    """
    if client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return None
        client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model=os.environ.get("ANTHROPIC_MODEL", DEFAULT_MODEL),
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": STRUCTURE_PROMPT.format(
                        prompt=prompt, package_name=package_name
                    ),
                }
            ],
        )
        text = "".join(
            block.text for block in message.content if block.type == "text"
        )

        # The model is asked for a single JSON object; slice out the outermost
        # braces in case it adds any prose or fences around the JSON.
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end <= start:
            return None
        structure = json.loads(text[start : end + 1])
        if not isinstance(structure, dict):
            return None
        return structure
    except Exception:
        # Any failure (API error, bad JSON, timeout) degrades to the mock.
        return None