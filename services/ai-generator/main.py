from fastapi import Depends, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel
import os
import uuid

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from claude import generate_app_structure

app = FastAPI()

# Milestone 1.3: rate limiting on the generation endpoint. In-memory limiter
# keyed by client IP; a shared Redis backend can replace it in production.
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    raise HTTPException(status_code=429, detail="Rate limit exceeded")


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class GenerateAppRequest(BaseModel):
    prompt: str
    packageName: str = "com.example.app"


class GenerateAppResponse(BaseModel):
    projectId: str
    message: str
    # In a real app, we would return a URL to the generated code or a zip
    structure: dict


def _mock_structure(package_name):
    main_activity_kt = (
        "// MainActivity content\n"
        "package com.example.app\n\n"
        "import android.os.Bundle\n"
        "import androidx.activity.ComponentActivity\n"
        "import androidx.activity.compose.setContent\n"
        "import androidx.compose.material3.MaterialTheme\n"
        "import androidx.compose.material3.Surface\n"
        "import androidx.compose.material3.Text\n"
        "import androidx.compose.runtime.Composable\n"
        "import androidx.compose.foundation.layout.fillMaxSize\n"
        "import androidx.compose.foundation.layout.padding\n"
        "import androidx.compose.ui.Modifier\n"
        "import androidx.compose.ui.unit.dp\n\n"
        "class MainActivity : ComponentActivity() {\n"
        "    override fun onCreate(savedInstanceState: Bundle?) {\n"
        "        super.onCreate(savedInstanceState)\n"
        "        setContent {\n"
        "            MaterialTheme {\n"
        "                Surface(\n"
        "                    modifier = Modifier.fillMaxSize(),\n"
        "                    color = MaterialTheme.colorScheme.background\n"
        "                ) {\n"
        "                    Greeting(\"Android\")\n"
        "                }\n"
        "            }\n"
        "        }\n"
        "    }\n"
        "}\n\n"
        "@Composable\n"
        "fun Greeting(name: String) {\n"
        "    Text(text = \"Hello, $name!\", modifier = Modifier.padding(24.dp))\n"
        "}\n"
    )

    android_manifest_xml = (
        "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n"
        f"    package=\"{package_name}\">\n"
        "    <application\n"
        "        android:allowBackup=\"true\"\n"
        "        android:label=\"@string/app_name\"\n"
        "        android:icon=\"@mipmap/ic_launcher\"\n"
        "        android:roundIcon=\"@mipmap/ic_launcher_round\"\n"
        "        android:supportsRtl=\"true\"\n"
        "        android:theme=\"@style/Theme.App\">\n"
        "        <activity android:name=\".MainActivity\"\n"
        "            android:exported=\"true\">\n"
        "            <intent-filter>\n"
        "                <action android:name=\"android.intent.action.MAIN\" />\n"
        "                <category android:name=\"android.intent.category.LAUNCHER\" />\n"
        "            </intent-filter>\n"
        "        </activity>\n"
        "    </application>\n"
        "</manifest>\n"
    )

    strings_xml = "<resources>\n    <string name=\"app_name\">Generated App</string>\n</resources>\n"

    activity_main_xml = (
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
        "<androidx.constraintlayout.widget.ConstraintLayout "
        "xmlns:android=\"http://schemas.android.com/apk/res/android\"\n"
        "    xmlns:app=\"http://schemas.android.com/apk/res-auto\"\n"
        "    xmlns:tools=\"http://schemas.android.com/tools\"\n"
        "    android:layout_width=\"match_parent\"\n"
        "    android:layout_height=\"match_parent\"\n"
        "    tools:context=\".MainActivity\">\n\n"
        "    <TextView\n"
        "        android:layout_width=\"wrap_content\"\n"
        "        android:layout_height=\"wrap_content\"\n"
        "        android:text=\"Hello World!\"\n"
        "        app:layout_constraintBottom_toBottomOf=\"parent\"\n"
        "        app:layout_constraintLeft_toLeftOf=\"parent\"\n"
        "        app:layout_constraintRight_toRightOf=\"parent\"\n"
        "        app:layout_constraintTop_toTopOf=\"parent\" />\n\n"
        "</androidx.constraintlayout.widget.ConstraintLayout>\n"
    )

    ic_launcher_xml = (
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
        "<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\">\n"
        "    <background android:drawable=\"@color/ic_launcher_background\" />\n"
        "    <foreground android:drawable=\"@drawable/ic_launcher_foreground\" />\n"
        "</adaptive-icon>\n"
    )

    ic_launcher_round_xml = (
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
        "<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\">\n"
        "    <background android:drawable=\"@color/ic_launcher_background\" />\n"
        "    <foreground android:drawable=\"@drawable/ic_launcher_round_foreground\" />\n"
        "</adaptive-icon>\n"
    )

    structure = {
        "app": {
            "src": {
                "main": {
                    "java": {
                        "com": {
                            "example": {
                                "app": {
                                    "MainActivity.kt": main_activity_kt,
                                    "AndroidManifest.xml": android_manifest_xml,
                                    "strings.xml": strings_xml,
                                }
                            }
                        }
                    },
                    "res": {
                        "layout": {
                            "activity_main.xml": activity_main_xml,
                        },
                        "values": {
                            "strings.xml": strings_xml,
                        },
                        "mipmap-anydpi-v26": {
                            "ic_launcher.xml": ic_launcher_xml,
                            "ic_launcher_round.xml": ic_launcher_round_xml,
                        },
                    },
                }
            }
        }
    }

    return structure


def require_service_token(x_service_token: str = Header(None)):
    """Milestone 1.3: shared service-token auth for service-to-service calls.

    The token is validated against the SERVICE_TOKEN env var. When the env
    var is not configured the endpoint stays locked (401) until provisioned.
    """
    expected = os.environ.get("SERVICE_TOKEN")
    if not expected or not x_service_token or x_service_token != expected:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing X-Service-Token",
        )


@app.post("/generate", response_model=GenerateAppResponse)
@limiter.limit("20/minute")
async def generate_app(
    request: Request,
    request_data: GenerateAppRequest,
    _token: None = Depends(require_service_token),
):
    project_id = str(uuid.uuid4())

    # Try real Claude generation first; fall back to the template mock when
    # ANTHROPIC_API_KEY is not configured or generation fails.
    structure = generate_app_structure(request_data.prompt, request_data.packageName)
    generated_by = "Claude" if structure else "template"
    if structure is None:
        structure = _mock_structure(request_data.packageName)

    return GenerateAppResponse(
        projectId=project_id,
        message=f"App generated successfully ({generated_by})",
        structure=structure,
    )


@app.get("/")
async def root():
    return {"message": "AI Generator Service"}
