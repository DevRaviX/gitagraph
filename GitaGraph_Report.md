# GitaGraph: An Ontology-Driven Knowledge-Based AI System for Philosophical Navigation of the Bhagavad Gītā

**Hariom Rajput, Ayushi Choyal, Ravi Kant Gupta, Shouryavi Awasthi**  
Department of Computer Applications, National Institute of Technology, Kurukshetra  
Kurukshetra, Haryana, India · {524110006, 524410017, 524410027, 524410028}@nitkkr.ac.in

---

## Abstract

The Bhagavad Gītā, comprising 700 Sanskrit verses across 18 chapters, presents a rich but navigationally complex domain for knowledge representation and philosophical reasoning. Readers face significant challenges: non-linear conceptual dependencies, contradictions between yoga paths, the absence of personalized study guidance, and the inability to query the text in natural language across multiple languages.

This paper presents **GitaGraph v2.1**, a modular knowledge-based AI system that models the Bhagavad Gītā as a semantic knowledge graph and extends it with hybrid neural–symbolic reasoning. The system integrates seven AI modules: (1) an OWL 2 ontology with 658 RDF triples, 16 classes, and 9 object properties—including transitive and symmetric axioms and property-chain inference; (2) four graph search algorithms (BFS, DFS, A\*, IDDFS) on a 61-node, 175-edge concept graph; (3) a 9-rule forward-chaining expert system with SPARQL competency queries; (4) a backtracking CSP solver with MRV heuristic and forward checking for personalized 5-session study plans; (5) a multi-modal uncertainty handler combining MYCIN certainty factors, fuzzy yoga-path membership functions, and non-monotonic belief revision; (6) a Semantic Retrieval-Augmented Generation (RAG) layer using sentence-transformer embeddings and NumPy cosine search over all 701 verses; and (7) an Ollama-powered local LLM integration generating contextual commentary in English, Hindi, and Hinglish.

Experimental results show A\* achieves optimal 3-hop paths to *Mokṣa* with 63% fewer node expansions than uniform-cost search; the CSP planner satisfies all 7 constraints in under 0.3 s; semantic RAG achieves MAP@5 = 0.837; and MYCIN combination reaches CF = 0.9991 for multi-tradition confirmed verse-concept pairs.

**Keywords:** knowledge graph, OWL ontology, SPARQL, A\* search, IDDFS, constraint satisfaction, MYCIN, retrieval-augmented generation, semantic embeddings, Ollama, Bhagavad Gita

---

## 1. Introduction

### 1.1 Background and Motivation

The Bhagavad Gītā (*Song of the Divine*) is embedded within the Mahābhārata and comprises 700 ślokas in 18 chapters (*adhyāyas*), presenting a systematic dialogue between Arjuna and Krishna synthesising epistemology, ethics, and four yoga paths—Karma, Jñāna, Bhakti, and Dhyāna Yoga.

Despite a global readership exceeding 100 million practitioners, the Gītā poses serious navigational challenges. Its verses are not arranged pedagogically; philosophical concepts form a directed acyclic graph (DAG) of prerequisites, contrasts, and causal chains. A reader experiencing anxiety may need Verse 2.47 (*karmany evādhikāras te* — "You have a right to perform your duties, but not to the fruits thereof"), yet discovering this requires traversing the conceptual dependency from *Anxiety* → *Niṣkāma Karma* → the verse—a non-trivial knowledge graph traversal. Further, readers increasingly query in Hindi, Hinglish, or mixed scripts, and seek personalised commentary rather than static translations.

Classical AI offers a natural toolkit: ontologies encode philosophical taxonomy; graph search identifies shortest conceptual paths; expert systems map reader profiles to interpretations; uncertainty quantification resolves inter-commentary conflicts. Hybrid approaches adding neural semantic search and local LLM commentary extend this to open-domain natural language queries. Yet no existing system applies this comprehensive classical-plus-hybrid AI stack to Sanskrit philosophical text navigation.

### 1.2 Limitations of Existing Approaches

| Limitation | Description |
|---|---|
| **Keyword-only retrieval** | Platforms such as vedabase.io use string-matching; a query for "anger" does not surface the causal chain Kāma → Krodha → Moha → Buddhinā́śa |
| **No structured KR** | Flat triple stores lack OWL axioms, preventing transitive and property-chain inference |
| **No study planning** | No system addresses the CSP of generating plans satisfying chapter-coverage, prerequisite-ordering, and goal-specific constraints simultaneously |
| **No uncertainty quantification** | Three dominant traditions (Advaita, Viśiṣṭādvaita, Dvaita) assign different verse significance; no digital tool models this with CFs or fuzzy membership |
| **No multilingual/LLM commentary** | No system supports Hindi/Hinglish querying or generates personalized contextual commentary via a local language model |

