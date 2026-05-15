# Runtime Guide

This guide documents the current, tested way to run GitaGraph after the repository restructure.

## Repository Layout

```text
backend/   Flask API, reasoning modules, backend scripts
frontend/  React/Vite app
Data/      corpus, ontology, embeddings, optional runtime assets
Docs/      guides, reports, figures, team notes
```

## Backend

Start the backend only:

```bash
python run.py --api-only
```

Manual equivalent:

```bash
python backend/api.py
```

Health checks:

```bash
curl http://127.0.0.1:8080/api/stats
curl -X POST http://127.0.0.1:8080/api/solve \
  -H "Content-Type: application/json" \
  -d '{"query":"I feel anxious about the results of my work","goal":"peace","stage":"beginner","nature":"active","include_semantic":false}'
```

Verified locally on April 28, 2026:

```text
/api/stats -> 200, total_verses=701
/api/solve -> 200, NishkamaKarma -> Verse_2_47
```

## Frontend

Development server:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Production build:

```bash
cd frontend
npm run build
```

Verified locally on April 28, 2026:

```text
npm run build -> passed
Vite dev server on port 3001 -> 200
```

## Full App Launcher

After frontend dependencies are installed:

```bash
python run.py
```

This starts:

```text
Backend API: http://127.0.0.1:8080
Frontend UI: http://127.0.0.1:3000
```

## Semantic Search

Semantic search uses the local files:

```text
Data/embeddings/verse_embeddings.npy
Data/embeddings/verse_index.json
```

Regenerate them with:

```bash
python backend/scripts/generate_embeddings.py
```

Endpoint:

```bash
curl "http://127.0.0.1:8080/api/semantic_search?q=karma&k=5"
```

## Audio Recitation

Audio is optional and not committed to the repository because the cache is large.

Expected cache path:

```text
Data/audio_cache/*.parquet
```

Download audio shards:

```bash
python backend/scripts/download_audio.py
```

Endpoint after download:

```bash
curl -I http://127.0.0.1:8080/api/audio/2/47
```

Current local status on April 28, 2026:

```text
/api/audio/2/47 -> 500
Reason: Data/audio_cache is not populated.
Fix: run python backend/scripts/download_audio.py
```

## Ollama Commentary

Ollama is optional. The app works without it, but commentary buttons show an offline state.

Install and start:

```bash
ollama pull llama3.2
ollama serve
```

Check API status:

```bash
curl http://127.0.0.1:8080/api/ollama_status
```

Current local status on April 28, 2026:

```json
{"running": false, "models": []}
```

When Ollama is running, `/api/ollama_status` returns:

```json
{"running": true, "models": ["llama3.2:latest"]}
```

## Local Files Ignored by Git

These runtime/generated files should stay out of Git:

```text
frontend/node_modules/
frontend/dist/
Data/audio_cache/
Data/runtime/*.db
__pycache__/
*.pyc
```
