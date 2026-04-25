# GitaGraph — Full Project Documentation

> **Project Name:** GitaGraph — Intelligent Gītā Navigator
> **Subject:** Artificial Intelligence (Minor Project)
> **Domain:** Knowledge Representation · Search · Inference · CSP · Uncertainty
> **Language:** Python 3.11+ · OWL 2 · RDF (Turtle) · SPARQL

---

## Table of Contents

1. [Introduction & Motivation](#1-introduction--motivation)
2. [Module 1 — Intelligent Agent Design (PEAS)](#2-module-1--intelligent-agent-design)
3. [Module 2 — Knowledge Representation (OWL/RDF)](#3-module-2--knowledge-representation)
4. [Module 3 — Graph Search Algorithms](#4-module-3--graph-search-algorithms)
5. [Module 4 — Inference & Expert System](#5-module-4--inference--expert-system)
6. [Module 5 — Constraint Satisfaction (CSP)](#6-module-5--constraint-satisfaction)
7. [Module 6 — Uncertainty Handling](#7-module-6--uncertainty-handling)
8. [System Integration & UI](#8-system-integration--ui)
9. [Dataset](#9-dataset)
10. [Results & Analysis](#10-results--analysis)
11. [Limitations & Future Work](#11-limitations--future-work)

---

## 1. Introduction & Motivation

### 1.1 Why the Bhagavad Gītā?

The Bhagavad Gītā is a 700-verse Sanskrit philosophical dialogue. Its structural properties make it uniquely suited for AI techniques:

- **Hierarchical concept chains** (NishkamaKarma → ChittaShuddhi → AtmaJnana → Moksha) map naturally to directed graphs for BFS/DFS/A* search.
- **Prerequisite ordering** (understanding Verse 2.62 before 2.63) creates a natural CSP over study sessions.
- **Multiple commentary traditions** (Shankara/Ramanuja/Madhva) interpreting the same verse differently provide genuine uncertainty that requires MYCIN certainty factors.
- **Contrasting concepts** (KarmaYoga vs Sannyasa, Svadharma vs Paradharma) are naturally represented as `owl:SymmetricProperty`.
- **Transitive philosophical progressions** (A leadsTo B leadsTo C ⇒ A leadsTo C) require `owl:TransitiveProperty`.

### 1.2 System Objective

Build a goal-based AI agent that takes a reader's natural-language concern (e.g., *"I am anxious about results"*) and:
1. Maps it to philosophical concepts via production rules
2. Finds relevant verses via graph traversal (BFS/DFS/A*)
3. Answers structured philosophical queries via SPARQL
4. Plans a 5-session study curriculum via CSP backtracking
5. Weights recommendations with MYCIN certainty factors
6. Revises beliefs as the reader progresses through chapters

### 1.3 Corpus Selection Rationale

| Chapter | Why Selected |
|---|---|
| **2 (Sāṅkhya Yoga)** | Foundational — introduces NishkamaKarma (2.47), Sthitaprajna (2.55–2.68), and the downfall chain (2.62–2.63). All later chapters build on this. |
| **3 (Karma Yoga)** | Resolution — resolves Karma vs Jnana tension (3.3), introduces Svadharma (3.35) and Guna-action (3.27). Non-monotonic reasoning: 3.3 retracts default from Ch2. |
| **6 (Dhyāna Yoga)** | Practice — gives concrete meditation instructions (6.10, 6.13), the Abhyasa+Vairagya formula (6.35), and crowns Bhakti as highest (6.47 — fuzzy membership example). |

---

## 2. Module 1 — Intelligent Agent Design

### 2.1 PEAS Framework

**Performance Measure:**
- Precision: retrieved verse is genuinely relevant to the reader's stated concern
- Recall: all relevant verses in the corpus are returned for a given concept
- Path optimality: A* returns shortest leadsTo path, not just any path
- Plan validity: CSP plan satisfies all 7 hard constraints
- Consistency: no logically contradictory inferences produced simultaneously

**Environment:**
- 32-node verse subgraph + 24-node concept subgraph + 3 chapter nodes + 2 speaker nodes = 61 total nodes
- 175 directed edges labelled with 8 relationship types
- 658 RDF triples encoded in Turtle format
- Reader's working memory (concern, goal, stage, tradition, already-read verses)

**Actuators:**
- Returns verse IDs with English translations and Sanskrit text
- Traces multi-hop concept chains with verse annotations at each step
- Generates numbered 5-session study plans with theme justification
- Outputs certainty scores and fuzzy membership degrees
- Produces belief revision logs showing what was retracted and why

**Sensors:**
- Receives free-text concern string (e.g., "anxious about outcomes")
- Receives goal string (e.g., "peace of mind")
- Receives structured parameters: stage (beginner/intermediate/advanced), nature (active/contemplative/devotional), tradition (Advaita/Vishishtadvaita/Dvaita), already-read verse list

### 2.2 Environment Classification — Detailed Justification

**Partially Observable:**
The agent does not know:
- The reader's philosophical tradition (Shankara vs Ramanuja reading of 2.47)
- Prior knowledge of Sanskrit or Vedanta
- Whether the reader has practised the concepts or only read them
- The reader's emotional state beyond the stated concern

This requires the agent to ask clarifying questions and maintain a belief state — making it a **Model-Based Reflex Agent**, not a Simple Reflex Agent.

**Sequential (not Episodic):**
This is the most important classification. An episodic agent would treat each query independently. GitaGraph is sequential because:
- The CSP enforces that Verse 2.62 must precede Verse 2.63 (downfall chain prerequisite)
- The non-monotonic engine maintains a belief history across verses — processing Verse 3.3 retracts conclusions from Verse 2.47
- The study planner explicitly models "what the reader has already seen" (the `already_read` field in WorkingMemory)
- BFS reading lists are constructed relative to the reader's starting concept, which itself depends on previous inference steps

**Deterministic:**
Given the same knowledge base and the same query, the system produces the same answer every time. There is no stochastic element in the core pipeline (SPARQL is declarative, BFS/DFS/A* are deterministic algorithms). Uncertainty is explicitly modelled (Module 6) rather than arising from non-determinism.

### 2.3 Agent Architecture: Goal-Based vs. Simple Reflex

A **Simple Reflex Agent** would: if query contains "karma" → return all Karma Yoga verses. No concept chain traversal, no prerequisite ordering, no certainty weighting.

**GitaGraph is a Goal-Based Agent** because:
- It maintains an internal model of the concept graph
- It reasons about multi-step paths from the reader's concern to the goal state (Moksha)
- It uses search algorithms to find **optimal** paths, not just any matching verses
- It plans ahead — the CSP generates a 5-session sequence that satisfies future constraints, not just the current session

### 2.4 State Space Formulation

```
State:    Any node in the concept-verse graph
          (Verse node | Concept node | Chapter node | Speaker node)

Initial:  Concept identified from reader's concern by production rules
          e.g., "anxious about results" → NishkamaKarma

Actions:  Traverse any named RDF edge:
          leadsTo, requires, contrastsWith, teaches (+ reverse),
          spokenBy, belongsToChapter, subConceptOf, respondsTo

Goal:     Node satisfying the query:
          type=Attainment AND name="Moksha" (for A*)
          type=Verse AND spokenBy=Krishna (for CQ7)
          concept="Sthitaprajna" (for CQ2)

Cost:     g(n) = 1 per edge hop (uniform)
          h(n) = category-distance to Moksha (A* heuristic)
```

---

## 3. Module 2 — Knowledge Representation

### 3.1 Why OWL 2?

| Feature | Semantic Network | Frame System | OWL 2 |
|---|---|---|---|
| Formal semantics | ❌ Informal | ❌ Ad hoc | ✅ Description Logic |
| Transitive relations | ❌ Manual | ❌ Manual | ✅ `owl:TransitiveProperty` |
| Symmetric relations | ❌ Manual | ❌ Manual | ✅ `owl:SymmetricProperty` |
| Property chains | ❌ No | ❌ No | ✅ `owl:propertyChainAxiom` |
| SPARQL querying | ❌ No | ❌ No | ✅ Full SPARQL 1.1 |
| Automated reasoning | ❌ No | ❌ Limited | ✅ HermiT, Pellet, Jena |
| Open World Assumption | ❌ CWA | ❌ CWA | ✅ OWA |
| Disjointness axioms | ❌ No | ❌ No | ✅ `owl:AllDisjointClasses` |

### 3.2 Class Hierarchy (16 Classes)

```
owl:Thing
├── ScripturalEntity
│   ├── Chapter                    (3 instances: Ch2, Ch3, Ch6)
│   └── Verse                      (32 instances)
├── PhilosophicalConcept
│   ├── YogaPath
│   │   ├── KarmaYogaPath          (1 instance)
│   │   ├── JnanaYogaPath          (1 instance)
│   │   ├── DhyanaYogaPath         (1 instance)
│   │   └── BhaktiYogaPath         (1 instance)
│   ├── Practice                   (5 instances)
│   ├── Attainment                 (5 instances)
│   ├── DownfallCause              (4 instances)
│   ├── Guna                       (3 instances)
│   └── EthicalConcept             (3 instances)
├── Person                         (2 instances: Krishna, Arjuna)
└── CommentaryTradition            (3 instances)
```

**Disjointness:** `{YogaPath, DownfallCause, Guna, Attainment}` are all pairwise disjoint — a concept cannot simultaneously be an Attainment AND a DownfallCause. This prevents logically inconsistent assertions.

### 3.3 Key OWL Axioms

#### TransitiveProperty: `leadsTo`
```turtle
gita:leadsTo a owl:ObjectProperty, owl:TransitiveProperty ;
    rdfs:domain gita:PhilosophicalConcept ;
    rdfs:range  gita:PhilosophicalConcept .
```
**Why it matters for CQ6:** Without transitivity, a SPARQL query for "concepts leading to Moksha" would only find direct predecessors (AtmaJnana). With transitivity, the reasoner infers that NishkamaKarma also leadsTo Moksha through ChittaShuddhi and AtmaJnana — without explicitly asserting each intermediate link.

**Logical form:** `∀x,y,z: leadsTo(x,y) ∧ leadsTo(y,z) → leadsTo(x,z)`

#### SymmetricProperty: `contrastsWith`
```turtle
gita:contrastsWith a owl:ObjectProperty, owl:SymmetricProperty ;
    rdfs:domain gita:PhilosophicalConcept ;
    rdfs:range  gita:PhilosophicalConcept .
```
**Why it matters for CQ5:** We assert only `KarmaYoga contrastsWith Sannyasa`. The reasoner automatically infers `Sannyasa contrastsWith KarmaYoga`. Without SymmetricProperty, CQ5 would miss half its results (those querying the relation in the reverse direction).

**Logical form:** `∀x,y: contrastsWith(x,y) → contrastsWith(y,x)`

#### Property Chain Axiom: `spirituallyProgressesTo`
```turtle
gita:spirituallyProgressesTo a owl:ObjectProperty ;
    owl:propertyChainAxiom ( gita:teaches gita:leadsTo ) ;
    rdfs:domain gita:Verse ;
    rdfs:range  gita:PhilosophicalConcept .
```
**What this derives:** If `Verse_2_47 teaches NishkamaKarma` AND `NishkamaKarma leadsTo ChittaShuddhi`, then the reasoner automatically infers `Verse_2_47 spirituallyProgressesTo ChittaShuddhi`. Combined with transitivity of `leadsTo`, this means every verse that teaches any concept on the spiritual progression chain is automatically connected to Moksha via `spirituallyProgressesTo`.

**Logical form:** `teaches(V,C) ∧ leadsTo(C,D) → spirituallyProgressesTo(V,D)`

### 3.4 RDF Knowledge Base Statistics

| Metric | Value |
|---|---|
| Total RDF triples | 658 |
| NetworkX graph nodes | 61 |
| NetworkX graph edges | 175 |
| Verse instances | 32 (30 corpus + 2 reference) |
| Concept instances | 24 |
| Chapter instances | 3 |
| Speaker instances | 2 |
| Commentary tradition instances | 3 |
| Object properties | 9 |
| Data properties | 10 |
| OWL classes | 16 |

### 3.5 Competency Questions (CQs) — Design

The 8 CQs were designed to test different aspects of the knowledge base:

| CQ | Tests | SPARQL Feature Used |
|---|---|---|
| CQ1 | Concept→verse retrieval | Basic `teaches` join |
| CQ2 | Named concept retrieval | String matching on `conceptName` |
| CQ3 | Transitive chain traversal | `leadsTo+` property path |
| CQ4 | Chapter-filtered retrieval | `belongsToChapter` filter |
| CQ5 | Multi-concept verse | Two `teaches` joins (contrastsWith concepts) |
| CQ6 | Property chain inference | `leadsTo+` on concepts taught by verses |
| CQ7 | Dialogue structure | `spokenBy` + `respondsTo` join |
| CQ8 | Symmetric property | `contrastsWith` optional join |

---

## 4. Module 3 — Graph Search Algorithms

### 4.1 Why Three Algorithms?

The concept-verse graph has two qualitatively different chain structures:
- **Upward spiritual progression** (NishkamaKarma → Moksha): has branching paths (Vairagya and DhyanaYoga both reach Moksha) → A* finds the optimal one
- **Downward linear chain** (Kama → BuddhiNasha): linear, no branching → DFS is natural and efficient
- **Multi-hop concept reachability** (what can be reached from NishkamaKarma in 2 hops?) → BFS is optimal and complete

### 4.2 BFS — Reading List Generator

**Algorithm:**
```python
def bfs_reading_list(start_concept, kg, max_hops):
    visited = {start_concept}
    queue = deque([(start_concept, 0)])
    verse_results = []
    while queue:
        node, depth = queue.popleft()
        if depth > max_hops: continue
        # Collect verses teaching this concept (reverse teaches edge)
        for verse in kg.verses_teaching(node):
            if verse not in seen_verses:
                verse_results.append({verse, depth, node})
        # Expand leadsTo, subConceptOf, contrastsWith
        for neighbour in kg.concept_neighbours(node):
            if neighbour not in visited:
                queue.append((neighbour, depth+1))
    return verse_results
```

**Properties:**
- Complete: Yes — will find all reachable verses
- Optimal: Yes — guarantees minimum hop distance for each verse
- Time: O(V+E) where V=61 nodes, E=175 edges
- Space: O(V) — worst case all nodes in queue simultaneously

**Example Trace (NishkamaKarma, max_hops=2):**
```
Hop 0 — NishkamaKarma:
  → Verse_2_47, Verse_2_48, Verse_2_71, Verse_3_9, Verse_3_19 (teaches edge)
Hop 1 — ChittaShuddhi (NishkamaKarma leadsTo ChittaShuddhi):
  → [no direct verse teaches ChittaShuddhi — illustrates ontology gap]
Hop 1 — KarmaYoga_inst (NishkamaKarma subConceptOf KarmaYoga):
  → Verse_3_3, Verse_3_8, Verse_3_35
Hop 2 — AtmaJnana (ChittaShuddhi leadsTo AtmaJnana):
  → Verse_6_20 (teaches AtmaJnana via Samadhi)
```

### 4.3 DFS — Downfall Chain Tracer

**Algorithm:**
```python
def _dfs_recursive(node, kg, edge_type, visited, path):
    visited.add(node)
    path.append(node.name)
    for neighbour in kg.neighbours_by_edge(node, edge_type):
        if neighbour not in visited:
            _dfs_recursive(neighbour, kg, edge_type, visited, path)
    return path
```

**Why DFS for the downfall chain?** The chain Kama → Krodha → Moha → BuddhiNasha is linear (each node has exactly one `leadsTo` successor). DFS reaches the end of the chain in O(depth) space, making it appropriate for deep linear chains. BFS would use O(V) space unnecessarily for a structure that never branches.

**Verified result:** `Kama → Krodha → Moha → BuddhiNasha`

**Verses at each step:**
- Kama: Verse_2_62 ("By contemplating sense objects, attachment arises...")
- Krodha + Moha: Verse_2_63 ("From anger comes delusion, from delusion loss of memory...")
- BuddhiNasha: Verse_2_63 (end state — "he perishes")

### 4.4 A* — Shortest Spiritual Path

**Heuristic design (admissibility proof):**
```
h(n) = category distance to Moksha:
  Attainment:    h=0  (already an attainment; 0–1 leadsTo hops to Moksha)
  Practice:      h=1  (1 leadsTo hop: Practice → Attainment)
  YogaPath:      h=2  (2 hops: YogaPath → Practice → Attainment)
  EthicalConcept:h=2  (same structural distance)
  Guna:          h=3  (3 hops: Guna → YogaPath → Practice → Attainment)
  DownfallCause: h=4  (wrong direction — maximum penalty)
```

**Admissibility:** h(n) never overestimates because the category hierarchy reflects the actual minimum number of `leadsTo` hops in the ontology. A Practice concept (h=1) genuinely requires at least 1 hop to reach an Attainment. A YogaPath (h=2) genuinely requires at least 2 hops. The categories are derived from the ontology's class hierarchy, not guessed.

**Verified traces:**
```
From Vairagya (Practice, h=1):
  f=1: Vairagya → ChittaShuddhi (g=1, h=0, f=1)
  f=2: ChittaShuddhi → AtmaJnana (g=2, h=0, f=2)
  f=3: AtmaJnana → Moksha       (g=3, h=0, f=3) ← GOAL
  Path: Vairagya → ChittaShuddhi → AtmaJnana → Moksha (3 hops)

From DhyanaYoga (YogaPath, h=2):
  f=1: DhyanaYoga → Samadhi     (g=1, h=0, f=1)
  f=2: Samadhi → AtmaJnana      (g=2, h=0, f=2)
  f=3: AtmaJnana → Moksha       (g=3, h=0, f=3) ← GOAL
  Path: DhyanaYoga → Samadhi → AtmaJnana → Moksha (3 hops)
```

### 4.5 IDDFS — Iterative Deepening

IDDFS combines BFS's guarantee of finding the shortest path with DFS's O(depth) space complexity. At each depth limit d, it performs a complete DFS to depth d. When the goal is found, the current depth limit equals the shortest path length.

**Advantage:** On the 61-node Gita graph, the maximum useful depth is ~5 hops. IDDFS is viable and complete, using only O(5) = O(1) space vs BFS's O(61) = O(V) space.

### 4.6 Complexity Summary

| Algorithm | Time | Space | Complete | Optimal | Best Use in Gita |
|---|---|---|---|---|---|
| BFS | O(V+E) | O(V) | Yes | Yes (min hops) | Reading lists for concepts |
| DFS | O(V+E) | O(depth) | Yes | No | Linear chain tracing |
| IDDFS | O(V+E) | O(d) | Yes | Yes | Memory-constrained traversal |
| A* | O(V log V) | O(V) | Yes | Yes (h admissible) | Shortest path to Moksha |

---

## 5. Module 4 — Inference & Expert System

### 5.1 Production Rule System

**Working Memory** holds the reader's profile as a structured object:
```python
WorkingMemory(
    concern="anxious about results",
    goal="peace of mind",
    stage="beginner",
    nature="active",
    tradition="",
    already_read=[],
    # Inferred:
    recommend_concept="NishkamaKarma",  # set by Rule R1
    start_verse="Verse_2_47",           # set by Rule R3
    fired_rules=["R1","R3"],
    confidence=0.95
)
```

**Conflict Resolution:** Rules are sorted by `specificity` (an integer field). Higher specificity = fires earlier in the iteration. Rule R3 (specificity=3) fires *after* R1 (specificity=1) because R3's condition depends on `recommend_concept` being set by R1 — the forward-chaining fixpoint loop ensures this.

**Fixpoint Convergence:** The engine iterates until no new rules fire in a complete pass. With 9 rules and a small working memory, convergence is guaranteed within ≤ 9 iterations.

**Rule R3 example trace:**
```
Iteration 1:
  R1 condition: "anxious" in concern → TRUE → fires → wm.recommend_concept = "NishkamaKarma"
  R3 condition: stage=="beginner" AND recommend_concept=="NishkamaKarma" → TRUE → fires
  wm.start_verse = "Verse_2_47", wm.confidence = 0.95

Iteration 2:
  R1 already fired → skip
  R3 already fired → skip
  No new rules fire → FIXPOINT
```

### 5.2 FOL / Horn Clause Representation

The production rules and OWL axioms correspond to Horn clauses:

```prolog
% Rule R1 (property chain as Horn clause)
spirituallyProgressesTo(V, D) :-
    teaches(V, C),
    leadsTo(C, D).

% Rule R2 (transitivity)
leadsTo(X, Z) :- leadsTo(X, Y), leadsTo(Y, Z).

% Rule R3 (Karma Yoga verse classification)
karmaYogaVerse(V) :- teaches(V, C), subConceptOf(C, karma_yoga).

% Rule R4 (direct answer detection)
directAnswer(V, Q) :- spokenBy(V, krishna), respondsTo(V, Q), spokenBy(Q, arjuna).
```

### 5.3 SPARQL Query Design

**CQ3 — Transitive chain (requires property path `+`):**
```sparql
SELECT ?step ?stepName WHERE {
  gita:Kama gita:leadsTo+ ?step .
  ?step gita:conceptName ?stepName .
}
```
The `+` operator is SPARQL 1.1 property path syntax for transitive closure. Without it, the query would only return Krodha (direct successor of Kama). With `+`, it returns all of {Krodha, Moha, BuddhiNasha}.

**CQ6 — Property chain inference:**
```sparql
SELECT ?id ?translation WHERE {
  ?v gita:teaches ?c ;
     gita:translationEn ?translation ;
     ...
  ?c gita:leadsTo+ gita:Moksha .
}
```
This query traverses from any concept taught by a verse to Moksha via the transitive `leadsTo+` path. Every verse that teaches *any* concept on the spiritual progression chain is returned — without ever explicitly asserting `Verse_2_47 spirituallyProgressesTo Moksha`.

---

## 6. Module 5 — Constraint Satisfaction

### 6.1 CSP Formulation

```
Variables:     S1, S2, S3, S4, S5  (five study sessions)
Domain D(Si):  All valid verse-pairs from 30-verse corpus
               |D(Si)| = C(30,2) = 435 pairs initially

Constraints:
  C1 (Theme):     Both verses in session share ≥1 concept
  C2 (Coverage):  Chapters {2, 3, 6} all appear across 5 sessions
  C3 (Prereq):    Verse_2_62 must appear in an earlier session than Verse_2_63
  C4 (Pairing):   Verse_2_62 and Verse_2_63 must appear in the same session
  C5 (NoRepeat):  Each verse appears in exactly one session
  C6 (Goal):      If goal="meditation" → Ch6 verse by Session 3
  C7 (Goal):      If goal="anxiety" → Verse_2_47 by Session 2
```

**Note:** C3 and C4 together create a tight constraint: {Verse_2_62, Verse_2_63} must appear as a pair in some session, AND that session must precede any session that introduces the downfall chain's solution.

### 6.2 MRV Heuristic

**Without MRV:** Sessions are assigned in order S1→S2→S3→S4→S5. The solver may invest many backtracks into a session that has a wide domain, only to discover a domain wipeout much later.

**With MRV:** At each step, the session with the *fewest valid verse-pairs remaining* is assigned first. In practice, after assigning S3={Verse_2_62, Verse_2_63} (the most constrained pairing), S4 and S5 have reduced domains because both of these verses are now used. MRV ensures the most constrained session is assigned first, catching failures early.

### 6.3 Forward Checking

After assigning pair `p = (v1, v2)` to session `Si`:
1. For every unassigned session `Sj`:
   - Remove any pair `q` from `domain(Sj)` if `v1 ∈ q` or `v2 ∈ q` (No-Repetition constraint)
2. If any `domain(Sj)` becomes empty → **domain wipeout** → immediately backtrack without exploring the subtree
3. On backtracking: restore all removed pairs to their respective domains

**Efficiency gain:** Without forward checking, the solver might assign {v1, v2} to S1, then discover only in S5 that no valid pair remains. Forward checking catches this at S1-assignment time, saving 3 levels of search.

### 6.4 Example Plan (Meditation Goal)

```
Session 1: Verse_3_5 + Verse_3_27   | Theme: Gunas (Sattva·Rajas·Tamas)
Session 2: Verse_6_10 + Verse_6_35  | Theme: DhyanaYoga·Vairagya·Abhyasa  ← Ch6 by S2 ✓
Session 3: Verse_2_47 + Verse_2_48  | Theme: NishkamaKarma·KarmaYoga
Session 4: Verse_2_50 + Verse_3_43  | Theme: KarmaYoga·Buddhi
Session 5: Verse_2_55 + Verse_2_68  | Theme: Sthitaprajna·Vairagya

Chapters covered: {2, 3, 6} ✓
Prereq: Verse_2_62 not included (no conflict)
```

---

## 7. Module 6 — Uncertainty Handling

### 7.1 Why Uncertainty in the Gītā?

The Bhagavad Gītā has three major commentary traditions that reach different conclusions from identical Sanskrit text:
- **Shankara (Advaita Vedanta):** The Self is identical to Brahman. Karma Yoga is preparatory for Jnana. Verse 2.47 is a stepping stone to non-dual knowledge.
- **Ramanuja (Vishishtadvaita):** Action as devotional service to God is the primary path. Verse 2.47 is the heart of Karma Yoga.
- **Madhva (Dvaita):** God and souls are eternally distinct. Verse 2.47 teaches action as an offering to Krishna, making it primarily Bhakti.

This genuine scholarly disagreement — not randomness — requires certainty factors.

### 7.2 MYCIN Certainty Factor Formula

```
CF(H, E1 ∧ E2) = CF1 + CF2 × (1 − CF1)    [both positive]
CF(H, E1 ∧ E2) = CF1 + CF2 × (1 + CF1)    [both negative]
CF(H, E1 ∧ E2) = (CF1 + CF2) / (1 − min(|CF1|, |CF2|))  [mixed]
```

**Example — Verse 2.47 → KarmaYoga:**
```
Evidence 1: Ramanuja tradition CF = 0.95
Evidence 2: Keyword match ("action", "duty", "fruits") CF = 0.85
Step 1: CF = 0.95 + 0.85 × (1 − 0.95) = 0.95 + 0.0425 = 0.9925
Evidence 3: Madhva tradition CF = 0.80
Step 2: CF = 0.9925 + 0.80 × (1 − 0.9925) = 0.9925 + 0.006 = 0.9985 → 0.9991
Final: CF = 0.9991 (Strong — assert as primary mapping)
```

**Interpretation thresholds:**
- CF ≥ 0.80: Strong — assert normally
- CF 0.60–0.79: Moderate — assert with note
- CF 0.40–0.59: Weak — assert with uncertainty flag ⚠
- CF < 0.40: Very weak — do not assert; require expert review 🚫

### 7.3 Fuzzy Yoga-Path Membership

**Motivation:** Verse 6.47 ("the greatest yogi worships Me with devotion") clearly belongs to Chapter 6 (Dhyana Yoga) but its *content* is unmistakably Bhakti Yoga. Crisp classification would force: DhyanaYoga (chapter-based rule). Fuzzy classification reveals:

```
μ_DhyanaYoga(Verse_6_47)  = 1.0  (chapter context — max membership)
μ_BhaktiYoga(Verse_6_47)  = 1.0  (text: "worships Me with devotion" — primary)
μ_JnanaYoga(Verse_6_47)   = 0.8  (AtmaJnana concept taught)
μ_KarmaYoga(Verse_6_47)   = 0.5  (some action/karma elements)
```

**Membership function:** `μ_Path(verse) = max over all concepts taught by verse of concept_membership[concept][Path]`

**Linguistic labels:**
- μ ≥ 0.80: "High"
- μ 0.50–0.79: "Medium"
- μ 0.20–0.49: "Low"
- μ < 0.20: "None"

**Dual-membership verses** (μ ≥ 0.5 in 2+ paths): Verse_6_47, Verse_3_9, Verse_2_71 — these are the most philosophically rich, multi-dimensional verses.

### 7.4 Non-Monotonic Reasoning

**Default Logic notation:**
```
Default rule (after reading Chapter 2):
  M(karmaYoga_primary(reader)) → karmaYoga_primary(reader)
  [If it is consistent to assume Karma Yoga is primary, assume it]

Exception (after reading Verse 3.3 with contemplative reader):
  ¬karmaYoga_primary(reader) ∧ jnanaYoga_primary(reader)
  [The default is retracted; Jnana Yoga is asserted]
```

**Belief revision sequence:**
```
Initial (Chapter 2 defaults):
  ACTIVE: "Karma Yoga is recommended for all readers"
  ACTIVE: "All verses recommend action over renunciation"
  ACTIVE: "Reader is suited for Karma Yoga (active path)"

After Verse 3.3 (reader is contemplative):
  RETRACTED: "Karma Yoga is recommended for all readers"
             [Retracted by: Verse_3_3]
  RETRACTED: "Reader is suited for Karma Yoga"
             [Retracted by: Verse_3_3 + nature=contemplative]
  ADDED: "Two paths: Jnana for contemplatives, Karma for active"
  ADDED: "Jnana Yoga recommended for this reader"

After Verse 6.47:
  RETRACTED: "Two paths exist" [Retracted by: Verse_6_47]
  ADDED: "All paths lead to Krishna; Bhakti is the highest"
```

**Key property:** This is **open-world, non-monotonic reasoning**. In classical (monotonic) logic, adding Verse 3.3 can only *add* conclusions. In non-monotonic reasoning, adding Verse 3.3 *retracts* the earlier conclusion about Karma Yoga. The knowledge base grows, but the set of derived conclusions may shrink.

---

## 8. System Integration & UI

### 8.1 Data Flow

```
reader_query
    ↓
ExpertSystem.infer()          [Module 4 — production rules]
    ↓ recommend_concept
SearchAgent.bfs_reading_list() [Module 3 — BFS]
    ↓ verse list
UncertaintyHandler.compute_verse_cf() [Module 6 — CF weighting]
    ↓ weighted verses
StudyPlanner.generate_plan()  [Module 5 — CSP]
    ↓ 5-session plan
Streamlit UI                  [8 pages, animated dark theme]
    ↓
reader_response
```

### 8.2 UI Architecture

The Streamlit app has 8 pages, each backed by one or more modules:

| Page | Backing Module(s) | Key Plotly Chart |
|---|---|---|
| Home | M1 (PEAS display) | Metric cards |
| Verse Browser | CSV dataset | — (card list) |
| Knowledge Graph | M2 (NetworkX→Plotly) | Force-directed graph |
| Graph Search | M3 | f-value expansion table |
| Ask the Gītā | M4 (SPARQL + Expert) | DataFrame results |
| Study Planner | M5 | Horizontal bar timeline |
| Uncertainty | M6 | CF bars + Radar chart |
| Expert System | M4 | Rule base table |

### 8.3 Performance Characteristics

| Operation | Time Complexity | Measured on 61-node graph |
|---|---|---|
| TTL parse + graph build | O(T) where T=triples | <0.5s for 658 triples |
| BFS reading list | O(V+E) = O(236) | Instantaneous |
| DFS downfall chain | O(depth) = O(4) | Instantaneous |
| A* to Moksha | O(V log V) ≈ O(61×6) | Instantaneous |
| CSP plan generation | Exponential worst case; practical O(ms) | <100ms with MRV+FC |
| SPARQL query | O(T) = O(658) | <50ms |

---

## 9. Dataset

### 9.1 `Bhagwad_Gita.csv`

- **Rows:** 701 (all 18 chapters, 700 verses + header)
- **Columns:** ID, Chapter, Verse, Shloka (Sanskrit), Transliteration, HinMeaning, EngMeaning, WordMeaning
- **Source:** Public domain Gītā text
- **Usage in GitaGraph:** Verse Browser page (all 701 verses searchable); AI corpus uses 30 verses from Ch2/3/6 encoded in the TTL ontology

### 9.2 `knowledge_base/gita_ontology.ttl`

- **Format:** RDF Turtle (`.ttl`)
- **Triples:** 658
- **Compatibility:** Apache Jena Fuseki, RDFLib, Protégé (HermiT reasoner)
- **Hand-crafted:** All 30 verse instances, 24 concept instances, and relationships were manually encoded with authentic Sanskrit text and scholarly translations

---

## 10. Results & Analysis

### 10.1 Search Algorithm Results

| Query | Algorithm | Result | Verified Against |
|---|---|---|---|
| Reading list for NishkamaKarma (2 hops) | BFS | 7 verses | Manual graph traversal |
| Downfall chain from Kama | DFS | 4 nodes: Kama→Krodha→Moha→BuddhiNasha | Gītā 2.62–2.63 |
| Shortest path Vairagya → Moksha | A* | 3 hops | Category-distance guarantee |
| Shortest path DhyanaYoga → Moksha | A* | 3 hops | Same length as Vairagya |
| Shortest path NishkamaKarma → Moksha | A* | 3 hops | Via ChittaShuddhi |

### 10.2 Expert System Accuracy

Tested against 4 reader profiles:
- **Anxious Beginner:** Rules R5, R1, R2 fire → Verse_6_10 (CF=0.92) — correct
- **Meditating Intermediate:** Rules R5 fires → Verse_6_10 — correct
- **Duty-Confused + contemplative + read 3.3:** Rules R6, R7 fire → JnanaYoga — correct
- **Advanced + liberation goal:** Rule R8 fires → Verse_6_47 — correct

### 10.3 CSP Plan Quality

- **Meditation plan:** Ch6 verse appears in Session 2 (goal: "by Session 3") ✓
- **Anxiety plan:** Verse_2_47 appears in Session 1 (goal: "by Session 2") ✓
- **Chapter coverage:** All plans cover {2, 3, 6} ✓
- **Downfall chain:** {2.62, 2.63} always appear together ✓
- **No repetition:** Verified across all generated plans ✓

---

## 11. Limitations & Future Work

### 11.1 Current Limitations

1. **OWL inference without Fuseki:** RDFLib's native SPARQL does not perform OWL reasoning. CQ3 (`leadsTo+`) uses SPARQL 1.1 property paths, which simulate transitivity but do not use the `owl:TransitiveProperty` declaration. Full reasoning requires Apache Jena Fuseki with OWL-DL mode.

2. **Corpus size:** 30 verses covers key themes but misses major Gītā concepts from Chapters 4 (Karma-Jnana synthesis), 7 (Knowledge of the Absolute), and 18 (final synthesis). Future work: encode all 700 verses.

3. **Natural language input:** The keyword-matching expert system is augmented by semantic search (sentence-transformers) but the production-rule side still uses hardcoded string matching. An intent classification layer would improve robustness.

4. **CSP scalability:** With 30 verses and 5 sessions, the domain is manageable. Scaling to 700 verses would require constraint propagation (AC-3) and smarter domain ordering beyond MRV.

5. **Ollama latency:** The local LLM (Ollama) can take 15–60 seconds on CPU-only machines. GPU acceleration (`OLLAMA_GPU=1`) or a smaller model (phi3.5) reduces this.

### 11.2 Completed Extensions (v2.1)

1. **Semantic RAG search** — `all-MiniLM-L6-v2` 384-dim embeddings over all 701 verses; cosine similarity ranking; fully local, no API key
2. **Ollama commentary** — per-verse contextualised explanation via local LLM; graceful fallback message when Ollama is not running
3. **IDDFS UI wiring** — iterative-deepening search now has its own tab in Search page with per-depth iteration trace and nodes-explored counter
4. **SQLite user state** — study plans and per-verse progress persist across browser sessions via localStorage session ID
5. **Flashcard quiz mode** — flip-card quiz over any generated study plan with correct/incorrect score tracking
6. **Print/export** — formatted print view of any study plan (opens browser print dialog)
7. **Virtual scrolling** — `@tanstack/react-virtual` windowed list for 700+ verse cards
8. **Search history** — localStorage chips for recent searches, one-click recall
9. **Verse comparison** — pin up to 3 verses for side-by-side comparison panel
10. **CF-weighted edges** — D3 edge `strokeWidth` driven by MYCIN combined CF of source verse
11. **Mobile sidebar** — hamburger toggle on small screens with animated drawer and backdrop overlay

### 11.3 Future Extensions

1. **Full OWL reasoner integration:** Use Owlready2 + HermiT for complete Description Logic inference
2. **All 18 chapters in AI corpus:** Encode the complete Gītā (700 verses) with automated TTL generation
3. **Fuseki SPARQL endpoint:** Deploy Apache Jena Fuseki for production-grade SPARQL with OWL reasoning
4. **Personalised CF:** Learn tradition weights from reader feedback using Bayesian updating
5. **Multi-agent extension:** Model the three commentary traditions as separate agents that negotiate verse interpretations

---

## 12. New API Endpoints (v2.1)

| Endpoint | Method | Description |
|---|---|---|
| `/api/semantic_search` | GET | Cosine similarity search over 701 verse embeddings. Params: `q`, `k` |
| `/api/contextualize` | POST | Ollama local-LLM commentary. Body: `verse_ref`, `english`, `user_query`, `model` |
| `/api/iddfs` | POST | Iterative deepening DFS with per-depth iteration trace. Body: `start`, `goal`, `max_depth` |
| `/api/plans/save` | POST | Persist generated study plan to SQLite. Body: `session_id`, `goal`, `plan` |
| `/api/plans/list` | GET | List saved plans for a session. Param: `session_id` |
| `/api/progress/update` | POST | Upsert verse completion status. Body: `user_session_id`, `chapter`, `verse`, `completed` |
| `/api/progress/get` | GET | Get all progress entries for a session. Param: `user_session_id` |

**Total endpoints: 24** (17 original + 7 new)

---

## 13. Team & Contributions

This project was developed by the following team for the AI Minor Project at NIT Kurukshetra:

| Member | GitHub | Module & Responsibilities |
| :--- | :--- | :--- |
| **Ravi Kant Gupta** | [@DevRaviX](https://github.com/DevRaviX) | **Team Lead** · M1 (PEAS); M2 (OWL 2 ontology); M7 (Semantic RAG, Ollama); React SPA |
| **Hariom Rajput** | [@Hariomrajput7049](https://github.com/Hariomrajput7049) | **Expert System** · M4 (9-rule engine, SPARQL CQs, specificity conflict resolution) |
| **Ayushi Choyal** | [@KA1117](https://github.com/KA1117) | **Uncertainty** · M6 (MYCIN CF, fuzzy logic, non-monotonic belief revision) |
| **Shouryavi Awasthi** | [@shouryaviawasthi](https://github.com/shouryaviawasthi) | **Graph & CSP** · M3 (BFS/DFS/A*/IDDFS); M5 (CSP backtracking, MRV, FC) |

---

*Documentation prepared for AI Minor Project submission | GitaGraph v2.1 | GitaGraph Team*
