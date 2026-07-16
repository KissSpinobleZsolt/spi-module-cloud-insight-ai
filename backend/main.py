"""
CloudInsight AI — plugin backend (stub)

This is a placeholder FastAPI service. It satisfies the docker-compose build
so the platform starts, but has no real functionality yet.

TODO: implement data ingestion endpoints:
  POST /upload            — accept CSV / XLSX / JSON, parse and store rows
  GET  /sources           — list ingested data sources with status + row counts
  GET  /sources/{id}      — single source detail
  DELETE /sources/{id}    — remove a source
  GET  /sources/{id}/rows — paginated row browser

The core backend proxies requests here via /api/plugin/cloudInsightAI/...
Authentication: the Authorization header is forwarded verbatim from the proxy —
validate it with verify_token() before touching any data.
"""

import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"

app = FastAPI(title="CloudInsight AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_token(authorization: str | None = Header(default=None)):
    """Validate the JWT forwarded by the core proxy."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/health")
def health():
    """Liveness probe used by docker-compose healthcheck."""
    return {"status": "ok", "service": "cloud-insight-ai-backend"}
