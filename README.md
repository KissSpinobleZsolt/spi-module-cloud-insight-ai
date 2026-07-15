# data-ingestion module

Webpack Module Federation remote for spin-core. Provides a UI for uploading, processing, and managing structured data sources.

## Development

```bash
npm install
npm start        # webpack-dev-server on port 3002
```

Open `http://localhost:3002` to test standalone (loads React from CDN UMD builds).

## Production build

```bash
npm run build    # outputs to dist/
```

## Integration with spin-core

| Field | Value |
|-------|-------|
| `scope` | `dataIngestion` |
| `component` | `./App` |
| `remote_url` (dev) | `http://localhost:3002/remoteEntry.js` |
| `route` | `data-ingestion` |

The host (spin-core) provides `window.React` and `window.ReactDOM` — the bundle declares them as externals so only one React instance is active.

## Docker

```bash
docker build -t data-ingestion .
docker run -p 3002:80 data-ingestion
```

In docker-compose, this service is named `data-ingestion` and is accessible within the Docker network at `http://data-ingestion/remoteEntry.js`.
