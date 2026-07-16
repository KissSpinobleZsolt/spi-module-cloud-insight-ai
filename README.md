# CloudInsight AI

**Repository:** https://github.com/KissSpinobleZsolt/spi-module-data-ingestion

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

Two bots are seeded for this module (visible in the floating bot panel, bottom-left of the module page):

| Bot | Type | Purpose |
|-----|------|---------|
| CloudInsight Q&A | communicator | Ask questions about your ingested data — schema, field values, record counts |
| CloudInsight Monitor | custom | Reports anomalies and processing failures |

To enable them: Admin → Bots → edit each bot → check **CloudInsight AI** under Modules → set Active.

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
| Scope | `cloudInsightAI` |
| Component | `./App` |
| Route | `cloud-insight-ai` |
| Icon | ☁️ |

---

## File structure

```
cloud-insight-ai/
├── src/
│   ├── App.jsx        # Exposed component — data source manager UI
│   ├── bootstrap.js   # Async boundary (required for MF)
│   └── index.js       # Entry point
├── public/
│   ├── index.html     # Standalone shell with CDN React UMD scripts
│   └── manifest.json  # Module descriptor — served at /manifest.json
├── webpack.config.js
└── Dockerfile
```
