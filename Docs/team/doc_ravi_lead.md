# 📘 Ravi (Team Lead) — Knowledge Representation, OWL Ontology, RDF, System Architecture & Frontend

> **Role:** Team Lead — Knowledge Base Design, System Integration, API Architecture, Frontend  
> **Modules owned:** `backend/modules/knowledge_graph.py` · `backend/api.py` · `frontend/src/` (entire frontend)  
> **AI Concepts:** RDF/OWL · SPARQL · Knowledge Representation · Agent Architecture · PEAS

---

## 1. What You Own — Big Picture

You are responsible for the **foundation** that every other module depends on. The knowledge graph stores all facts; if it breaks, nothing works. You also built the Flask REST API that connects the Python AI backend to the JavaScript frontend — making you the integration point of the whole system.

```
Ontology (TTL file)
       ↓
GitaKnowledgeGraph (loads RDF, builds NetworkX graph)
       ↓
backend/api.py (Flask — exposes KG + all modules as REST endpoints)
       ↓
frontend/src/ (React SPA source)
```

---

## 2. Knowledge Representation — Core Theory

### 2.1 Why We Chose RDF/OWL

The Bhagavad Gītā has **structured relationships** between concepts:
- `NishkamaKarma leadsTo Moksha`
- `Kama leadsTo Downfall`
- `Verse_2_47 teaches KarmaYoga`

A **relational database** could store rows, but it cannot reason. RDF/OWL lets us:
1. Define **classes** (types of things)
2. Define **properties** (relationships between things)
3. Add **axioms** (logical rules like transitivity)
4. Run **SPARQL queries** to retrieve structured knowledge

### 2.2 Our Ontology — 16 Classes

```turtle
# From gita_ontology.ttl
:GitaConcept a owl:Class .
:Verse       a owl:Class .
:YogaPath    rdfs:subClassOf :GitaConcept .
:KarmaYoga   rdfs:subClassOf :YogaPath .

# Object Properties
:teaches       a owl:ObjectProperty ;
               rdfs:domain :Verse ;
               rdfs:range  :GitaConcept .

:leadsTo       a owl:ObjectProperty, owl:TransitiveProperty .
#              ↑ This means: if A leadsTo B and B leadsTo C → A leadsTo C
```

**Key ontology classes:**
| Class | Example Instances |
|---|---|
| `YogaPath` | KarmaYoga, JnanaYoga, DhyanaYoga, BhaktiYoga |
| `Attainment` | Moksha, Vairagya, Viveka |
| `DownfallCause` | Kama, Krodha, Lobha, Moha |
| `Practice` | Meditation, Seva, Dhyana |
| `Guna` | Tamas, Rajas, Sattva |
| `EthicalConcept` | Ahimsa, NishkamaKarma, Svadharma |

### 2.3 RDF Triple Structure

Every fact in our system is encoded as a **triple**: `(Subject, Predicate, Object)`.

```
658 triples total. Examples:

(:Verse_2_47,  :teaches,       :NishkamaKarma_inst)
(:Verse_2_47,  :hasTranslation,"You have the right to work...")
(:Verse_2_47,  :inChapter,     :Chapter_2)
(:NishkamaKarma_inst, :leadsTo, :Moksha_inst)
(:KarmaYoga_inst,     rdf:type,  :YogaPath)
```

### 2.4 The `TransitiveProperty` — Why It Matters

```turtle
:leadsTo a owl:TransitiveProperty .
```

This single axiom enables **transitive inference**:
- `Kama leadsTo Anger` ✓ (stored explicitly)
- `Anger leadsTo Delusion` ✓ (stored explicitly)
- `Kama leadsTo Delusion` ✓ (**inferred** — not stored, but OWL can derive it)

This is why SPARQL CQ3 fails without a full OWL reasoner (Fuseki + HermiT) — pure SPARQL doesn't apply OWL reasoning automatically.

---

## 3. Code Walkthrough — `backend/modules/knowledge_graph.py`

### 3.1 Loading the Ontology

```python
class GitaKnowledgeGraph:
    def __init__(self):
        self.rdf = RDFGraph()
        self.rdf.parse("Data/ontology/gita_ontology.ttl", format="turtle")
        self.nx  = nx.DiGraph()   # NetworkX directed graph (for algorithms)
        self.nodes = {}           # name → KGNode objects
        self._build_from_rdf()
```

