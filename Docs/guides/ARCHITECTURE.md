# GitaGraph Architecture

This document is the execution map for reviewers: where the request enters, which module reasons over it, and what evidence comes back.

## Core Pipeline

```text
Reader query
  -> Flask REST API
  -> expert rules / graph search / SPARQL / CSP / uncertainty / semantic retrieval
  -> enriched verse evidence from Data/corpus/Bhagwad_Gita.csv
  -> JSON response
  -> React UI
```

The central integration file is `backend/api.py`. The shared graph model is `backend/modules/knowledge_graph.py`, which loads `Data/ontology/gita_ontology.ttl` into both RDFLib and NetworkX. All reasoning modules reuse that graph instead of keeping separate state.

## Runtime Layers

| Layer | Files | Responsibility |
|---|---|---|
| Entry point | `run.py`, `backend/api.py` | Starts the local app and exposes REST endpoints |
| API orchestration | `backend/api.py` | Loads data lazily, calls AI modules, enriches results with CSV verse text |
| Core graph | `backend/modules/knowledge_graph.py` | RDFLib graph, NetworkX graph, node/edge helpers |
| Search | `backend/modules/search_agent.py` | BFS reading lists, DFS chains, A* Moksha path, IDDFS traces |
| Inference | `backend/modules/expert_system.py` | Forward-chaining rules and SPARQL competency questions |
| Planning | `backend/modules/study_planner.py` | CSP study plan generation with constraints and heuristics |
| Uncertainty | `backend/modules/uncertainty_handler.py` | MYCIN certainty factors, fuzzy membership, belief revision |
| Retrieval | `backend/scripts/generate_embeddings.py`, `Data/embeddings/` | Dense verse embeddings and semantic search index |
| Data | `Data/corpus/Bhagwad_Gita.csv`, `Data/ontology/gita_ontology.ttl` | Full verse corpus and curated ontology |
| UI | `frontend/src/` | React pages for graph, search, ask, planner, uncertainty, expert system |

## Query to Answer Flow

### Unified solve pipeline

Endpoint: `POST /api/solve`

```text
reader concern
  -> solve_query()
  -> expert-system concept inference
  -> graph BFS support verses
  -> optional semantic RAG matches
  -> A* path to Moksha when available
  -> ranked evidence list + reasoning trace
```

Example:

```bash
curl -s -X POST http://127.0.0.1:8080/api/solve \
  -H "Content-Type: application/json" \
  -d '{"query":"I feel anxious about the results of my work","goal":"peace","stage":"beginner","nature":"active","include_semantic":false}'
```

Expected reasoning shape:

```text
R1_AnxietyResults fires -> NishkamaKarma
R3_BeginnerNishkama fires -> Verse_2_47
BFS retrieves nearby NishkamaKarma/KarmaYoga support verses
Evidence is returned as one ranked list with sources attached
```

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
  -> cosine search over Data/embeddings/verse_embeddings.npy
  -> top-k verse matches
  -> ontology concept enrichment when the verse is in the AI corpus
```

Generate embeddings once if they are missing:

```bash
python backend/scripts/generate_embeddings.py
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
2. `backend/api.py` composes module output with full verse data from `Data/corpus/Bhagwad_Gita.csv`.
3. The React UI calls the same REST endpoints exposed for command-line testing.
4. `backend/modules/query_pipeline.py` provides `solve_query()`, the unified reasoning pipeline for end-to-end answers.

## Qualitative Examples

| Input | Inferred concept | Main verse | Reasoning shown |
|---|---|---|---|
| "I feel anxious about the results of my work" | `NishkamaKarma` | 2.47 | R1 maps result-anxiety to selfless action; R3 selects the beginner start verse; BFS adds supporting verses. |
| "My mind is restless during meditation" | `DhyanaYoga_inst` | 6.10 | R5 maps restless mind/focus to meditation practice; graph evidence stays in Chapter 6. |
| "I am confused about my duty" | `Svadharma` | 3.35 | R6 maps duty confusion to Svadharma; supporting evidence explains own-duty vs another's duty. |

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
