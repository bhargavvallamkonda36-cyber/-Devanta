from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

# ============================================================
# IMPORT MODELS
# ============================================================

from app.models import (
    User,
    Post,
    Tag,
    PostLike,
    Bookmark,
    Comment,
)

# ============================================================
# IMPORT ROUTERS
# ============================================================

from app.routers import (
    auth,
    posts,
    social,
    users,
    tags,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Devanta API",
    description="Developer Blogging & Publishing Platform",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(social.router)
app.include_router(users.router)
app.include_router(tags.router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Devanta Backend Running Successfully 🚀"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
