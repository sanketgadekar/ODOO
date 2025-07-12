import uvicorn
from app.main import app
from app.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.PROJECT_NAME} on http://0.0.0.0:8002")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, log_level="debug") 