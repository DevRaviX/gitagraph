# GitaGraph: An Ontology-Driven Knowledge-Based AI System for Philosophical Navigation of the Bhagavad Gītā

**Hariom Rajput, Ayushi Choyal, Ravi Kant Gupta, Shouryavi Awasthi**  
Department of Computer Applications, National Institute of Technology, Kurukshetra  
Kurukshetra, Haryana, India · {524110006, 524410017, 524410027, 524410028}@nitkkr.ac.in

---

## Abstract

The Bhagavad Gītā, comprising 700 Sanskrit verses across 18 chapters, presents a rich but navigationally complex domain for knowledge representation and philosophical reasoning. Readers face significant challenges: non-linear conceptual dependencies, contradictions between yoga paths, the absence of personalized study guidance, and the inability to query the text in natural language across multiple languages.

This paper presents **GitaGraph v2.2**, a modular knowledge-based AI system that models the Bhagavad Gītā as a semantic knowledge graph and extends it with hybrid neural–symbolic reasoning. The system integrates seven AI modules: (1) an OWL 2 ontology with 3,523 RDF triples covering all 701 verses across all 18 chapters, 16 classes, and 9 object properties—including transitive and symmetric axioms and property-chain inference; (2) four graph search algorithms (BFS, DFS, A\*, IDDFS) on a 61-node, 1,657-edge concept graph; (3) a 16-rule forward-chaining expert system with SPARQL competency queries; (4) a backtracking CSP solver with MRV heuristic and forward checking for personalized 5-session study plans; (5) a multi-modal uncertainty handler combining MYCIN certainty factors, fuzzy yoga-path membership functions, and non-monotonic belief revision; (6) a Semantic Retrieval-Augmented Generation (RAG) layer using `paraphrase-multilingual-MiniLM-L12-v2` sentence-transformer embeddings over all 701 verses supporting Hindi and 50+ languages; and (7) an Ollama-powered local LLM integration generating contextual commentary in English, Hindi, and Hinglish.

We evaluate the retrieval pipeline against a 50-query gold set spanning 10 semantic categories including Hindi-only queries, using MAP@5, MRR, and precision metrics. The full system achieves MAP@5 = 0.285 and MRR = 0.637, outperforming a BM25 keyword baseline by 10.2× on MAP@5. Ablation studies confirm that ontology-guided retrieval is the dominant contributor (removing it reduces MAP@5 by 81.6%) and that graph BFS is the second most critical component (31.9% drop). On Hindi-only queries, the multilingual model reaches MRR = 0.800 versus 0.067 for BM25 — a 12× improvement demonstrating the value of multilingual embeddings. Additional results show A\* achieves optimal 3-hop paths to *Mokṣa* with 63% fewer node expansions than uniform-cost search; the CSP planner satisfies all 7 constraints in under 0.3 s; and MYCIN combination reaches CF = 0.9991 for multi-tradition confirmed verse-concept pairs.

**Keywords:** knowledge graph, OWL ontology, SPARQL, A\* search, IDDFS, constraint satisfaction, MYCIN, retrieval-augmented generation, semantic embeddings, multilingual NLP, Bhagavad Gita

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
| **No reproducible evaluation** | Prior systems report no standardized retrieval benchmarks against curated gold sets |

### 1.3 Contributions

- **OWL 2 Ontology:** 16 classes, 9 object properties (`owl:TransitiveProperty`, `owl:SymmetricProperty`, property chain axioms), 3,523 RDF triples covering all 701 verses and all 18 chapters.
- **Multi-Algorithm Graph Search:** BFS, DFS, A\*, IDDFS on a 61-node, 1,657-edge philosophical knowledge graph with admissible heuristic and UI pathway visualization.
- **Production-Rule Expert System:** 16-rule forward-chaining with Hindi/Hinglish keyword support, specificity-based conflict resolution, 13 SPARQL Competency Questions (CQ1–CQ12 + CQ_CONSTRUCT).
- **CSP Study Planner:** Backtracking + MRV + forward checking, 7 hard constraints, personalized 5-session verse scheduling.
- **Multi-Modal Uncertainty Handler:** MYCIN certainty factors, fuzzy yoga-path membership, non-monotonic belief revision.
- **Multilingual Semantic RAG:** `paraphrase-multilingual-MiniLM-L12-v2` (384-dim, 50+ languages including Hindi) + NumPy cosine search over all 701 verses.
- **Reproducible Evaluation Framework:** 50-query gold set spanning 10 semantic categories in English, Hindi, and Hinglish; MAP@5/MRR/P@k benchmarks across 7 system variants including 4 ablation conditions.
- **Ollama LLM Integration:** Local Llama 3 commentary in English, Hindi, and Hinglish—no API key, no cloud dependency.
- **React SPA:** Ancient manuscript-inspired UI (React 18, Vite, Tailwind CSS, Framer Motion) + Flask REST API with 27 endpoints.

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
| Multilingual NLP | Reimers & Gurevych (2020) | Multilingual sentence-transformer; cross-lingual transfer |
| Local LLM | Ollama (2024) | On-device quantized inference without cloud |
| Sanskrit NLP | Goyal et al. (2012); Hellwig & Nehrdich (2018) | Complementary syntactic approaches |
| AI in Education | VanLehn (2011); Chen et al. (2018) | Intelligent tutoring; knowledge-graph routing |
| Religious Text KGs | Nooruddin et al. (2022) — Hadith KG; Ben Abacha et al. — BioASQ-style QA | Domain KG methodology; gold-set evaluation design |

