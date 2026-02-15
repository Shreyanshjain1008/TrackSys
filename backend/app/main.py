from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, projects, issues, comments, attachments, websockets, users
from app.core.config import settings

app = FastAPI(
    title="TrackSys API",
    version="1.0.0",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- ROUTERS ----------
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(issues.router)
app.include_router(comments.router)
app.include_router(attachments.router)
app.include_router(websockets.router)  # /ws/...
app.include_router(users.router)

# ---------- HEALTH CHECK ----------
@app.get("/", tags=["Health"])
def root():
    return {"app": "TrackSys", "status": "ok"}
