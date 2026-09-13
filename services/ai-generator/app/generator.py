from fastapi import FastAPI
app = FastAPI()

@app.post("/generate")
async def generate():
    return {"message": "Not implemented yet"}

@app.get("/")
async def root():
    return {"message": "AI Generator Service"}
