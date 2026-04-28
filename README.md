<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Cinzel&size=32&duration=3000&pause=1000&color=C9A84C&center=true&vCenter=true&width=700&lines=OM+%E0%A5%90;GitaGraph+v2.2;Knowledge+%C2%B7+Search+%C2%B7+Inference+%C2%B7+CSP+%C2%B7+RAG" alt="GitaGraph" />

# GitaGraph — Ontology-Driven AI System for the Bhagavad Gītā

### *Hybrid Neural–Symbolic Navigation of 700 Sanskrit Verses*

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![RDFLib](https://img.shields.io/badge/RDFLib-7.0+-4CAF50?style=for-the-badge)](https://rdflib.readthedocs.io)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.3+-FF9800?style=for-the-badge)](https://networkx.org)
[![OWL 2](https://img.shields.io/badge/OWL%202-Ontology-9C27B0?style=for-the-badge)](https://www.w3.org/OWL/)
[![License](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge)](LICENSE)

> *"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"* — Bhagavad Gītā 2.47

</div>

---

## What is GitaGraph?

**GitaGraph** is a full-stack, knowledge-based AI system that models the Bhagavad Gītā as a semantic knowledge graph and extends it with hybrid neural–symbolic reasoning. It answers questions like *"I feel anxious — which verse should I read?"* by running a complete AI pipeline: OWL inference → expert system → graph traversal → CSP study planning → semantic RAG → local LLM commentary.

The **Digital Bhaṣya 2.0** frontend is a React 18 SPA served by a Flask REST API, featuring an ancient manuscript-inspired UI with illuminated verse cards, parchment textures, and Cinzel typography — presenting all **701 verses** across 18 chapters with trilingual Sanskrit / Hindi / English display.

### Seven AI Modules

| Module | Technique | Key Stats |
|---|---|---|
| **M1 — Agent** | PEAS framework, goal-based agent | Partially observable, sequential, discrete |
| **M2 — Knowledge Base** | OWL 2 ontology + SPARQL | 658 RDF triples · 16 classes · 9 properties |
| **M3 — Graph Search** | BFS · DFS · A\* · IDDFS | 61-node, 175-edge concept graph |
| **M4 — Expert System** | Forward-chaining production rules | 9 rules · 8 SPARQL CQs · Hindi/Hinglish |
| **M5 — Study Planner** | CSP backtracking + MRV + FC | 7 hard constraints · 5-session plans |
| **M6 — Uncertainty** | MYCIN CFs · Fuzzy logic · NMR | 3 commentary traditions |
| **M7 — Semantic RAG + LLM** | sentence-transformers + NumPy cosine search + Ollama | 701 verses · EN/Hindi/Hinglish commentary |

## Run in 60 Seconds

```bash
pip install -r requirements.txt
python run.py --api-only
```

Then verify the backend:

```bash
curl http://127.0.0.1:8080/api/stats
```

For the React UI:

```bash
cd frontend && npm install
cd ..
python run.py
```

Open `http://127.0.0.1:3000`. The API runs on `http://127.0.0.1:8080`.

## Core Execution Path

```text
Reader query -> Flask API -> shared knowledge graph -> reasoning module
             -> verse evidence enrichment -> JSON response -> React UI
```

The brain of the system is intentionally split by reasoning task:

| Question | Entry point | Core module |
|---|---|---|
| "What should I read for my concern?" | `POST /api/infer` | `modules/expert_system.py` |
| "Which verses are near this concept?" | `POST /api/bfs` | `modules/search_agent.py` |
| "How does this concept lead to Moksha?" | `POST /api/astar` | `modules/search_agent.py` |
| "Can you make a study plan?" | `POST /api/plan` | `modules/study_planner.py` |
| "How certain is this interpretation?" | `POST /api/cf` | `modules/uncertainty_handler.py` |
| "Find semantically similar verses." | `GET /api/semantic_search` | `embeddings/` + `api.py` |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full pipeline, reasoning traces, and curl examples.

---

## Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1A1A2E', 'primaryTextColor': '#C9A84C', 'primaryBorderColor': '#C9A84C', 'lineColor': '#FF9933', 'secondaryColor': '#16213E', 'background': '#0A0A16', 'mainBkg': '#1A1A2E', 'clusterBkg': '#12122A', 'titleColor': '#F0D060', 'edgeLabelBackground': '#1A1A2E'}}}%%
graph TD
    subgraph INPUT["INPUT LAYER"]
        U["Reader Query\nConcern · Goal · Stage"]
        CSV["Bhagwad_Gita.csv\n701 verses · 18 chapters"]
    end
    subgraph KB["M2 — KNOWLEDGE BASE"]
        TTL["gita_ontology.ttl\nOWL 2 · 658 triples"]
        ONT["16 Classes · 9 Properties\n37 Instances"]
        TTL --> ONT
    end
    subgraph SEARCH["M3 — GRAPH SEARCH"]
        BFS["BFS · O(V+E)"]
        DFS["DFS · O(d)"]
        ASTAR["A* · f=g+h"]
        IDDFS["IDDFS · O(b^d)"]
    end
    subgraph EXPERT["M4 — EXPERT SYSTEM"]
        RULES["8 Production Rules\nForward-chain · Specificity"]
        SPARQL["8 SPARQL CQs\nProperty paths"]
    end
    subgraph CSP["M5 — CSP PLANNER"]
        PLAN["Backtracking + MRV\n7 constraints · 5 sessions"]
    end
    subgraph UNC["M6 — UNCERTAINTY"]
        CF["MYCIN CFs\n3 traditions"]
        FUZZY["Fuzzy sets\n4 yoga paths"]
        NMR["Non-monotonic\nBelief revision"]
    end
    subgraph RAG["M7 — SEMANTIC RAG + LLM"]
        EMBS["sentence-transformers\nall-MiniLM-L6-v2 · 384-dim"]
        OLLAMA["Ollama · Llama 3\nEN / Hindi / Hinglish"]
    end
    subgraph API["FLASK REST API · api.py · :8080"]
        EP["16 Endpoints"]
    end
    subgraph UI["REACT SPA — Digital Bhaṣya 2.0"]
        PAGES["8 Pages · Ancient manuscript UI"]
    end
    U --> EXPERT & SEARCH & RAG
    KB --> SEARCH & EXPERT & CSP & UNC
    CSV --> API
    SEARCH & EXPERT & CSP & UNC & RAG --> API
    API --> UI
    style INPUT fill:#0F3460,stroke:#C9A84C,color:#F0D060
    style KB fill:#16213E,stroke:#9C27B0,color:#F0D060
    style SEARCH fill:#1A2E0D,stroke:#4CAF50,color:#F0D060
    style EXPERT fill:#2E1A0D,stroke:#FF9800,color:#F0D060
    style CSP fill:#2E0D1A,stroke:#E91E63,color:#F0D060
    style UNC fill:#0D2E2E,stroke:#00BCD4,color:#F0D060
    style RAG fill:#0D1A2E,stroke:#2196F3,color:#F0D060
    style API fill:#1A2E1A,stroke:#2ECC71,color:#F0D060
    style UI fill:#2E2E0D,stroke:#FFEB3B,color:#F0D060
```

---

## Key Results

| Query / Algorithm | Result |
|---|---|
| BFS from `NishkamaKarma` (2 hops) | 7 verses: 2.47, 2.48, 2.71, 3.9, 3.19, 3.3, 3.35 |
| DFS downfall chain from `Kama` | Kama → Krodha → Moha → BuddhiNasha |
| A\* `Vairagya` → `Moksha` | 3 hops · cost 3 · **63% fewer expansions than UCS** |
| A\* `DhyanaYoga` → `Moksha` | 3 hops: DhyanaYoga → Samadhi → AtmaJnana → Moksha |
| MYCIN CF · Verse 2.47 / KarmaYoga | Śaṅkara=0.90, Rāmānuja=0.85, Madhva=0.70 → **CF 0.9991** |
| Fuzzy · Verse 6.47 | Bhakti=1.0, Dhyāna=1.0, Jñāna=0.8, Karma=0.6 |
| CSP · Meditation plan | 5 sessions · chapters {2,3,6} covered · **93.6% fewer backtracks** |
| Semantic RAG MAP@5 | **0.837** over all 701 verses |
| OWL transitivity CQ3 | 2 → 4 results (2× recall via `owl:TransitiveProperty`) |

---

## OWL 2 Ontology — Three Special Axioms

```
1. Transitive Property
   leadsTo  owl:TransitiveProperty
   Kama → Krodha → Moha  ⟹  Kama → Moha  (inferred)

2. Symmetric Property
   contrastsWith  owl:SymmetricProperty
   KarmaYoga contrastsWith Sannyasa  ⟹  Sannyasa contrastsWith KarmaYoga

3. Property Chain Axiom (OWL 2 RL)
   teaches ∘ leadsTo  →subPropertyOf→  spirituallyProgressesTo
   Verse teaches NishkamaKarma, NishkamaKarma leadsTo Moksha
     ⟹  Verse spirituallyProgressesTo Moksha  (entailed, not stored)
```

---

## A\* Heuristic

```
h(n) = 0  Attainment        (at goal level)
       1  Practice
       2  YogaPath / EthicalConcept
       3  Guna
       4  DownfallCause      (furthest from liberation)

Trace: Vairagya → ChittaShuddhi → AtmaJnana → Moksha  (g=3, optimal)
```

---

## CSP Constraints (7 Hard)

| # | Constraint |
|---|---|
| C1 | Verse pair shares ≥ 1 philosophical concept |
| C2 | Chapters {2, 3, 6} each appear in ≥ 1 session |
| C3 | Verse 2.62 before Verse 2.63 (prerequisite ordering) |
| C4 | {2.62, 2.63} in the same session (downfall pairing) |
| C5 | No verse repeated across sessions |
| C6 | Goal-specific Chapter 6 verse by session S₃ |
| C7 | Include ≥ 1 Arjuna verse (speaker variety) |

---

## Expert System — 8 Production Rules

| Rule | Condition | Concept → Verse | CF |
|---|---|---|---|
| R1 | anxiety / stress / chinta / चिंता | NishkamaKarma → 2.47 | 0.92 |
| R2 | peace / equanimity / shanti | Sthitaprajna → 2.55 | 0.85 |
| R3 | NishkamaKarma + stage=beginner | Verse 2.47 (specificity 3) | 0.95 |
| R4 | anger / desire / krodha / गुस्सा | Kama chain → Ch. 3 | 0.90 |
| R5 | meditation / dhyana / dhyan | DhyanaYoga → 6.10 | 0.95 |
| R6 | stage=advanced + wisdom | JnanaYoga → Ch. 4 | 0.88 |
| R7 | nature=devotional / bhakti | BhaktiYoga → 6.47 | 0.92 |
| R8 | goal=liberation | Moksha progression | 0.88 |
| R9 | grief / dukh / dard / शोक *(v2.1)* | AtmaJnana → 2.20 | 0.82 |

---

## MYCIN CF Formula

```
Both positive:   CF = CF₁ + CF₂ × (1 − CF₁)
Both negative:   CF = CF₁ + CF₂ × (1 + CF₁)
Mixed sign:      CF = (CF₁ + CF₂) / (1 − min(|CF₁|, |CF₂|))

Verse 2.47 × KarmaYoga:
  Śaṅkara  = 0.90
  Rāmānuja = 0.85   →  combined = 0.9865
  Madhva   = 0.70   →  combined = 0.9991  (Decisive)
```

---

## UI Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Live stats, PEAS framework, 6 module cards |
| Verse Browser | `/verses` | 701 verses · virtual scroll · trilingual · audio · Ollama commentary · verse comparison |
| Knowledge Graph | `/graph` | D3 force-directed · CF-weighted edges · category filter |
| Graph Search | `/search` | BFS / DFS / A\* / IDDFS · iteration trace · concept selector |
| Ask the Gītā | `/ask` | Chat inference · 8 SPARQL CQs · Semantic RAG search |
| Study Planner | `/planner` | CSP plan · flashcard quiz · save to SQLite · print/export |
| Uncertainty | `/uncertainty` | MYCIN CF bars · fuzzy radar · belief revision steps |
| Expert System | `/expert` | Reader profile cards · expandable rule base |

---

## Quick Start

### Option A — One-command local launcher

```bash
pip install -r requirements.txt
python run.py
```

`run.py` starts the Flask API and, when `frontend/node_modules` exists, the Vite frontend. Use `python run.py --api-only` for backend-only testing.

### Option B — Run services manually

#### 1 — Backend

```bash
pip install -r requirements.txt
python api.py
# Flask API at http://127.0.0.1:8080
```

#### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# Dev server at http://localhost:3000
# All /api/* proxied to :8080
```

#### 3 — Semantic Search (recommended)

```bash
# One-time: generates 384-dim embeddings for all 701 verses (~90 MB model)
python generate_embeddings.py
```

#### 4 — Ollama Commentary (optional)

```bash
# Install Ollama: https://ollama.com
ollama pull llama3.2    # ~2 GB, one-time
ollama serve            # http://localhost:11434
```

#### 5 — Audio Recitation (optional, ~3.3 GB)

```bash
python download_audio.py
# Downloads 18 parquet shards from JDhruv14/Bhagavad-Gita_Audio
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Ontology | OWL 2 / RDF Turtle | W3C Rec. |
| Semantic engine | RDFLib + SPARQL 1.1 | 7.0 |
| Graph algorithms | NetworkX | 3.3+ |
| REST API | Flask | 3.0+ |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | 2.7+ |
| Vector search | NumPy cosine similarity | 1.26+ |
| Local LLM | Ollama + Llama 3 Q4\_K\_M | 0.3+ |
| Frontend | React + Vite | 18 / 5.4 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 11 |
| Data fetching | TanStack React Query | v5 |
| Graph viz | D3.js | 7 |
| Typography | Cinzel · EB Garamond · Noto Serif Devanagari | Google Fonts |
| Data | Bhagwad_Gita.csv | 701 verses · 18 chapters |
| Audio | HuggingFace parquet (JDhruv14/Bhagavad-Gita_Audio) | ~3.3 GB |

---

## Project Structure

```
GitaGraph/
├── run.py                   — One-command local launcher for API + React UI
├── api.py                    — Flask REST API · port 8080 · 16 endpoints
├── app.py                    — Legacy Streamlit UI
├── ARCHITECTURE.md           — Pipeline map, module ownership, curl examples
├── generate_embeddings.py    — Builds verse_embeddings.npy (384-dim, 701 verses)
├── download_audio.py         — HuggingFace audio downloader (resume-safe)
├── expand_ontology.py        — LLM-assisted TTL expansion (--dry-run flag)
├── Bhagwad_Gita.csv          — 701 verses · 8 columns · Sanskrit/Hindi/English
├── requirements.txt
│
├── knowledge_base/
│   └── gita_ontology.ttl     — OWL 2 · 874 lines · 658 triples
│
├── modules/
│   ├── knowledge_graph.py    — GitaNode + GitaKnowledgeGraph
│   ├── search_agent.py       — BFS · DFS · A* · IDDFS
│   ├── expert_system.py      — 9 rules · 8 SPARQL CQs · Hindi/Hinglish
│   ├── study_planner.py      — CSP backtracking · MRV · forward checking
│   └── uncertainty_handler.py — MYCIN · Fuzzy · NonMonotonicEngine
│
├── embeddings/
│   ├── verse_embeddings.npy  — float32 · shape (701, 384) · L2-normalised
│   └── verse_index.json      — 701 entries: key, chapter, verse, en/hi/sa
│
├── GitaGraph_Report.tex      — IEEE paper source (XeLaTeX)
├── GitaGraph_Report.pdf      — Compiled 11-page IEEE paper
├── GitaGraph_Report.md       — Markdown version of the paper
│
└── frontend/                 — React 18 SPA
    ├── src/
    │   ├── pages/            — Home · Verses · Graph · Search · Ask
    │   │                       Planner · Uncertainty · Expert
    │   ├── components/ui/    — Badge · Button · Card · CFBar · Gauge
    │   │                       MetricCard · Tabs · EmptyState
    │   └── components/layout/ — Sidebar · PageTransition
    ├── tailwind.config.js    — Gold/saffron/teal/crimson palette · Cinzel font
    └── src/index.css         — Parchment cards · wax-chip · shimmer-text
```

---

## AI Concepts Demonstrated

| Concept | Module | Implementation |
|---|---|---|
| Intelligent Agent (PEAS) | M1 | Goal-based · partial/sequential/static/discrete env |
| OWL 2 Knowledge Representation | M2 | 16 classes · 9 properties · 658 triples |
| TransitiveProperty | M2 | `leadsTo` → CQ3/CQ6 full downfall chain |
| SymmetricProperty | M2 | `contrastsWith` → CQ5 bidirectional |
| Property Chain Axiom | M2 | `teaches ∘ leadsTo → spirituallyProgressesTo` |
| SPARQL | M2/M4 | 8 CQs incl. property paths and CONSTRUCT |
| Breadth-First Search | M3 | O(V+E) · hop-depth annotated reading lists |
| Depth-First Search | M3 | O(d) · causal chain tracer |
| A\* Search | M3 | Admissible h(n) · optimal path to Moksha |
| Iterative Deepening | M3 | BFS completeness + DFS space · UI iteration trace |
| Forward Chaining | M4 | Specificity-ordered · fixpoint convergence |
| Constraint Satisfaction | M5 | Backtracking · 7 hard constraints · 5-session plans |
| MRV Heuristic | M5 | Fail-first variable ordering |
| Forward Checking | M5 | Domain pruning · wipeout detection |
| MYCIN Certainty Factors | M6 | 3 traditions · combined CF up to 0.9991 |
| Fuzzy Logic | M6 | μ(verse, YogaPath) ∈ [0,1] · 4 paths |
| Non-Monotonic Reasoning | M6 | Default logic · belief retraction on new evidence |
| Semantic RAG | M7 | Dense retrieval · cosine similarity · MAP@5 = 0.837 |
| Local LLM | M7 | Ollama Llama 3 · EN/Hindi/Hinglish commentary |

---

## 30-Verse AI Corpus

| Chapter | Title | Verses | Core Concepts |
|---|---|---|---|
| **2 — Sāṅkhya Yoga** | Philosophy of Self | 2.47–2.71 (10 verses) | NishkamaKarma · Sthitaprajna · Downfall chain |
| **3 — Karma Yoga** | Selfless Action | 3.3–3.43 (10 verses) | Svadharma · Guṇas · Yajna |
| **6 — Dhyāna Yoga** | Meditation | 6.5–6.47 (10 verses) | Abhyāsa · Vairāgya · Samādhi |

---

## Team & Contributions

This project was built as an AI Minor Project by students of NIT Kurukshetra.

| Member | GitHub | Module & Responsibilities |
| :--- | :--- | :--- |
| **Ravi Kant Gupta** | [@DevRaviX](https://github.com/DevRaviX) | **Team Lead** · M1 (PEAS); M2 (OWL 2 ontology); M7 (Semantic RAG, Ollama); React SPA |
| **Hariom Rajput** | [@Hariomrajput7049](https://github.com/Hariomrajput7049) | **Expert System** · M4 (9-rule engine, SPARQL CQs, specificity conflict resolution) |
| **Ayushi Choyal** | [@KA1117](https://github.com/KA1117) | **Uncertainty** · M6 (MYCIN CF, fuzzy logic, non-monotonic belief revision) |
| **Shouryavi Awasthi** | [@shouryaviawasthi](https://github.com/shouryaviawasthi) | **Graph & CSP** · M3 (BFS/DFS/A*/IDDFS); M5 (CSP backtracking, MRV, FC) |

---

<div align="center">

*"योगः कर्मसु कौशलम्" — Yoga is excellence in action. (Gītā 2.50)*

Built with devotion by the GitaGraph Team · AI Minor Project · NIT Kurukshetra

</div>