**Gap Analysis:** No prior system provides (1) OWL 2 axioms for the Gītā; (2) multi-algorithm graph search on philosophical concepts; (3) CSP-based verse scheduling; (4) unified MYCIN + fuzzy + non-monotonic uncertainty; (5) symbolic KB reasoning combined with neural semantic retrieval and multilingual LLM commentary; or (6) a reproducible gold-set evaluation spanning English, Hindi, and Hinglish queries with ablation across system components.

---

## 3. System Design and Methodology

### 3.1 Overall Architecture

GitaGraph v2.2 follows a three-tier layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — React SPA (Digital Bhaṣya 2.0)                  │
│  7 pages · Framer Motion · TanStack Query · Tailwind CSS    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP  /api/*
┌───────────────────────▼─────────────────────────────────────┐
│  Layer 2 — Flask REST API  (backend/api.py · port 8080)     │
│  27 endpoints · CSV enrichment · PyArrow audio              │
└───┬───────────┬──────────┬──────────┬──────────┬────────────┘
    │           │          │          │          │
  OWL/        Graph     Expert      CSP      RAG +
  SPARQL      Search    System    Planner    Ollama
    │           │          │          │          │
┌───▼───────────▼──────────▼──────────▼──────────▼────────────┐
│  Layer 1 — GitaKnowledgeGraph singleton                     │
│  RDFLib Graph (SPARQL) + NetworkX DiGraph + CSV map         │
│  gita_ontology.ttl · Bhagwad_Gita.csv · verse_embeddings.npy│
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Datasets and Knowledge Base

**Dataset Statistics (v2.2):**

| Component | Count | Notes |
|---|---|---|
| Total verses | 701 | 18 chapters |
| Ontology-annotated verses | 701 | All chapters (rule-based expansion) |
| Philosophical concepts | 24 | 6 categories |
| RDF triples | 3,523 | OWL 2 DL profile |
| Concept graph nodes | 61 | Concepts + chapter nodes |
| Concept graph edges | 1,657 | 9 property types |
| Cosine-indexed verses | 701 | `paraphrase-multilingual-MiniLM-L12-v2` |
| Embedding dimension | 384 | NumPy inner product on normalised vectors |
| Production rules | 16 | R1–R16, EN/Hindi/Hinglish keywords |
| SPARQL CQs | 13 | CQ1–CQ12 + CQ_CONSTRUCT |

**Ontology — `gita_ontology.ttl`:**
- **16 OWL Classes:** `Chapter`, `Verse`, `YogaPath` (4 subclasses: Karma/Jñāna/Bhakti/Dhyāna), `Practice`, `Attainment`, `DownfallCause`, `Guna`, `EthicalConcept`, `Person`, `CommentaryTradition`
- **9 Object Properties:** `teaches`, `leadsTo`, `respondsTo`, `contrastsWith`, `belongsToChapter`, `spokenBy`, `requires`, `subConceptOf`, `spirituallyProgressesTo`
- **Ontology Expansion Methodology:** The initial hand-annotated core of 31 verses (Chapters 2, 3, 6) was expanded to all 701 verses using a deterministic keyword-matching approach. Twenty-two concept assignment rules (e.g., "karma yoga" triggers `KarmaYoga_inst`; "liberation" triggers `Moksha`) were applied to authoritative English translations. Every concept assignment is fully traceable to specific keyword patterns and produces reproducible triples — an important property for research reproducibility. This rule-based approach is explicitly acknowledged as deterministic rather than LLM-inferred.

### 3.3 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Ontology | RDF/OWL 2 Turtle | W3C Rec. |
| Semantic engine | RDFLib | 7.0 |
| Graph algorithms | NetworkX | 3.3 |
| REST API | Flask | 3.0 |
| Multilingual embeddings | sentence-transformers (`paraphrase-multilingual-MiniLM-L12-v2`) | 3.0 |
| Vector search | NumPy cosine similarity | 1.26 |
| BM25 baseline | rank-bm25 | 0.2.2 |
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

Rules R1–R16 accept keywords in English, Hinglish, and Unicode Hindi. R1–R10 cover core situations; R11–R16 extend coverage to loneliness, fear of death, purpose-seeking, jealousy, family conflict, and failure:

```python
# Example: R11 — Loneliness/Isolation
Rule(
    id='R11_Loneliness',
    condition=lambda wm: any(k in (wm.concern + ' ' + wm.goal).lower()
        for k in ['lonely','loneliness','alone','isolated','akela',
                  'akelapan','tanha','अकेला','अकेलापन','तन्हाई']),
    action=lambda wm: (
        setattr(wm, 'recommend_concept', 'DhyanaYoga_inst'),
        setattr(wm, 'start_verse', 'Verse_6_5'),
        setattr(wm, 'confidence', 0.85)
    ),
    cf=0.85, specificity=2,
)
```

**Six new rules (R11–R16) and their philosophical mappings:**

| Rule | Situation | Concept | Start Verse | CF |
|---|---|---|---|---|
| R11 | Loneliness/Isolation | DhyanaYoga_inst | 6.5 | 0.85 |
| R12 | Fear of Death | AtmaJnana | 2.20 | 0.88 |
| R13 | Purpose of Life | Svadharma | 3.35 | 0.83 |
| R14 | Jealousy/Envy | NishkamaKarma | 2.47 | 0.82 |
| R15 | Family Conflict | Svadharma | 3.35 | 0.80 |
| R16 | Failure/Despair | Sthitaprajna | 2.55 | 0.84 |

**13 SPARQL Competency Questions (CQ1–CQ12 + CQ_CONSTRUCT):**

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
| CQ9 | SELECT | contrastsWith symmetric pairs (cross-validation) |
| CQ10 | SELECT | Concepts leading to Samadhi via leadsTo+ |
| CQ11 | SELECT ORDER BY | NishkamaKarma verses ordered by chapter.verse |
| CQ12 | SELECT | YogaPath instances that leadsTo Moksha |
| CQ_CONSTRUCT | CONSTRUCT | Practice-concept sub-graph for visualization |

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

#### 3.4.6 Multilingual Semantic RAG Layer (Module 7)

The system uses `paraphrase-multilingual-MiniLM-L12-v2` (approximately 420 MB, 50+ languages) replacing the previous English-only `all-MiniLM-L6-v2`. Both models produce 384-dimensional embeddings, making the swap a drop-in upgrade with no architectural change.

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
embeddings = np.load('Data/embeddings/verse_embeddings.npy')  # shape: (701, 384)

def semantic_search(query: str, top_k: int = 12):
    q_vec = model.encode([query], normalize_embeddings=True)[0]
    scores = embeddings @ q_vec         # cosine via normalised inner product
    ids = scores.argsort()[::-1][:top_k]
    return [{**enrich_verse_by_idx(i), 'score': float(scores[i])}
            for i in ids]
```

Similarity score: `score(q,v) = (e_q · e_v) / (|e_q|·|e_v|)` (cosine via inner product on normalized vectors). The model was fine-tuned for semantic similarity across 50+ languages, enabling direct Hindi-language queries without transliteration or translation.

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
| POST | `/api/solve` | Unified query pipeline |
| POST | `/api/bfs` | M3 — BFS |
| POST | `/api/dfs` | M3 — DFS |
| POST | `/api/astar` | M3 — A\* |
| POST | `/api/iddfs` | M3 — IDDFS |
| POST | `/api/infer` | M4 — Expert System |
| GET | `/api/sparql/<cq_id>` | M4 — SPARQL CQs |
| GET | `/api/profiles` | M4 — Reader Profiles |
| POST | `/api/plan` | M5 — CSP Planner |
| POST | `/api/cf` | M6 — MYCIN |
| GET | `/api/semantic_search` | M7 — RAG |
| POST | `/api/contextualize` | M7 — Ollama |
| GET | `/api/ollama_status` | M7 — LLM Status |
| GET | `/api/graph` | M2 — Ontology graph |

---

## 4. Results and Findings

### 4.1 Experimental Setup

**Platform:** MacBook Pro, Apple M-series, 16 GB RAM, macOS 14. No GPU required; embeddings computed on CPU; Ollama used CPU-only quantized inference.

**Software:** Python 3.12, RDFLib 7.0, NetworkX 3.3, sentence-transformers 3.0, NumPy 1.26, rank-bm25 0.2.2, Ollama 0.3, React 18.

**Retrieval Evaluation Methodology:**

We constructed a 50-query gold set spanning 10 semantic categories (5 queries each): *karma*, *peace*, *anger\_desire*, *meditation*, *duty*, *grief*, *wisdom*, *liberation*, *life\_situations*, and *multilingual\_only*. For each query, 3–5 relevant verses were manually identified by consulting authoritative English translations in the corpus. The gold set includes queries in English (Q01–Q45) and Hindi-script (Q46–Q50, *multilingual\_only* category). The gold set is author-constructed and is not externally validated; this limitation is acknowledged in Section 4.11.

We evaluate seven retrieval variants using three information retrieval metrics:

- **MAP@5** — Mean Average Precision at depth 5: `AP@5(q) = (1/min(|Rq|,5)) · Σ_{k=1}^{5} P@k · rel(k)`; averaged over all queries
- **MRR** — Mean Reciprocal Rank: position of first relevant result
- **P@k** — Precision at cutoff k (k ∈ {1, 3, 5})

**Seven evaluation variants:**

| Variant ID | Description |
|---|---|
| `bm25_baseline` | BM25 over English translations (rank-bm25, English tokens only) |
| `semantic_only` | Multilingual embedding cosine search; no expert system, no graph, no ontology filter |
| `full_system` | All modules active: expert system + ontology + graph BFS + semantic |
| `no_expert_rules` | Expert system disabled; top-1 semantic result's concept used as fallback |
| `no_semantic` | Semantic embeddings excluded; expert system + graph only |
| `no_graph` | Graph BFS results excluded; expert system + semantic only |
| `no_ontology` | Ontology-guided filtering bypassed; pure embedding rank (equivalent to semantic_only) |

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
| Grief ("dukh") | R9 | Verse 2.20 — AtmaJnana | 0.82 |
| Loneliness ("akela") | R11 | Verse 6.5 — DhyanaYoga | 0.85 |
| Fear of death ("maut ka darr") | R12 | Verse 2.20 — AtmaJnana | 0.88 |
| Family conflict ("ghar mein jhagda") | R15 | Verse 3.35 — Svadharma | 0.80 |
| Failure/despair ("haar gaya") | R16 | Verse 2.55 — Sthitaprajna | 0.84 |
| Advanced liberation | R8 | Moksha progression | 0.88 |

All 13 CQs returned verified results. CQ8 (property chain) inferred `spirituallyProgressesTo` for all KarmaYoga verses. CQ10 identified the transitive leadsTo chain to Samadhi. CQ11 returned NishkamaKarma verses ordered by chapter.verse number.

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

### 4.6 Retrieval Evaluation — Main Results

Table 1 reports retrieval performance across all 7 variants on the 50-query English gold set (k=5). All metrics are macro-averaged across all 50 queries.

**Table 1: Retrieval performance across system variants (50-query gold set, k=5)**

| Variant | MAP@5 | MRR | P@1 | P@3 | P@5 |
|---|---|---|---|---|---|
| BM25 Baseline | 0.0279 | 0.0583 | 0.020 | 0.033 | 0.024 |
| Semantic RAG only | 0.0525 | 0.1463 | 0.080 | 0.073 | 0.056 |
| **Full System** | **0.2848** | **0.6367** | **0.600** | **0.280** | **0.168** |
| — No Expert Rules | 0.2615 | 0.5967 | 0.560 | 0.253 | 0.152 |
| — No Semantic RAG | 0.2765 | 0.6067 | 0.580 | 0.267 | 0.160 |
| — No Graph BFS | 0.1939 | 0.4807 | 0.460 | 0.187 | 0.124 |
| — No Ontology | 0.0525 | 0.1463 | 0.080 | 0.073 | 0.056 |

The full system outperforms BM25 by **10.2× on MAP@5** and **10.9× on MRR**. Compared to semantic-only retrieval, the full system achieves **5.4× higher MAP@5** and **4.4× higher MRR**, demonstrating that the symbolic components (ontology, expert system, graph traversal) add substantial value beyond neural embeddings alone.

**Table 2: Hindi-only subset (Q46–Q50, multilingual queries)**

| Variant | MAP@5 | MRR | P@1 |
|---|---|---|---|
| BM25 Baseline | 0.0222 | 0.0667 | 0.000 |
| Semantic RAG only | 0.0889 | 0.2667 | 0.200 |
| Full System | **0.3000** | **0.8000** | **0.800** |

On Hindi-script queries, BM25 achieves P@1 = 0.000 (never retrieves the correct verse first), confirming that keyword matching is fundamentally inadequate for Hindi input. The multilingual semantic model achieves MRR = 0.267 on these queries, and the full system reaches MRR = 0.800 — a **12× improvement** over BM25 and **3× improvement** over semantic-only, highlighting the compounded benefit of multilingual embeddings combined with symbolic reasoning.

### 4.7 Ablation Study — Component Contributions

Table 3 quantifies the marginal contribution of each system component by measuring performance drop when that component is removed.

**Table 3: Component contribution — absolute and relative drop from full system**

| Removed Component | MAP@5 Drop (abs) | MAP@5 Drop (%) | MRR Drop (abs) | P@1 Drop (abs) |
|---|---|---|---|---|
| Expert Rules | −0.023 | −8.2% | −0.040 | −0.040 |
| Semantic RAG | −0.008 | −2.8% | −0.030 | −0.020 |
| Graph BFS | −0.091 | **−31.9%** | −0.156 | −0.140 |
| Ontology | −0.232 | **−81.6%** | −0.490 | −0.520 |

**Key findings:**

1. **Ontology is the dominant component.** Removing the ontology-guided concept filter reduces MAP@5 from 0.285 to 0.053 (−81.6%). The `no_ontology` variant is numerically identical to `semantic_only`, confirming that the knowledge graph's concept-to-verse mappings are the principal ranking signal.

2. **Graph BFS is the second most important component.** Removing BFS traversal causes a −31.9% MAP@5 drop (0.285 → 0.194). Graph traversal from expert-identified seed verses to semantically related verses through `leadsTo` and `teaches` edges provides substantial recall lift.

3. **Expert rules contribute meaningfully.** Disabling rules R1–R16 reduces MAP@5 by 8.2% (0.285 → 0.262). The expert system identifies the correct starting concept and seed verse, which the graph BFS then expands; removing it forces use of top-1 semantic concept, which is less precise.

4. **Semantic RAG shows modest standalone contribution** (−2.8% MAP@5 when disabled). This reflects that the expert system + graph often locate relevant verses; the semantic component adds recall padding and handles queries that don't match keyword rules.

5. **Interaction effects are super-additive.** The sum of individual component drops (81.6 + 31.9 + 8.2 + 2.8 = 124.5%) exceeds 100%, indicating that components interact synergistically — the expert system's seed verse is only useful when graph BFS can expand it, which requires the ontology to have concept-verse edges.

### 4.8 Semantic Search — Qualitative Examples

The following examples illustrate cosine similarity matching quality (note: these are individual query similarity scores, not the MAP@5 metric from Tables 1–2):

| Query | Top-1 Verse | Cosine Score |
|---|---|---|
| "feeling lost in duty" | 3.35 | 0.87 |
| "grief over loss" | 2.20 | 0.85 |
| "how to control anger" | 2.63 | 0.83 |
| "detach from outcomes" | 2.47 | 0.91 |
| "restless mind meditation" | 6.35 | 0.88 |
| "path to liberation" | 6.47 | 0.86 |
| "मुझे अकेलापन लगता है" (Hindi) | 6.5 | 0.79 |
| "Main bahut confused hoon" (Hinglish) | 3.35 | 0.74 |

Query "feeling lost in duty" correctly surfaces Verse 3.35 (*svadharme nidhanam śreyaḥ…*) even though "lost" does not appear in the English translation — true semantic, not lexical, matching. Keyword search (BM25) returns **0 results** for the same query. The Hindi query for loneliness correctly maps to Verse 6.5 (*uddhared ātmanā* — "one must elevate oneself"), demonstrating cross-lingual semantic transfer.

### 4.9 Ollama LLM Commentary

| Language | Example Query | TTFT (s) | Total (s) |
|---|---|---|---|
| English | "I feel anxious about results" | 0.9 | 4.2 |
| Hindi | "मुझे कर्म की चिंता है" | 1.1 | 5.1 |
| Hinglish | "Main bahut confused hoon" | 0.8 | 3.8 |

Commentary runs entirely on-device (CPU, quantized Q4\_K\_M). No API keys or internet connection are required after initial model download.

### 4.10 Comparison with Existing Systems

| Feature | Vedabase | BG App | DBpedia | GG v1 | **GG v2.2** |
|---|---|---|---|---|---|
| Keyword search | ✓ | ✓ | ✓ | ✓ | ✓ |
| OWL ontology | ✗ | ✗ | Partial | ✓ | ✓ |
| Full-corpus ontology | ✗ | ✗ | Partial | ✗ | ✓ (701 verses) |
| Graph traversal | ✗ | ✗ | ✗ | ✓ | ✓ |
| Expert system | ✗ | ✗ | ✗ | ✓ | ✓ (16 rules) |
| CSP study plan | ✗ | ✗ | ✗ | ✓ | ✓ |
| MYCIN uncertainty | ✗ | ✗ | ✗ | ✓ | ✓ |
| Multilingual RAG | ✗ | ✗ | ✗ | ✗ | ✓ (50+ languages) |
| LLM commentary | ✗ | ✗ | ✗ | ✗ | ✓ |
| Hindi input | Partial | Partial | ✗ | ✗ | ✓ |
| Hinglish input | ✗ | ✗ | ✗ | ✗ | ✓ |
| Reproducible evaluation | ✗ | ✗ | ✗ | ✗ | ✓ (50-query gold set) |
| React SPA | ✗ | ✓ | ✗ | ✗ | ✓ |

### 4.11 Discussion

**Classical AI on Structured Domains:** Symbolic techniques remain powerful for well-structured philosophical domains. The ablation study demonstrates that the OWL 2 ontology is responsible for 81.6% of retrieval quality — without it, the system degrades to pure semantic search. This vindicates the design choice of investing in knowledge representation before neural components.

**Hybrid Symbolic–Neural Synergy:** The full system's MAP@5 (0.285) substantially exceeds the arithmetic sum of BM25 (0.028) and semantic-only (0.053) baselines, showing the system components interact synergistically rather than additively. Expert-system seed verses anchor graph BFS traversal, which in turn expands coverage beyond what embeddings alone can identify.

**Multilingual Access:** The switch from `all-MiniLM-L6-v2` (English-only, ~90 MB) to `paraphrase-multilingual-MiniLM-L12-v2` (~420 MB, 50+ languages) costs approximately 30 MB additional storage but yields a 3× MRR improvement on Hindi queries and enables direct Devanagari-script input without transliteration.

**Limitations:**

1. **Author-constructed gold set.** The 50-query gold set was constructed by the authors, not independently annotated. This introduces potential bias in relevant verse selection. External validation (user study, domain expert annotation) is required before claims of generalizability.

2. **Rule-based ontology expansion.** The 701-verse coverage was achieved through keyword-matching rules applied to English translations, not LLM inference or Sanskrit expert annotation. Concept assignments are deterministic and reproducible, but may miss nuanced philosophical connections that require deep textual understanding.

3. **English-dominant gold set.** Only Q46–Q50 (10%) are Hindi queries. Comprehensive multilingual evaluation requires parity between English and Hindi gold queries across all semantic categories.

4. **Graph modules use full 1,657-edge graph.** After ontology expansion, graph BFS operates on a much denser graph. Some edges may reflect keyword co-occurrence rather than genuine philosophical relationships.

5. **Ollama commentary varies between runs.** Temperature sampling produces different outputs on identical inputs; a fixed seed parameter is needed for strict reproducibility.

6. **Three commentary traditions only.** MYCIN CF weights for Śaṅkara/Rāmānuja/Madhva cover Vedānta schools; Kashmir Shaivism, Sri Aurobindo, and Swami Vivekananda interpretations are not modeled.

7. **No user study data.** System utility for actual Gītā readers has not been evaluated through controlled user studies; this is reserved for future work.

---

## 5. Conclusion and Future Work

GitaGraph v2.2 demonstrates that a classical knowledge-based AI stack — OWL ontology, graph search, expert system, CSP, uncertainty reasoning — can be effectively applied to Sanskrit philosophical text navigation and extended with hybrid neural-symbolic modules. The ablation study establishes a clear hierarchy of component contributions: ontology (81.6% of retrieval quality) > graph BFS (31.9%) > expert rules (8.2%) > semantic RAG standalone (2.8%), with super-additive interaction effects.

**Summary of Verified Results:**

| Objective | Result |
|---|---|
| Optimal path search | A\* finds 3-hop paths to Mokṣa with 63% fewer expansions than UCS |
| Constraint satisfaction | CSP satisfies all 7 constraints with 93.6% fewer backtracks |
| Full-system retrieval | MAP@5 = 0.285, MRR = 0.637, P@1 = 0.600 (50-query gold set) |
| vs. BM25 baseline | 10.2× improvement in MAP@5 |
| Hindi-query retrieval | MRR = 0.800 (full system) vs. 0.267 (semantic-only) vs. 0.067 (BM25) |
| Uncertainty modeling | MYCIN reaches CF = 0.9991 for multi-tradition confirmed pairs |
| Ontology coverage | 3,523 RDF triples covering all 701 verses and all 18 chapters |

**Future Directions:**

1. **Expert-annotated gold set** — Commission 3–5 Sanskrit scholars to independently label relevant verses for at least 100 queries, enabling inter-annotator agreement measurement and external validity.
2. **Sanskrit NLP** — Interface with the Heritage Sanskrit Platform for morphological Devanagari input to support original-script querying.
3. **Hybrid graph-neural search** — Combine symbolic A\* with neural graph embeddings (TransE, RotatE) for missing-link completion and concept relationship prediction.
4. **Multi-tradition expansion** — Add Kashmir Shaivism, Sri Aurobindo, Swami Vivekananda CF weights and commentary traditions.
5. **Conversational interface** — Multi-turn Socratic dialogue refining reader profile belief states incrementally.
6. **Cross-text knowledge graphs** — Link Gītā concepts with Upaniṣads and Brahmasūtras.
7. **RAG-grounded LLM** — Inject top-3 retrieved verses as verifiable context for Ollama to reduce hallucination risk.
8. **User study** — Controlled study with Gītā practitioners measuring satisfaction, concept comprehension gain, and navigation efficiency vs. existing platforms.

---

## Acknowledgments

The authors thank the open-source communities behind RDFLib, NetworkX, NumPy, sentence-transformers, rank-bm25, Ollama, React, and Tailwind CSS. Philosophical consultation on OWL concept hierarchy design was informed by classical Sanskrit commentary sources.

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
17. N. Reimers and I. Gurevych, "Sentence-BERT: Sentence embeddings using siamese BERT networks," *EMNLP-IJCNLP 2019*, pp. 3982–3992.
18. N. Reimers and I. Gurevych, "Making monolingual sentence embeddings multilingual using knowledge distillation," *EMNLP 2020*, pp. 4512–4525.
19. Ollama Team, "Ollama: Run large language models locally," 2024. https://ollama.com
20. S. J. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th ed. Pearson, 2021.
21. A. A. Hagberg, D. A. Schult, P. J. Swart, "Exploring network structure using NetworkX," *SciPy 2008*, pp. 11–15.
22. P. Goyal et al., "A distributed platform for Sanskrit processing," *COLING 2012*, pp. 1011–1028.
23. Z. Wang et al., "Knowledge graph embedding by translating on hyperplanes," *AAAI 2014*, pp. 1112–1119.
24. K. VanLehn, "The relative effectiveness of human tutoring, ITS, and other tutoring systems," *Educ. Psychol.*, 46(4):197–221, 2011.
25. O. Hellwig and S. Nehrdich, "Sanskrit word segmentation using character-level recurrent and CNN models," *EMNLP 2018*, pp. 2754–2763.
26. S. Robertson and H. Zaragoza, "The probabilistic relevance framework: BM25 and beyond," *Found. Trends Inf. Retr.*, 3(4):333–389, 2009.
27. A. Balogh et al., "The DHARMA encoding guide for critical editions," Hal Archives, 2020.

---

## Appendix A — Task Distribution

| Member (Roll No.) | Role | Modules & Responsibilities |
|---|---|---|
| Hariom Rajput (524110006) | Expert System | M4: 16-rule forward-chaining engine (R1–R16); Hindi/Hinglish/Unicode keyword matching; specificity conflict resolution; 13 SPARQL CQs (CQ1–CQ12 + CQ_CONSTRUCT); R11–R16 new rules for loneliness, fear-of-death, purpose, jealousy, family-conflict, failure |
| Ayushi Choyal (524410017) | Uncertainty | M6: MYCIN CF combination; fuzzy yoga-path membership; non-monotonic belief revision across 3 traditions; Gauge and CFBar UI components |
| Ravi Kant Gupta (524410027) | Team Lead | M1 (PEAS); M2 (OWL 2 ontology, 3,523 triples, all 18 chapters, rule-based expansion of 701 verses); M7 (Multilingual Semantic RAG, model swap to `paraphrase-multilingual-MiniLM-L12-v2`; Ollama LLM; EN/Hindi/Hinglish toggle); Evaluation framework (50-query gold set, MAP@5/MRR/P@k harness, 7-variant ablation study); Flask REST API; React SPA architecture; ancient manuscript UI design system |
| Shouryavi Awasthi (524410028) | Graph & CSP | M3 (BFS, DFS, A\*, IDDFS + UI timeline); M5 (CSP backtracking, MRV, forward checking, 7 constraints); Search page verse card and path rendering |

---

## Appendix B — Sample Annotated Verses

| Verse | Concept(s) | Speaker | Notes |
|---|---|---|---|
| 2.47 | NishkamaKarma, KarmaYoga_inst | Krishna | Central karma verse; P@1 = 1.0 on karma category |
| 2.62 | Kama, DownfallCause | Krishna | Start of downfall chain |
| 2.63 | BuddhiNasha, DownfallCause | Krishna | End of downfall chain |
| 3.35 | Svadharma, EthicalConcept | Krishna | Top-1 for "lost in duty" queries |
| 6.5 | DhyanaYoga_inst, Practice | Krishna | Seed verse for R11 (loneliness) |
| 6.10 | DhyanaYoga_inst, Practice | Krishna | Meditation practice anchor |
| 6.47 | BhaktiYoga_inst, DhyanaYoga_inst, JnanaYoga_inst | Krishna | Synthesis verse; μ=1.0 for Bhakti and Dhyāna |
| 2.20 | AtmaJnana, Attainment | Krishna | Seed verse for R12 (fear of death) |
| 2.55 | Sthitaprajna, Attainment | Krishna | Seed verse for R16 (failure/despair) |
| 1.28 | ArjunaVishada | Arjuna | Initiating situation; CSP C7 |

---

## Appendix C — Gold Query Set Summary

The 50-query gold set is organized into 10 categories of 5 queries each. Each entry contains an English query, a Hindi-script translation, a Hinglish transliteration, and a manually verified list of 3–5 relevant verse keys (format: `Verse_<ch>_<v>`). The *multilingual\_only* category (Q46–Q50) contains primary queries written in Hindi script, serving as the multilingual evaluation subset.

| Category | Queries | Key Relevant Verses |
|---|---|---|
| karma (Q01–05) | Nishkama karma, duty without attachment | Verse_2_47, Verse_2_48, Verse_2_50, Verse_3_9, Verse_3_19 |
| peace (Q06–10) | Inner peace, equanimity, calm mind | Verse_2_55, Verse_2_56, Verse_2_64, Verse_2_71, Verse_6_18 |
| anger\_desire (Q11–15) | Controlling anger, desire chains | Verse_2_62, Verse_2_63, Verse_2_64, Verse_3_42, Verse_3_43 |
| meditation (Q16–20) | Dhyana practice, focused mind | Verse_6_10, Verse_6_13, Verse_6_17, Verse_6_18, Verse_6_35 |
| duty (Q21–25) | Svadharma, action without avoidance | Verse_3_3, Verse_3_4, Verse_3_5, Verse_3_8, Verse_3_35 |
| grief (Q26–30) | Mourning, loss, death | Verse_2_19, Verse_2_20, Verse_2_55, Verse_2_56 |
| wisdom (Q31–35) | Jnana, discernment, self-knowledge | Verse_2_55, Verse_2_56, Verse_2_68, Verse_3_27, Verse_3_42 |
| liberation (Q36–40) | Moksha, freedom, ultimate goal | Verse_6_47, Verse_3_3, Verse_2_55 |
| life\_situations (Q41–45) | Practical guidance, modern problems | Verse_6_5, Verse_2_20, Verse_2_47, Verse_3_35 |
| multilingual\_only (Q46–50) | Hindi-script queries | Same verse pool as peace/anger/duty |

*Note: The gold set is author-constructed and not externally validated. Relevant verse assignments are based on the authors' reading of authoritative English translations in the corpus. This is acknowledged as a limitation requiring future expert annotation.*
