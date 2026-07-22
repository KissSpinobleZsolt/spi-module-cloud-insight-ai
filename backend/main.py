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

import json
import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Any

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
BOT_CONFIGS_FILE = os.getenv("BOT_CONFIGS_FILE", "/app/data/bot_configs.json")  # JSON file used as a lightweight config store

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


def _load_configs() -> dict:
    """Read bot configs from disk; return empty dict if file is missing or corrupt."""
    try:
        with open(BOT_CONFIGS_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_configs(data: dict) -> None:
    """Persist bot configs to disk, creating parent dirs as needed."""
    os.makedirs(os.path.dirname(BOT_CONFIGS_FILE), exist_ok=True)
    with open(BOT_CONFIGS_FILE, "w") as f:
        json.dump(data, f)


class ConfigUpdatePayload(BaseModel):
    config: dict[str, Any]  # arbitrary key-value config from the frontend form


@app.get("/health")
def health():
    """Liveness probe used by docker-compose healthcheck."""
    return {"status": "ok", "service": "cloud-insight-ai-backend"}


@app.get("/bots/{bot_uuid}/config")
def get_bot_config(bot_uuid: str, _: None = Depends(verify_token)):
    """Return stored config for a bot; returns empty config if not yet saved."""
    configs = _load_configs()
    return {"config": configs.get(bot_uuid, {}), "teams": []}  # teams not used by CloudInsight AI bots


@app.put("/bots/{bot_uuid}/config")
def update_bot_config(bot_uuid: str, payload: ConfigUpdatePayload, _: None = Depends(verify_token)):
    """Persist the full config for a bot (replaces previous value)."""
    configs = _load_configs()
    configs[bot_uuid] = payload.config  # full replacement, matching the core pattern
    _save_configs(configs)
    return {"config": configs[bot_uuid]}