**Why two graphs?**
- `self.rdf` (rdflib) → for SPARQL queries, OWL reasoning, semantic queries
- `self.nx` (NetworkX) → for graph algorithms (BFS, DFS, A*, shortest path)

Both represent the same data, but optimized for different operations.

### 3.2 Building the NetworkX Graph

```python
def _build_from_rdf(self):
    for s, p, o in self.rdf:
        # Extract subject name from URI
        # gita:Verse_2_47 → "Verse_2_47"
        s_name = str(s).split("#")[-1]
        o_name = str(o).split("#")[-1]
        relation = str(p).split("#")[-1]

        # Add both nodes
        self.nx.add_node(s_name)
        self.nx.add_node(o_name)

        # Add directed edge with relation label
        self.nx.add_edge(s_name, o_name, relation=relation)
```

Every RDF triple becomes a **directed edge** in NetworkX. Now graph algorithms can traverse concepts just like a maze.

### 3.3 The KGNode Dataclass

```python
@dataclass
class KGNode:
    name:          str
    node_type:     str   # "Verse" or "Concept"
    category:      str   # "YogaPath", "DownfallCause", etc.
    definition:    str
    translation:   str   # (for verses)
    chapter_number: int
    verse_number:   int
    certainty:     float  # interpretive certainty (0–1)
    speaker:       str    # "Krishna" or "Arjuna"
```

### 3.4 SPARQL Query Execution

```python
def sparql(self, query_string: str) -> list[dict]:
    results = self.rdf.query(query_string)
    rows = []
    for row in results:
        rows.append({
            str(var): str(row[var]) if row[var] else ""
            for var in results.vars
        })
    return rows
```

SPARQL is SQL for RDF graphs. Example query:
```sparql
SELECT ?verse ?concept WHERE {
    ?verse gita:teaches ?concept .
    ?concept a gita:YogaPath .
}
```
This retrieves all verses that teach a yoga path — in one query.

---

## 4. Code Walkthrough — `backend/api.py` (Flask REST API)

### 4.1 Architecture Pattern

```python
# Lazy singleton — only loads KG once (expensive: parses 658 triples)
_kg = None

def get_kg():
    global _kg
    if _kg is None:
        from modules.knowledge_graph import GitaKnowledgeGraph
        _kg = GitaKnowledgeGraph()   # ~2-3 seconds first load
    return _kg
```

**Why lazy loading?** Flask starts instantly. The KG loads only when the first API call arrives. This avoids slow startup.

### 4.2 Serving the SPA

```python
@app.route("/")
def index():
    return send_from_directory("static", "index.html")
```

During development, Vite serves the React SPA from `frontend/src/` and proxies `/api/*` calls to Flask. For production previews, Flask serves the compiled `frontend/dist/index.html` build.

### 4.3 The Graph Data Endpoint

```python
@app.route("/api/graph")
def graph_data():
    kg = get_kg()
    COLOR_MAP = {
        "Attainment": "#2ECC71",
        "DownfallCause": "#E74C3C",
        ...
    }
    nodes, links = [], []
    for name, node in kg.nodes.items():
        nodes.append({
            "id": name,
            "color": COLOR_MAP.get(node.category, "#666"),
            "size": 10 if node.node_type == "Verse" else 18,
            ...
        })
    for u, v, d in kg.nx.edges(data=True):
        links.append({"source": u, "target": v, "relation": d.get("relation")})
    return jsonify({"nodes": nodes, "links": links})
```

This converts the Python KG into a JSON format D3.js can render as a force-directed graph.

---

## 5. Frontend Architecture — `frontend/` (Digital Bhaṣya 2.0)

### 5.1 Module Structure (React 18 + Vite)