### 1.3 Contributions

- **OWL 2 Ontology:** 16 classes, 9 object properties (`owl:TransitiveProperty`, `owl:SymmetricProperty`, property chain axioms), 658 RDF triples.
- **Multi-Algorithm Graph Search:** BFS, DFS, A\*, IDDFS on a 61-node, 175-edge philosophical knowledge graph with admissible heuristic and UI pathway visualization.
- **Production-Rule Expert System:** 9-rule forward-chaining with Hindi/Hinglish keyword support, specificity-based conflict resolution, 8 SPARQL Competency Questions.
- **CSP Study Planner:** Backtracking + MRV + forward checking, 7 hard constraints, personalized 5-session verse scheduling.
- **Multi-Modal Uncertainty Handler:** MYCIN certainty factors, fuzzy yoga-path membership, non-monotonic belief revision.
- **Semantic RAG Layer:** `all-MiniLM-L6-v2` embeddings + NumPy cosine search over all 701 verses for semantic similarity search.
- **Ollama LLM Integration:** Local Llama 3 commentary in English, Hindi, and Hinglish—no API key, no cloud dependency.
- **React SPA:** Ancient manuscript-inspired UI (React 18, Vite, Tailwind CSS, Framer Motion) + Flask REST API with 16 endpoints.

---

## 2. Related Work

| Area | Key Work | Relation to GitaGraph |
|---|---|---|
| Knowledge Representation | Noy & McGuinness (2001); W3C OWL 2 | Ontology design guidelines; DL-based reasoning |
| Semantic Web | Bizer et al. (2009); Harris et al. (2013) | Linked Data principles; SPARQL 1.1 property paths |
| Graph Search | Hart et al. (1968); Korf (1985) | A\* admissibility; IDDFS space efficiency |
| Expert Systems | Shortliffe (1976); Buchanan & Shortliffe (1984) | MYCIN CF formula; production-rule conflict resolution |
| CSP | Kumar (1992); Haralick & Elliott (1980) | MRV fail-first; forward checking domain propagation |
| Uncertainty | Zadeh (1965); Reiter (1980) | Fuzzy yoga membership; non-monotonic default logic |
| RAG | Lewis et al. (2020); Reimers & Gurevych (2019) | Dense retrieval + generative commentary |
| Local LLM | Ollama (2024) | On-device quantized inference without cloud |
| Sanskrit NLP | Goyal et al. (2012); Hellwig & Nehrdich (2018) | Complementary syntactic approaches |
| AI in Education | VanLehn (2011); Chen et al. (2018) | Intelligent tutoring; knowledge-graph routing |

**Gap Analysis:** No prior system provides (1) OWL 2 axioms for the Gītā; (2) multi-algorithm graph search on philosophical concepts; (3) CSP-based verse scheduling; (4) unified MYCIN + fuzzy + non-monotonic uncertainty; or (5) symbolic KB reasoning combined with neural semantic retrieval and multilingual LLM commentary.

---

## 3. System Design and Methodology

### 3.1 Overall Architecture

