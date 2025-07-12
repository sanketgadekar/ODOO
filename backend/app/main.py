from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base
from .routes import auth_router, users_router, skills_router, swaps_router, admin_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Skill Swap Platform API"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(skills_router, prefix="/api")
app.include_router(swaps_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok", "version": settings.PROJECT_VERSION}


if __name__ == "__main__":
    import uvicorn
    print(f"Starting {settings.PROJECT_NAME} on http://0.0.0.0:8002")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=True)
