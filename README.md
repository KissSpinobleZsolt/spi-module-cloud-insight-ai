# CloudInsight AI

**Repository:** https://github.com/KissSpinobleZsolt/spi-module-cloud-insight-ai

Webpack Module Federation remote for spin-core. Provides a UI for uploading and managing structured data sources — CSV, XLSX, and JSON files — with per-source processing status and row-count statistics.

- **Scope**: `cloudInsightAI`
- **Exposed component**: `./App`
- **Frontend port**: 3002 (standalone dev) / 80 (Docker)
- **Backend port**: 8002 (plugin backend)

---

## Running the full platform

From the **spin-core root**:

```bash
docker compose up --build
```

This starts every service defined in `docker-compose.yml`:

| Service | URL | Description |
|---------|-----|-------------|
| `frontend` | http://localhost:3000 | Host React SPA |
| `backend` | http://localhost:8000 | Core FastAPI |
| `cloud-insight-ai` | http://localhost:3002 | This module's frontend (nginx) |
| `cloud-insight-ai-backend` | http://localhost:8002 | Plugin backend |
| `postgres` | localhost:5432 | PostgreSQL |
| `clickhouse` | localhost:8123 | ClickHouse |
| `ollama` | localhost:11434 | Local LLM runtime |

Once running:

1. Open http://localhost:3000 and log in.
2. Go to **Admin → Modules** and click **🔍 Scan for modules**.
3. CloudInsight AI appears in the discovery panel — click **Add**.
4. It now shows in the sidebar under its route `/modules/cloud-insight-ai`.

---

## Using the module

Navigate to **CloudInsight AI** in the sidebar.

**Data sources panel**

- **Drag and drop** any CSV, XLSX, or JSON file onto the upload zone, or click to browse.
- Each file appears as a row with its type, size, row count, and processing status (`ready` / `processing` / `error`).
- The header stat cards show total rows ingested and number of ready sources.

**AI bots**

Two bots are declared in the manifest for this module (visible in the floating bot panel, bottom-left of the module page). Both use the `ollama` provider and operate on the `sources` document collection (`principals` is a `module_documents` collection key, not a display name). The `model` field is left blank in the manifest — the admin selects a model at runtime via the bot config UI. Only the `custom`-type bot has a `scheduler` block; `communicator` bots are on-demand only.

> Bots are **not** seeded automatically when the module is registered. After adding the module go to **Admin → Modules → Reseed bots** to provision them.

| Bot | Type | Purpose |
|-----|------|---------|
| CloudInsight Q&A | communicator | Ask questions about your ingested data — schema, field values, record counts |
| CloudInsight Monitor | custom | Reports anomalies and processing failures on a schedule |

To enable them: Admin → Bots → edit each bot → check **CloudInsight AI** under Modules → set Active.

**CloudInsight Q&A — configurable parameters**

| Key | Label | Type | Default |
|-----|-------|------|---------|
| `max_records` | Max records in context | number (50–2000, step 50) | 500 |
| `include_schema` | Include schema info | boolean | true |
| `include_quality_issues` | Surface quality issues | boolean | true |

**CloudInsight Monitor — configurable parameters**

| Key | Label | Type | Default |
|-----|-------|------|---------|
| `error_threshold_pct` | Error rate threshold (%) | number (0–100, step 5) | 20 |
| `stale_hours` | Stale source threshold (hours) | number (1–168, step 1) | 24 |
| `min_row_count` | Min expected row count | number (0–100000, step 100) | 0 |
| `notify_on_quality` | Report data quality issues | boolean | true |

**CloudInsight Monitor — scheduler**

| Key | Label | Type | Default |
|-----|-------|------|---------|
| `scan_interval_minutes` | Monitor interval (minutes) | number (5–120, step 5) | 60 |

---

## Running in standalone dev mode

```bash
npm install
npm start        # webpack-dev-server on port 3002
```

Open http://localhost:3002. React is loaded from CDN UMD scripts in `public/index.html`, so no spin-core host is needed for UI development.

```bash
npm run build    # production build → dist/
```

---

## Docker (manual)

```bash
docker build -t cloud-insight-ai .
docker run -p 3002:80 cloud-insight-ai
```

---

## Registration details

| Field | Value |
|-------|-------|
| Remote URL (dev) | `http://localhost:3002/remoteEntry.js` |
| Remote URL (Docker) | `http://cloud-insight-ai/remoteEntry.js` |
| Backend URL (internal) | `http://cloud-insight-ai-backend:8000` <!-- Docker service name; host-mapped port is 8002 --> |
| Scope | `cloudInsightAI` |
| Component | `./App` |
| Route | `cloud-insight-ai` |
| Icon | ☁️ |
| i18n namespace | `cloudInsightAI` |

---

## Backend environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET_KEY` | `change-me-in-production` | Shared secret — must match the core backend value |
| `BOT_CONFIGS_FILE` | `/app/data/bot_configs.json` | Persistent JSON store for per-bot configuration |
| `CORE_API_URL` | `http://backend:8000` | Core backend base URL used for platform log writes |

## Platform logging

The plugin backend writes structured events to the core platform via `spin_logger.py` using the forwarded Bearer token. Events are visible in **Admin → Logs** under the `cloudInsightAI` scope (module logs) or the relevant bot UUID (bot logs).

| Trigger | Event type | Destination |
|---------|-----------|-------------|
| `GET /bots/{uuid}/config` called | `module.activated` | module log |
| `POST /upload` starts | `ingest.started` | module log |
| `POST /upload` succeeds | `ingest.completed` | module log |
| `POST /upload` parse error | `ingest.failed` | module log |
| `POST /upload` below min rows | `ingest.rejected` | module log |
| `PUT /bots/{uuid}/config` | `bot.config.updated` | bot log |

## File structure

```
cloud-insight-ai/
├── src/
│   ├── App.jsx           # Exposed component — data source manager UI
│   ├── bootstrap.js      # Async boundary (required for MF)
│   └── index.js          # Entry point
├── backend/
│   ├── main.py           # FastAPI plugin backend
│   ├── spin_logger.py    # Fire-and-forget helpers for platform log endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── public/
│   ├── index.html        # Standalone shell with CDN React UMD scripts
│   └── manifest.json     # Module descriptor — served at /manifest.json
├── webpack.config.js
└── Dockerfile
```
