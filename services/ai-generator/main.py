from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import uuid
import json

app = FastAPI()

class GenerateAppRequest(BaseModel):
    prompt: str
    packageName: str = "com.example.app"

class GenerateAppResponse(BaseModel):
    projectId: str
    message: str
    # In a real app, we would return a URL to the generated code or a zip
    structure: dict

@app.post("/generate", response_model=GenerateAppResponse)
async def generate_app(request: GenerateAppRequest):
    # In a real implementation, we would call the Claude API to generate the code
    # For now, we return a mock structure
    projectId = str(uuid.uuid4())
    
    # Mock Android project structure
    structure = {
        "app": {
            "src": {
                "main": {
                    "java": {
                        "com": {
                            "example": {
                                "app": {
                                    "MainActivity.kt": "// MainActivity content\npackage com.example.app\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.setContent\nimport androidx.compose.material3.MaterialTheme\nimport androidx.compose.material3.Surface\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.unit.sp\n\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent {\n            MaterialTheme {\n                Surface(\n                    modifier = Modifier.fillMaxSize(),\n                    color = MaterialTheme.colorScheme.background\n                ) {\n                    Greeting(\"Android\")\n                }\n            }\n        }\n    }\n}\n\n@Composable\nfun Greeting(name: String) {\n    Text(text = \"Hello, $name!\", modifier = Modifier.padding(24.sp), fontSize = 24.sp)\n}\n",
                                    "AndroidManifest.xml": "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    package=\"com.example.app\">\n    <application\n        android:allowBackup=\"true\"\n        android:label=\"@string/app_name\"\n        android:icon=\"@mipmap/ic_launcher\"\n        android:roundIcon=\"@mipmap/ic_launcher_round\"\n        android:supportsRtl=\"true\"\n        android:theme=\"@style/Theme.App\">\n        <activity android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>",
                                    "strings.xml": "<resources>\n    <string name=\"app_name\">Generated App</string>\n</resources>"
                                }
                            }
                        }
                    },
                    "res": {
                        "layout": {
                            "activity_main.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<androidx.constraintlayout.widget.ConstraintLayout xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    xmlns:app=\"http://schemas.android.com/apk/res-auto\"\n    xmlns:tools=\"http://schemas.android.com/tools\"\n    android:layout_width=\"match_parent\"\n    android:layout_height=\"match_parent\"\n    tools:context=\".MainActivity\">\n\n    <TextView\n        android:layout_width=\"wrap_content\"\n        android:layout_height=\"wrap_content\"\n        android:text=\"Hello World!\"\n        app:layout_constraintBottom_toBottomOf=\"parent\"\n        app:layout_constraintLeft_toLeftOf=\"parent\"\n        app:layout_constraintRight_toRightOf=\"parent\"\n        app:layout_constraintTop_toTopOf=\"parent\" />\n\n</androidx.constraintlayout.widget.ConstraintLayout>"
                        },
                        "values": {
                            "strings.xml": "<resources>\n    <string name=\"app_name\">Generated App</string>\n</resources>"
                        },
                        "mipmap-anydpi-v26": {
                            "ic_launcher.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\">\n    <background android:drawable=\"@color/ic_launcher_background\" />\n    <foreground android:drawable=\"@drawable/ic_launcher_foreground\" />\n</adaptive-icon>",
                            "ic_launcher_round.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\">\n    <background android:drawable=\"@color/ic_launcher_background\" />\n    <foreground android:drawable=\"@drawable/ic_launcher_round_foreground\" />\n</adaptive-icon>"
                        }
                    }
                }
            }
        }
    }
}

    return GenerateAppResponse(
        projectId=projectId,
        message="App generated successfully (mock)",
        structure=structure
    )

@app.get("/")
async def root():
    return {"message": "AI Generator Service"}