```
frontend/src/
  App.jsx           ← 8 routes · mobile hamburger sidebar
  api.js            ← 24 typed fetch wrappers (GET + POST)
  pages/
    Home.jsx        ← Stats cards · PEAS table
    Verses.jsx      ← 701 verses · virtual scroll · AI/keyword search
                      Ollama commentary · verse comparison panel
    Graph.jsx       ← D3 force-directed · CF-weighted edges
    Search.jsx      ← BFS · DFS · A* · IDDFS tabs
    Ask.jsx         ← Chat inference · SPARQL · Semantic RAG
    Planner.jsx     ← CSP plan · flashcard quiz · print/export
    Uncertainty.jsx ← MYCIN CF · fuzzy radar · belief revision
    Expert.jsx      ← Reader profiles · rule base
  components/
    ui/             ← Badge · Button · Card · CFBar · Tabs …
    layout/         ← Sidebar · PageTransition
```

The React SPA is built with Vite (`npm run build`), which produces `frontend/dist/`. The Flask API serves `frontend/dist/index.html` from the production build. During development, Vite proxies all `/api/*` requests to `http://localhost:8080`.

**Key Libraries:**
- **TanStack Query v5** — caching, `useMutation`, `placeholderData` for smooth UX
- **Framer Motion 11** — page transitions, `AnimatePresence`
- **D3.js v7** — force-directed graph with zoom/pan/drag
- **@tanstack/react-virtual** — windowed rendering for 700+ verse cards

### 5.2 D3.js Force Graph — CF-Weighted Edges

```javascript
// CF scale: combined certainty factor (0–1) → stroke width (1–4 px)
const cfScale = d3.scaleLinear().domain([0, 1]).range([1, 4]).clamp(true)

const link = g.append('g').selectAll('line').data(links).join('line')
  .attr('stroke-width', d => {
    const cf = verseCF[d.source.id] ?? 0
    return cf > 0 ? cfScale(cf) : 1.2
  })
```

Edges from high-CF verses (Verse_2_47: CF=0.9991) appear visually thicker, encoding confidence directly into the graph topology.

### 5.3 Semantic RAG Search

```python
# backend/api.py — /api/semantic_search
q_vec = _st_model.encode([q], normalize_embeddings=True)[0]  # 384-dim
scores = embeddings @ q_vec   # dot product = cosine sim (normalised)
top_k_idx = scores.argsort()[::-1][:k]
```

All 701 verse embeddings are pre-computed (`generate_embeddings.py`) and loaded as a NumPy matrix. Query is encoded at runtime, dot-product gives cosine similarity in O(701) — no index needed at this scale.

### 5.4 Ollama Local Commentary

```python
# backend/api.py — /api/contextualize
res = requests.post("http://localhost:11434/api/generate",
    json={"model": "llama3.2", "prompt": prompt, "stream": False},
    timeout=90)
commentary = res.json().get("response", "")
```

No API key, no cloud dependency. The prompt instructs the model to act as a Gītā scholar and explain the verse in 3 paragraphs relative to the user's situation.

---

## 6. Agent Architecture (PEAS Framework)

This is a key theoretical concept for the viva. Our system is a **Goal-Based Agent**.

| Component | Our System |
|---|---|
| **Performance** | Relevant verses retrieved, shortest path found, valid study plans |
| **Environment** | 30-verse corpus, 23 concepts, 658 RDF triples, partially observable |
| **Actuators** | Returns verse lists, study plans, inference results, graph data |
| **Sensors** | Reader's concern, stated goal, experience stage, nature preference |

**Environment properties:**
- **Partially observable** — system cannot see the reader's full mental state
- **Deterministic** — same inputs always give same outputs
- **Sequential** — reader progresses through chapters in order
- **Discrete** — finite set of verses, concepts, relationships

---

## 7. Professor Q&A — Ravi's Section

### Q1: Why OWL instead of a simple database?

**A:** A relational database stores facts but cannot *reason* about them. OWL adds logical expressivity: class hierarchies (`KarmaYoga` is a subclass of `YogaPath`), property transitivity (`leadsTo` is transitive), and domain/range restrictions. This lets us answer questions like "what does `Kama` ultimately lead to?" by following the transitive chain — something a SQL `JOIN` cannot do without knowing the chain depth in advance.

### Q2: What is a TransitiveProperty and why did you use it?

**A:** A TransitiveProperty is a logical axiom. If `P` is transitive and `A P B` and `B P C`, then `A P C` is automatically inferred. We applied it to `leadsTo` because spiritual causation chains in the Gita are transitive: Kama (desire) leads to anger, anger leads to delusion, so Kama transitively leads to delusion. An OWL reasoner (HermiT) would infer this; our SPARQL queries demonstrate the intended design even without a full reasoner running.