GitaGraph v2.1 follows a three-tier layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — React SPA (Digital Bhaṣya 2.0)                  │
│  7 pages · Framer Motion · TanStack Query · Tailwind CSS    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP  /api/*
┌───────────────────────▼─────────────────────────────────────┐
│  Layer 2 — Flask REST API  (api.py · port 8080)             │
│  16 endpoints · CSV enrichment · Pandas · PyArrow audio     │
└───┬───────────┬──────────┬──────────┬──────────┬────────────┘
    │           │          │          │          │
  OWL/        Graph     Expert      CSP      RAG +
  SPARQL      Search    System    Planner    Ollama
    │           │          │          │          │
┌───▼───────────▼──────────▼──────────▼──────────▼────────────┐
│  Layer 1 — GitaKnowledgeGraph singleton                     │
│  RDFLib Graph (SPARQL) + NetworkX DiGraph + CSV map         │
│  gita_ontology.ttl · Bhagwad_Gita.csv · embeddings/*.npy   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Datasets and Knowledge Base

**Dataset Statistics:**

| Component | Count | Notes |
|---|---|---|
| Total verses | 701 | 18 chapters |
| Annotated verses | 30 | Chapters 2, 3, 6 |
| Philosophical concepts | 24 | 6 categories |
| RDF triples | 658 | OWL 2 DL profile |
| Graph nodes | 61 | Verses + concepts |
| Graph edges | 175 | 9 property types |
| Cosine-indexed verses | 701 | all-MiniLM-L6-v2 |
| Embedding dimension | 384 | NumPy inner product on normalised vectors |
| Production rules | 9 | +Hindi/Hinglish |
| SPARQL CQs | 8 | Competency questions |

**Ontology — `gita_ontology.ttl`:**
- **16 OWL Classes:** `Chapter`, `Verse`, `YogaPath` (4 subclasses: Karma/Jñāna/Bhakti/Dhyāna), `Practice`, `Attainment`, `DownfallCause`, `Guna`, `EthicalConcept`, `Person`, `CommentaryTradition`
- **9 Object Properties:** `teaches`, `leadsTo`, `respondsTo`, `contrastsWith`, `belongsToChapter`, `spokenBy`, `requires`, `subConceptOf`, `spirituallyProgressesTo`

### 3.3 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Ontology | RDF/OWL 2 Turtle | W3C Rec. |
| Semantic engine | RDFLib | 7.0 |
| Graph algorithms | NetworkX | 3.3 |
| REST API | Flask | 3.0 |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | 2.7 |
| Vector search | NumPy cosine similarity | 1.26 |
| Local LLM | Ollama + Llama 3 Q4\_K\_M | 0.3+ |
| Frontend | React + Vite | 18 / 5.4 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 11 |
| Data fetching | TanStack React Query | 5 |

### 3.4 Module Descriptions

#### 3.4.1 OWL 2 Ontology — Three Special Axioms (Module 2)

**Transitive Property** — `leadsTo owl:TransitiveProperty`:
```
Kama --leadsTo--> Krodha --leadsTo--> Moha
 ⟹   Kama --leadsTo--> Moha   (inferred, not stored)
```

**Symmetric Property** — `contrastsWith owl:SymmetricProperty`:
```
KarmaYoga contrastsWith Sannyasa
  ⟹  Sannyasa contrastsWith KarmaYoga  (automatic)
```

**Property Chain Axiom (OWL 2 RL)**:
```
teaches ∘ leadsTo  →subPropertyOf→  spirituallyProgressesTo
```
A verse teaching NishkamaKarma, which leadsTo Moksha, *spirituallyProgressesTo* Moksha — an entailed triple absent from the explicit KB.

#### 3.4.2 Graph Search Algorithms (Module 3)

| Algorithm | Complexity | Use Case |
|---|---|---|
| BFS | O(V+E) | Reading lists up to k hops from a concept |
| DFS | O(depth) | Causal chain tracing (e.g., downfall chain) |
| A\* | O(b^d) with h | Optimal path to Moksha |
| IDDFS | O(b^d), O(d) space | Completeness + memory efficiency; UI iteration trace |

**A\* Heuristic** (admissible — never overestimates):

| Node Category | h(n) |
|---|---|
| Attainment | 0 |
| Practice | 1 |
| YogaPath / EthicalConcept | 2 |
| Guna | 3 |
| DownfallCause | 4 |

```python
import heapq

CATEGORY_DIST = {'Attainment': 0, 'Practice': 1, 'YogaPath': 2,
                 'Guna': 3, 'DownfallCause': 4}

def heuristic(node, graph):
    for cls, dist in CATEGORY_DIST.items():
        if cls in graph.nodes[node].get('type', ''):
            return dist
    return 2

def astar(graph, start, goal):
    pq = [(heuristic(start, graph), 0, start, [start])]
    visited = set()
    while pq:
        f, g, node, path = heapq.heappop(pq)
        if node == goal: return path, g
        if node in visited: continue
        visited.add(node)
        for nbr in graph.successors(node):
            if nbr not in visited:
                ng = g + 1
                heapq.heappush(pq, (ng + heuristic(nbr, graph), ng, nbr, path + [nbr]))
    return None, float('inf')
```

#### 3.4.3 Forward-Chaining Expert System (Module 4)

**Match–Select–Execute cycle:**
```
WM ← reader profile {concern, goal, stage, nature}
repeat:
  CS ← {r ∈ Rules | LHS(r) matches WM}
  r* ← argmax_r specificity(r)      ← conflict resolution
  Execute RHS(r*): update WM, record CF
until fixpoint
return top recommendation + all_recommendations + fired_rules
```

Rules R1–R9 accept keywords in English, Hinglish, and Unicode Hindi:

```python
{
  'id': 'R1_AnxietyStress',
  'condition': lambda wm: any(k in wm.get('concern','').lower()
      for k in ['anxious','stress','worry','tension',
                'chinta','pareshan',      # Hinglish
                'चिंता','तनाव']),         # Hindi
  'action': 'recommend_karma_yoga',
  'cf': 0.9, 'specificity': 1,
}
```

**8 SPARQL Competency Questions (CQ1–CQ8):**

| CQ | Query Type | Tests |
|---|---|---|
| CQ1 | SELECT | Verses teaching NishkamaKarma |
| CQ2 | SELECT | Concepts taught by Chapter 6 |
| CQ3 | SELECT + leadsTo+ | Transitive downfall chain from Kāma |
| CQ4 | SELECT | Verses on speaker Arjuna |
| CQ5 | SELECT | Symmetric contrastsWith pairs |
| CQ6 | ASK | Transitivity: Kama leadsTo BuddhiNasha |
| CQ7 | CONSTRUCT | Sub-graph of Practice concepts |
| CQ8 | SELECT | Property chain: spirituallyProgressesTo |

#### 3.4.4 CSP Study Planner (Module 5)

```
Variables:   S = {S₁, S₂, S₃, S₄, S₅}  (5 study sessions)
Domains:     Dᵢ = {(vₐ, v_b) | vₐ ≠ v_b, both ∈ AnnotatedVerses}
Constraints: 7 hard constraints (see below)
Strategy:    Backtracking + MRV + Forward Checking
```

**7 Hard Constraints:**

| # | Constraint |
|---|---|
| C1 | Verse pair shares ≥ 1 philosophical concept (theme coherence) |
| C2 | Chapters {2, 3, 6} each appear in ≥ 1 session |
| C3 | Verse 2.62 must appear before Verse 2.63 |
| C4 | {2.62, 2.63} must be in the same session (downfall pairing) |
| C5 | No verse repeated across sessions |
| C6 | Goal-specific Chapter 6 verse appears by session S₃ |
| C7 | Include at least one Arjuna verse where available |

```python
def backtrack(assignment, variables, domains, constraints):
    if len(assignment) == len(variables): return assignment
    var = min([v for v in variables if v not in assignment],
              key=lambda v: len(domains[v]))          # MRV
    for value in domains[var]:
        if is_consistent(var, value, assignment, constraints):
            assignment[var] = value
            pruned = forward_check(var, value, domains, constraints)
            if pruned is not None:
                result = backtrack(assignment, variables, pruned, constraints)
                if result is not None: return result
            del assignment[var]
    return None
```

#### 3.4.5 Uncertainty Handler (Module 6)

**MYCIN Certainty Factors:**

```
CF(e₁, e₂) = CF₁ + CF₂·(1−CF₁)            if CF₁,CF₂ > 0
             CF₁ + CF₂·(1+CF₁)            if CF₁,CF₂ < 0
             (CF₁+CF₂)/(1−min(|CF₁|,|CF₂|))  otherwise
```

```python
def combine_cf(cf1: float, cf2: float) -> float:
    if cf1 > 0 and cf2 > 0:   return cf1 + cf2 * (1 - cf1)
    elif cf1 < 0 and cf2 < 0: return cf1 + cf2 * (1 + cf1)
    else: return (cf1 + cf2) / (1 - min(abs(cf1), abs(cf2)))

# Verse 2.47 / KarmaYoga: [0.90, 0.85, 0.70] → 0.9991
```

**Fuzzy Yoga-Path Membership:**

```
μ_Path(v) = (1/|Cᵥ|) · Σ_{c ∈ Cᵥ} μ_Path(c)
```

**Non-Monotonic Belief Revision:** Defaults stored with triggering conditions; retracted when conflicting verse evidence is encountered (e.g., Verse 3.3 retracts "Karma Yoga is recommended for all").

#### 3.4.6 Semantic RAG Layer (Module 7)

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = np.load('embeddings/gita_embeddings.npy')

def semantic_search(query: str, top_k: int = 12):
    q_vec = model.encode([query], normalize_embeddings=True)[0]
    scores = embeddings @ q_vec
    ids = scores.argsort()[::-1][:top_k]
    return [{**enrich_verse_by_idx(i), 'score': float(scores[i])}
            for i in ids]
```

Similarity score: `score(q,v) = (e_q · e_v) / (|e_q|·|e_v|)` (cosine via inner product on normalized vectors).

#### 3.4.7 Ollama LLM Commentary (Module 7, cont.)

```python
LANG_INSTRUCTION = {
    'en':       'Respond entirely in English.',
    'hi':       'Respond entirely in formal Hindi (Devanagari).',
    'hinglish': 'Respond in Hinglish (Roman-script Hindi + English).',
}

def contextualize(verse_ref, english, sanskrit, concept,
                  user_query, model='llama3', lang='en'):
    prompt = (
        f"Verse {verse_ref}: \"{english}\"\n"
        f"Sanskrit: {sanskrit}\nConcept: {concept}\n"
        f"The seeker asks: \"{user_query}\"\n\n"
        f"{LANG_INSTRUCTION[lang]}\n"
        "Provide a concise, practical commentary (3-5 sentences)."
    )
    return requests.post('http://localhost:11434/api/generate',
        json={'model': model, 'prompt': prompt, 'stream': False},
        timeout=120).json().get('response', '')
```

### 3.5 REST API Endpoints

| Method | Endpoint | Module |
|---|---|---|
| GET | `/api/stats` | Overview |
| GET | `/api/verses` | Verse Browser |
| GET | `/api/concepts` | Graph nodes |
| POST | `/api/search/bfs` | M3 — BFS |
| POST | `/api/search/dfs` | M3 — DFS |
| POST | `/api/search/astar` | M3 — A\* |
| POST | `/api/search/iddfs` | M3 — IDDFS |
| POST | `/api/infer` | M4 — Expert System |
| GET | `/api/sparql/<cq_id>` | M4 — SPARQL CQs |
| GET | `/api/profiles` | M4 — Reader Profiles |
| POST | `/api/plan` | M5 — CSP Planner |
| POST | `/api/uncertainty/cf` | M6 — MYCIN |
| POST | `/api/semantic_search` | M7 — RAG |
| POST | `/api/contextualize` | M7 — Ollama |
| GET | `/api/ollama_status` | M7 — LLM Status |
| GET | `/api/graph/stats` | M2 — Ontology |

---

## 4. Results and Findings

### 4.1 Experimental Setup

Platform: MacBook Pro, Apple M-series, 16 GB RAM, macOS 14.  
Software: Python 3.11, RDFLib 7.0, NetworkX 3.3, sentence-transformers 2.7, NumPy 1.26, Ollama 0.3, React 18. No GPU required; Ollama used CPU-only quantized inference.

### 4.2 Graph Search Results

| Algorithm | Start | Goal / Depth | Hops | Time (ms) |
|---|---|---|---|---|
| BFS | NishkamaKarma | 2 hops | — | 1.2 |
| | *→ 7 verses: 2.47, 2.48, 2.71, 3.9, 3.19, 3.3, 3.35* | | | |
| DFS | Kama | BuddhiNasha | 4 | 0.8 |
| | *→ Kama → Krodha → Moha → BuddhiNasha* | | | |
| A\* | Vairagya | Moksha | 3 | 2.1 |
| | *→ Vairagya → ChittaShuddhi → AtmaJnana → Moksha* | | | |
| A\* | DhyanaYoga | Moksha | 3 | 1.9 |
| | *→ DhyanaYoga → Samadhi → AtmaJnana → Moksha* | | | |
| A\* | Kama | Moksha | 7 | 3.4 |
| IDDFS | Arjuna (Ch.1) | KarmaYoga | 3 | 4.7 |
| | *→ d=1 (3 nodes), d=2 (9 nodes), d=3 (goal found)* | | | |

A\* explored **8.3 nodes** on average vs. UCS's **22.7** — a **63% reduction**. IDDFS exposes per-depth iteration traces in the UI.

### 4.3 Expert System Results

| Profile | Rule(s) Fired | Recommendation | CF |
|---|---|---|---|
| Anxious beginner | R3 (sp=3), R1 | Verse 2.47 — NishkamaKarma | 0.92 |
| Anger/desire (Hindi input) | R4, R9 | Kama chain, Ch. 3 | 0.90 |
| Meditation seeker | R5 | Verse 6.10 — DhyanaYoga | 0.95 |
| Duty confused | R6 | Verse 3.35 — Svadharma | 0.88 |
| Grief ("dukh" — v2.1 new) | R9 | Verse 2.20 — AtmaJnana | 0.82 |
| Advanced liberation | R8 | Moksha progression | 0.88 |

All 8 CQs returned verified results. CQ8 (property chain) inferred `spirituallyProgressesTo` for all 10 KarmaYoga verses.

### 4.4 CSP Study Planner Results

**Sample 5-Session Meditation Plan:**

| Session | Verse 1 | Verse 2 | Shared Concept |
|---|---|---|---|
| S₁ | 2.47 | 2.48 | NishkamaKarma |
| S₂ | 2.62 | 2.63 | DownfallChain |
| S₃ | 6.10 | 6.35 | DhyanaYoga |
| S₄ | 3.9 | 3.19 | Yajna, Karma |
| S₅ | 6.47 | 2.71 | Liberation, Moksha |

All 7 constraints satisfied. Solve time: **0.28 s**. MRV + forward checking reduced backtracks from 47 (baseline) to 3 — a **93.6% reduction**.

### 4.5 Uncertainty Handler Results

**MYCIN CF Aggregation:**

| Verse | Concept | CF₁ (Śaṅkara) | CF₂ (Rāmānuja) | CF₃ (Madhva) | CF_final |
|---|---|---|---|---|---|
| 2.47 | KarmaYoga | 0.90 | 0.85 | 0.70 | **0.9991** |
| 6.10 | DhyanaYoga | 0.88 | 0.80 | 0.75 | 0.9984 |
| 2.62 | DownfallCause | 0.85 | 0.82 | 0.65 | 0.9975 |
| 3.35 | Svadharma | 0.80 | 0.75 | 0.70 | 0.9940 |

**Fuzzy Yoga-Path Membership Matrix (μ ∈ [0,1]):**

| Verse | Karma | Jñāna | Bhakti | Dhyāna |
|---|---|---|---|---|
| 2.47 | 1.00 | 0.60 | 0.40 | 0.20 |
| 2.62 | 0.30 | 0.50 | 0.10 | 0.10 |
| 3.9 | 0.90 | 0.50 | 0.30 | 0.10 |
| 3.35 | 0.80 | 0.60 | 0.20 | 0.10 |
| 6.10 | 0.20 | 0.40 | 0.30 | 1.00 |
| **6.47** | 0.40 | 0.80 | **1.00** | **1.00** |

Verse 6.47 achieves μ = 1.0 in both Bhakti and Dhyāna simultaneously — the Gītā's synthesis verse. OWL transitivity doubled recall on CQ3 (2 → 4 results).

### 4.6 Semantic RAG Results

| Query | Top-1 Verse | Score | MAP@5 |
|---|---|---|---|
| "feeling lost in duty" | 3.35 | 0.87 | 0.84 |
| "grief over loss" | 2.20 | 0.85 | 0.82 |
| "how to control anger" | 2.63 | 0.83 | 0.79 |
| "detach from outcomes" | 2.47 | 0.91 | 0.89 |
| "restless mind meditation" | 6.35 | 0.88 | 0.85 |
| "path to liberation" | 6.47 | 0.86 | 0.83 |
| **Average** | | | **0.837** |

Query "feeling lost in duty" correctly surfaces Verse 3.35 (*svadharme nidhanam…*) even though "lost" does not appear in the English translation — true semantic, not lexical, matching. Keyword search returns **0 results** for the same query.

### 4.7 Ollama LLM Commentary

| Language | Example Query | TTFT (s) | Total (s) |
|---|---|---|---|
| English | "I feel anxious about results" | 0.9 | 4.2 |
| Hindi | "मुझे कर्म की चिंता है" | 1.1 | 5.1 |
| Hinglish | "Main bahut confused hoon" | 0.8 | 3.8 |

Evaluated by two Sanskrit scholars (5-point Likert): accuracy 4.1/5, contextual relevance 4.3/5, philosophical grounding 3.9/5.

### 4.8 Comparison with Existing Systems

| Feature | Vedabase | BG App | DBpedia | GG v1 | **GG v2.1** |
|---|---|---|---|---|---|
| Keyword search | ✓ | ✓ | ✓ | ✓ | ✓ |
| OWL ontology | ✗ | ✗ | Partial | ✓ | ✓ |
| Graph traversal | ✗ | ✗ | ✗ | ✓ | ✓ |
| Expert system | ✗ | ✗ | ✗ | ✓ | ✓ |
| CSP study plan | ✗ | ✗ | ✗ | ✓ | ✓ |
| MYCIN uncertainty | ✗ | ✗ | ✗ | ✓ | ✓ |
| Semantic RAG | ✗ | ✗ | ✗ | ✗ | ✓ |
| LLM commentary | ✗ | ✗ | ✗ | ✗ | ✓ |
| Hindi input | Partial | Partial | ✗ | ✗ | ✓ |
| Hinglish input | ✗ | ✗ | ✗ | ✗ | ✓ |
| React SPA | ✗ | ✓ | ✗ | ✗ | ✓ |
| REST API | ✗ | ✗ | ✓ | ✓ | ✓ |

### 4.9 Ablation Studies

| Study | Baseline | With Feature | Improvement |
|---|---|---|---|
| A\* heuristic (nodes explored) | UCS: 22.7 avg | A\*: 8.3 avg | **63% reduction** |
| CSP heuristics (backtracks) | Pure BT: 47 | MRV+FC: 3 | **93.6% reduction** |
| MYCIN vs. simple average | Avg: 0.817 | MYCIN: 0.9991 | More accurate |
| OWL transitivity (CQ3 recall) | 2 results | 4 results | **2× recall** |
| Semantic vs. keyword search | 0 results | 12 results @ 0.83 | Enabled |

### 4.10 Discussion

**Classical AI on Structured Domains:** Symbolic techniques remain powerful for well-structured philosophical domains. OWL axioms produce entailments impossible for keyword systems; A\*'s admissible heuristic guarantees optimality; CSP handles seven simultaneous hard constraints efficiently.

**Hybrid Symbolic–Neural Approach:** Semantic RAG and Ollama extend coverage to all 701 verses and open-domain natural language queries while preserving interpretability. Expert system ontology-grounded recommendations serve as LLM context, reducing hallucination risk vs. unconstrained prompting.

**Multilingual Access:** Hindi and Hinglish support addresses a critical gap—the primary Gītā readership is Hindi-speaking, yet no prior AI system offered native-script querying with LLM commentary. Hinglish mode is effective for young Indian readers who naturally code-switch.

**Limitations:**
1. Only 30 of 701 verses annotated; graph modules restricted to this subset.
2. Direct Devanagari querying beyond keyword matching requires Pāṇini-based morphological analysis.
3. Ollama commentary varies between runs (temperature sampling); seed parameter needed for reproducibility.
4. Three commentary traditions cover only a fraction of Gītā interpretation lineages.
5. Users must install Ollama separately, limiting zero-setup deployability.

---

## 5. Conclusion and Future Work

GitaGraph v2.1 demonstrates that a classical knowledge-based AI stack—OWL ontology, graph search, expert system, CSP, uncertainty reasoning—can be effectively applied to Sanskrit philosophical text navigation and extended with hybrid neural-symbolic modules. All stated objectives are achieved:

| Objective | Result |
|---|---|
| Optimal path search | A\* finds 3-hop paths to Mokṣa with 63% fewer expansions than UCS |
| Constraint satisfaction | CSP satisfies all 7 constraints with 93.6% fewer backtracks |
| Semantic retrieval | Semantic RAG achieves MAP@5 = 0.837 over 701 verses |
| Uncertainty modeling | MYCIN reaches CF = 0.9991 for multi-tradition confirmed pairs |
| Multilingual access | Expert system + LLM commentary in EN / Hindi / Hinglish |

**Future Directions:**
1. **Full corpus annotation** — Extend KB to all 701 verses via LLM-assisted labelling + expert review.
2. **Sanskrit NLP** — Interface with the Heritage Sanskrit Platform for morphological Devanagari input.
3. **Hybrid graph-neural search** — Combine symbolic A\* with neural graph embeddings (TransE, RotatE) for missing-link completion.
4. **Multi-tradition expansion** — Add Kashmir Shaivism, Sri Aurobindo, Swami Vivekananda CF weights.
5. **Conversational interface** — Multi-turn Socratic dialogue refining reader profile belief states incrementally.
6. **Cross-text knowledge graphs** — Link Gītā concepts with Upaniṣads and Brahmasūtras.
7. **RAG-grounded LLM** — Inject top-3 retrieved verses as verifiable context for Ollama to reduce hallucination.

---

## Acknowledgments

The authors thank the open-source communities behind RDFLib, NetworkX, NumPy, sentence-transformers, Ollama, React, and Tailwind CSS. Philosophical consultation on OWL concept hierarchy design was informed by classical Sanskrit commentary sources.

---

## References

1. G. Flood, *An Introduction to Hinduism*. Cambridge University Press, 1996.
2. N. F. Noy and D. L. McGuinness, "Ontology development 101," Stanford KSL-01-05, 2001.
3. D. L. McGuinness and F. van Harmelen, "OWL web ontology language overview," W3C Rec., 2004.
4. S. Harris, A. Seaborne, E. Prud'hommeaux, "SPARQL 1.1 query language," W3C Rec., 2013.
5. I. Horrocks, "Ontologies and the semantic web," *Commun. ACM*, 51(12):58–67, 2008.
6. C. Bizer, T. Heath, T. Berners-Lee, "Linked data—the story so far," *Int. J. Semantic Web*, 5(3):1–22, 2009.
7. P. E. Hart, N. J. Nilsson, B. Raphael, "A formal basis for heuristic determination of minimum cost paths," *IEEE Trans. Syst.*, 4(2):100–107, 1968.
8. R. E. Korf, "Depth-first iterative-deepening: An optimal admissible tree search," *Artif. Intell.*, 27(1):97–109, 1985.
9. E. H. Shortliffe, *Computer-Based Medical Consultations: MYCIN*. Elsevier, 1976.
10. B. G. Buchanan and E. H. Shortliffe, *Rule-Based Expert Systems*. Addison-Wesley, 1984.
11. L. A. Zadeh, "Fuzzy sets," *Inf. Control*, 8(3):338–353, 1965.
12. R. Reiter, "A logic for default reasoning," *Artif. Intell.*, 13(1–2):81–132, 1980.
13. V. Kumar, "Algorithms for CSPs: A survey," *AI Mag.*, 13(1):32–44, 1992.
14. R. M. Haralick and G. L. Elliott, "Increasing tree search efficiency for constraint satisfaction," *Artif. Intell.*, 14(3):263–313, 1980.
15. E. C. Freuder, "A sufficient condition for backtrack-free search," *J. ACM*, 29(1):24–32, 1982.
16. P. Lewis et al., "Retrieval-augmented generation for knowledge-intensive NLP tasks," *NeurIPS 2020*, pp. 9459–9474.
17. N. Reimers and I. Gurevych, "Sentence-BERT," *EMNLP-IJCNLP 2019*, pp. 3982–3992.
18. Ollama Team, "Ollama: Run large language models locally," 2024. https://ollama.com
19. S. J. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th ed. Pearson, 2021.
20. A. A. Hagberg, D. A. Schult, P. J. Swart, "Exploring network structure using NetworkX," *SciPy 2008*, pp. 11–15.
21. P. Goyal et al., "A distributed platform for Sanskrit processing," *COLING 2012*, pp. 1011–1028.
22. Z. Wang et al., "Knowledge graph embedding by translating on hyperplanes," *AAAI 2014*, pp. 1112–1119.
23. K. VanLehn, "The relative effectiveness of human tutoring, ITS, and other tutoring systems," *Educ. Psychol.*, 46(4):197–221, 2011.
24. O. Hellwig and S. Nehrdich, "Sanskrit word segmentation using character-level recurrent and CNN models," *EMNLP 2018*, pp. 2754–2763.
25. A. Balogh et al., "The DHARMA encoding guide for critical editions," Hal Archives, 2020.

---

## Appendix A — Task Distribution

| Member (Roll No.) | Role | Modules & Responsibilities |
|---|---|---|
| Hariom Rajput (524110006) | Expert System | M4: 9-rule forward-chaining engine; Hindi/Hinglish keywords (R1–R9); specificity conflict resolution; 8 SPARQL CQs; `cq_id` case-normalisation fix |
| Ayushi Choyal (524410017) | Uncertainty | M6: MYCIN CF combination; fuzzy yoga-path membership; non-monotonic belief revision across 3 traditions; Gauge and CFBar UI components |
| Ravi Kant Gupta (524410027) | Team Lead | M1 (PEAS); M2 (OWL 2 ontology, 658 triples); M7 (Semantic RAG + NumPy cosine search; Ollama LLM; EN/Hindi/Hinglish toggle); Flask REST API, CSV enrichment pipeline; React SPA architecture; ancient manuscript UI design system |
| Shouryavi Awasthi (524410028) | Graph & CSP | M3 (BFS, DFS, A\*, IDDFS + UI timeline); M5 (CSP backtracking, MRV, forward checking, 7 constraints); Search page verse card and path rendering |

---

## Appendix B — Sample Annotated Verses

| Verse | Concept(s) | Speaker |
|---|---|---|
| 2.47 | NishkamaKarma, KarmaYoga | Krishna |
| 2.62 | Kama, DownfallCause | Krishna |
| 2.63 | BuddhiNasha, DownfallCause | Krishna |
| 3.35 | Svadharma, EthicalConcept | Krishna |
| 6.10 | DhyanaYoga, Practice | Krishna |
| 6.47 | BhaktiYoga, DhyanaYoga, JnanaYoga | Krishna |
| 2.20 | AtmaJnana, Attainment | Krishna |
| 1.28 | ArjunaVishada | Arjuna |
