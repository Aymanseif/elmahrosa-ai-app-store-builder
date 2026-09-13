from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid

from claude import generate_app_structure

app = FastAPI()


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


@app.post("/generate", response_model=GenerateAppResponse)
async def generate_app(request: GenerateAppRequest):
    project_id = str(uuid.uuid4())

    # Try real Claude generation first; fall back to the template mock when
    # ANTHROPIC_API_KEY is not configured or generation fails.
    structure = generate_app_structure(request.prompt, request.packageName)
    generated_by = "Claude" if structure else "template"
    if structure is None:
        structure = _mock_structure(request.packageName)

    return GenerateAppResponse(
        projectId=project_id,
        message=f"App generated successfully ({generated_by})",
        structure=structure,
    )


@app.get("/")
async def root():
    return {"message": "AI Generator Service"}