### Q3: Why does SPARQL CQ3 return no results?

**A:** CQ3 tests transitive closure (`leadsTo+` chains). Standard SPARQL 1.1 has property paths (`+`, `*`) but rdflib's SPARQL engine doesn't apply OWL's `TransitiveProperty` axiom at query time — that requires a separate OWL reasoner like HermiT. In production with Apache Jena Fuseki, enabling the OWL reasoner profile would make CQ3 return results. We explicitly document this limitation in the UI.

### Q4: Explain the difference between rdflib and NetworkX in your system.

**A:** `rdflib` is a semantic web library — it understands RDF triples, URI namespaces, and SPARQL syntax. It's used when we need semantic queries. `NetworkX` is a graph algorithms library — it understands nodes, edges, and graph traversal patterns. It's used when we need BFS, DFS, A*, and shortest path. We build both from the same TTL file: `rdflib` parses the ontology, then we iterate over all triples to populate the NetworkX DiGraph. Both are needed because SPARQL ≠ graph traversal.

### Q5: What is the role of `@st.cache_resource` / lazy loading in the API?

**A:** Parsing 658 RDF triples, building a NetworkX graph, and creating KGNode objects takes 2-3 seconds. Doing this on every API request would make the app unusably slow. We use a global singleton (`_kg`) that initializes once — subsequent requests use the cached object in memory. In the Streamlit version, `@st.cache_resource` provides the same pattern. This is the **flyweight design pattern** applied to a heavyweight resource.

### Q6: Explain your frontend architecture. Why no React?

**A:** The project demonstrates AI algorithms, not UI framework complexity. Vanilla JS with a custom router gives us full control with zero build dependencies. Each page is a self-contained function in its own file (80-130 lines). D3.js was chosen specifically for the force-directed graph because it provides fine-grained control over the physics simulation — something a charting library wrapper cannot offer. The only CDN dependencies are D3 v7, Plotly 2.27, and Lucide icons.

### Q7: What is a DiGraph and why did you use it instead of an undirected graph?

**A:** A DiGraph (Directed Graph) has edges with direction: `A → B` is different from `B → A`. We use it because relationships in the Gita ontology are directional: `Verse_2_47 teaches KarmaYoga` (not the reverse), `Kama leadsTo Anger` (not the reverse). An undirected graph would allow BFS to traverse backwards — e.g., following "teaches" from concept to verse — which would give semantically wrong results.

### Q8: How does the color mapping for the knowledge graph work?

**A:** Each node's category (extracted from its OWL class) maps to a consistent color. `DownfallCause` nodes are red (#E74C3C) — visually warning the user. `Attainment` nodes are green (#2ECC71) — representing goals. `YogaPath` nodes are purple (#9B59B6). This is a deliberate semantic color encoding: the graph's visual structure reflects the moral/spiritual structure of the Gita. A reader can immediately see which concepts lead downward (red) vs. upward (green).

---

## 8. Key Numbers to Remember

| Metric | Value |
|---|---|
| Total RDF triples | 658 |
| OWL Classes | 16 |
| Object Properties | 8 |
| Verse instances in KG | 30 |
| Concept instances | 23 |
| Graph edges (NetworkX) | 175 |
| Total Gita verses (CSV) | 701 |
| Knowledge base file | `gita_ontology.ttl` |

---

## 9. How to Demo Your Part (Viva Strategy)

1. **Open http://127.0.0.1:8080** — show the home page with live stats
2. Go to **Knowledge Graph** — explain: "These 24 nodes are OWL concept instances. The edges are object properties from our ontology"
3. Click a node (e.g., `NishkamaKarma_inst`) — show the inspect panel: "You can see its category, definition, and ID from the RDF graph"
4. Toggle "Show Verse Nodes" — explain: "These 30 verse nodes are connected to concepts via `teaches` property"
5. Open `gita_ontology.ttl` in a text editor — show a raw triple, explain subject/predicate/object
6. Run `curl http://127.0.0.1:8080/api/stats` in terminal — show clean JSON response
7. Explain: "Every other module — search, expert system, planner — calls `get_kg()` to get this graph. I own the foundation."
