# GitaGraph Architecture

This document is the execution map for reviewers: where the request enters, which module reasons over it, and what evidence comes back.

## Core Pipeline

```text
Reader query
  -> Flask REST API
  -> expert rules / graph search / SPARQL / CSP / uncertainty / semantic retrieval
  -> enriched verse evidence from Bhagwad_Gita.csv
  -> JSON response
  -> React UI
```

The central integration file is `api.py`. The shared graph model is `modules/knowledge_graph.py`, which loads `knowledge_base/gita_ontology.ttl` into both RDFLib and NetworkX. All reasoning modules reuse that graph instead of keeping separate state.

## Runtime Layers

| Layer | Files | Responsibility |
|---|---|---|
| Entry point | `run.py`, `api.py` | Starts the local app and exposes REST endpoints |
| API orchestration | `api.py` | Loads data lazily, calls AI modules, enriches results with CSV verse text |
| Core graph | `modules/knowledge_graph.py` | RDFLib graph, NetworkX graph, node/edge helpers |
| Search | `modules/search_agent.py` | BFS reading lists, DFS chains, A* Moksha path, IDDFS traces |
| Inference | `modules/expert_system.py` | Forward-chaining rules and SPARQL competency questions |
| Planning | `modules/study_planner.py` | CSP study plan generation with constraints and heuristics |
| Uncertainty | `modules/uncertainty_handler.py` | MYCIN certainty factors, fuzzy membership, belief revision |
| Retrieval | `generate_embeddings.py`, `embeddings/` | Dense verse embeddings and semantic search index |
| Data | `Bhagwad_Gita.csv`, `knowledge_base/gita_ontology.ttl` | Full verse corpus and curated ontology |
| UI | `frontend/src/` | React pages for graph, search, ask, planner, uncertainty, expert system |

## Query to Answer Flow

### Natural-language concern

Endpoint: `POST /api/infer`

```text
concern + goal + stage + nature
  -> ExpertSystem.forward_chain()
  -> fired production rules
  -> recommended concept/start verse
  -> CSV enrichment
  -> confidence + verse evidence
```

Example:

```bash
curl -s -X POST http://127.0.0.1:8080/api/infer \
  -H "Content-Type: application/json" \
  -d '{"concern":"I feel anxious about results","goal":"peace","stage":"beginner","nature":"active"}'
```

Expected reasoning shape:

```text
R1_AnxietyResults fires -> NishkamaKarma
R3_BeginnerNishkama fires -> Verse_2_47
Response includes confidence, fired rules, start verse, and recommended verses.
```

### Graph search

Endpoints: `POST /api/bfs`, `POST /api/dfs`, `POST /api/astar`, `POST /api/iddfs`

```text
concept/start node
  -> NetworkX graph traversal
  -> path or reading list
  -> verse annotations for each concept
```

Example:

```bash
curl -s -X POST http://127.0.0.1:8080/api/astar \
  -H "Content-Type: application/json" \
  -d '{"start":"Vairagya","goal":"Moksha"}'
```

Expected reasoning shape:

```text
Vairagya -> ChittaShuddhi -> AtmaJnana -> Moksha
Trace includes g, h, and f values for A*.
```

### Semantic RAG

Endpoint: `GET /api/semantic_search?q=...`

```text
query text
  -> sentence-transformer query embedding
  -> cosine search over embeddings/verse_embeddings.npy
  -> top-k verse matches
  -> ontology concept enrichment when the verse is in the AI corpus
```

Generate embeddings once if they are missing:

```bash
python generate_embeddings.py
```

### Study planning

Endpoint: `POST /api/plan`

```text
reader goal + session count
  -> CSP backtracking
  -> MRV/forward-checking pruning
  -> valid session plan with constraints and stats
```

Example:

```bash
curl -s -X POST http://127.0.0.1:8080/api/plan \
  -H "Content-Type: application/json" \
  -d '{"goal":"meditation","sessions":5,"verses_per":2}'
```

### Uncertainty

Endpoints: `POST /api/cf`, `GET /api/fuzzy/<verse>`, `POST /api/belief`

```text
verse/concept
  -> MYCIN CF combination or fuzzy membership
  -> confidence labels and belief-revision trace
```

## What Is Integrated?

The modules are not separate demos. They share three integration points:

1. `GitaKnowledgeGraph` is the common ontology and graph state.
2. `api.py` composes module output with full verse data from `Bhagwad_Gita.csv`.
3. The React UI calls the same REST endpoints exposed for command-line testing.

## Minimal Local Run

```bash
pip install -r requirements.txt
python run.py --api-only
```

For the full UI:

```bash
pip install -r requirements.txt
cd frontend && npm install
cd ..
python run.py
```

Open `http://127.0.0.1:3000` for the React UI or `http://127.0.0.1:8080/api/stats` for the API.
