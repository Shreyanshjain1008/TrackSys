import json
from typing import List, Optional

try:
    from pydantic_settings import BaseSettings
    from pydantic import field_validator
    _PYDANTIC_V2 = True
except ImportError:
    from pydantic import BaseSettings, validator
    _PYDANTIC_V2 = False


def _parse_cors(v):
    if isinstance(v, list):
        return [str(item).strip() for item in v if str(item).strip()]
    if isinstance(v, str):
        value = v.strip()
        if not value:
            return []
        if value.startswith("["):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except Exception:
                pass
        return [item.strip() for item in value.split(",") if item.strip()]
    return v


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_BUCKET: Optional[str] = None

    if _PYDANTIC_V2:
        @field_validator("CORS_ORIGINS", mode="before")
        @classmethod
        def parse_cors_origins(cls, v):
            return _parse_cors(v)

        model_config = {"env_file": ".env", "case_sensitive": True}
    else:
        @validator("CORS_ORIGINS", pre=True)
        def parse_cors_origins(cls, v):
            return _parse_cors(v)

        class Config:
            env_file = ".env"
            case_sensitive = True


settings = Settings()
