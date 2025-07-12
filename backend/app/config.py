from pydantic_settings import BaseSettings
import os
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Skill Swap Platform"
    PROJECT_VERSION: str = "0.1.0"
    
    # Database
    DATABASE_URL: str = "sqlite:///./skill_swap.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"  # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # File uploads
    UPLOAD_DIR: str = "app/static/uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
