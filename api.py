"""
api.py — Digital Bhaṣya Flask REST API
Serves the static SPA and exposes all AI modules as JSON endpoints.
Run: python api.py
"""

import os, sys, json, csv, io, sqlite3, datetime, re
from flask import Flask, jsonify, request, send_from_directory, Response
from functools import lru_cache

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_folder="static", static_url_path="")

# ── SQLite user state ─────────────────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_data.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS plans (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT NOT NULL,
            goal        TEXT,
            plan_json   TEXT NOT NULL,
            created_at  TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS progress (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_session_id TEXT NOT NULL,
            chapter         TEXT NOT NULL,
            verse           TEXT NOT NULL,
            completed       INTEGER NOT NULL DEFAULT 0,
            updated_at      TEXT NOT NULL,
            UNIQUE(user_session_id, chapter, verse)
        );
    """)
    conn.commit()
    conn.close()

init_db()

# ── Resource loading (lazy, cached) ──────────────────────────────────────────
_kg = None
_gita_data = None
_audio_ds = None
_embeddings = None
_emb_index  = None
_st_model   = None

def get_embeddings():
    global _embeddings, _emb_index
    if _embeddings is None:
        import numpy as np
        emb_dir = os.path.join(os.path.dirname(__file__), "embeddings")
        _embeddings = np.load(os.path.join(emb_dir, "verse_embeddings.npy"))
        with open(os.path.join(emb_dir, "verse_index.json"), encoding="utf-8") as f:
            _emb_index = json.load(f)
    return _embeddings, _emb_index

def get_audio_ds():
    global _audio_ds
    if _audio_ds is None:
        import glob as _glob, pyarrow.parquet as pq, pyarrow as pa
        local_cache = os.path.join(os.path.dirname(__file__), "audio_cache")
        parquet_files = sorted(_glob.glob(os.path.join(local_cache, "*.parquet")))
        if not parquet_files:
            raise FileNotFoundError("Run download_audio.py first to cache the dataset.")
        # Read all parquet files and concat — avoid datasets audio decoder
        tables = [pq.read_table(f) for f in parquet_files]
        table = pa.concat_tables(tables)
        # Build lookup: shloka_id → row index
        ids = table.column("shloka_id").to_pylist()
        _audio_ds = {"_table": table, "_ids": {sid: i for i, sid in enumerate(ids)}}
    return _audio_ds

def get_kg():
    global _kg
    if _kg is None:
        from modules.knowledge_graph import GitaKnowledgeGraph
        _kg = GitaKnowledgeGraph()
    return _kg

def get_gita_data():
    global _gita_data
    if _gita_data is None:
        path = os.path.join(os.path.dirname(__file__), "Bhagwad_Gita.csv")
        rows = []
        with open(path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                rows.append(row)
        _gita_data = rows
    return _gita_data

# ── Serve SPA ─────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

# ── HOME STATS ────────────────────────────────────────────────────────────────
@app.route("/api/stats")
def stats():
    kg = get_kg()
    s = kg.stats()
    return jsonify({
        "total_verses": len(get_gita_data()),
        "ai_verses": s["verses"],
        "concepts": s["concepts"],
        "edges": s["edges"],
        "rdf_triples": s["rdf_triples"],
        "modules": 6,
    })

# ── KNOWLEDGE GRAPH DATA ───────────────────────────────────────────────────────
@app.route("/api/graph")
def graph_data():
    kg = get_kg()
    show_verses = request.args.get("verses", "true") == "true"
    COLOR_MAP = {
        "Attainment": "#2ECC71", "Practice": "#3498DB", "YogaPath": "#9B59B6",
        "DownfallCause": "#E74C3C", "Guna": "#E67E22", "EthicalConcept": "#1ABC9C",
        "Verse": "#C9A84C", "Chapter": "#95A5A6", "Person": "#F39C12",
    }
    nodes, links = [], []
    for name, node in kg.nodes.items():
        if node.node_type == "Verse" and not show_verses:
            continue
        cat = node.category or node.node_type
        nodes.append({
            "id": name,
            "type": node.node_type,
            "category": cat,
            "color": COLOR_MAP.get(cat, COLOR_MAP.get(node.node_type, "#666")),
            "size": 10 if node.node_type == "Verse" else 18 if node.node_type == "Concept" else 8,
            "label": f"{node.chapter_number}.{node.verse_number}" if node.node_type == "Verse" else name.replace("_inst","").replace("_"," "),
            "definition": (node.definition or "")[:120],
            "translation": (node.translation or "")[:120],
            "chapter": node.chapter_number,
            "verse_number": node.verse_number,
            "speaker": node.speaker,
            "certainty": node.certainty,
        })
    node_ids = {n["id"] for n in nodes}
    REL_COLOR = {"leadsTo":"#C9A84C","teaches":"#3498DB","contrastsWith":"#E74C3C",
                 "subConceptOf":"#9B59B6","requires":"#1ABC9C","respondsTo":"#E67E22"}
    for u, v, d in kg.nx.edges(data=True):
        if u in node_ids and v in node_ids:
            rel = d.get("relation","")
            links.append({"source": u, "target": v, "relation": rel,
                          "color": REL_COLOR.get(rel, "#444")})
    return jsonify({"nodes": nodes, "links": links})

# ── VERSE BROWSER ─────────────────────────────────────────────────────────────
@app.route("/api/verses")
def verses():
    rows = get_gita_data()
    kg = get_kg()
    q = request.args.get("q","").lower()
    ch = request.args.get("chapter","")
    limit = int(request.args.get("limit", 30))
    if ch and ch != "all":
        rows = [r for r in rows if r.get("Chapter","") == ch]
    if q:
        rows = [r for r in rows if q in r.get("EngMeaning","").lower()
                or q in r.get("Shloka","").lower() or q in r.get("HinMeaning","").lower()]
    out = []
    for r in rows[:limit]:
        c, v = r.get("Chapter",""), r.get("Verse","")
        vkey = f"Verse_{c}_{v}"
        concepts = []
        if vkey in kg.nodes:
            concepts = list(kg.neighbours_by_edge(vkey, "teaches"))
        import re
        def strip_prefix(text):
            # Remove "1.1 ", "1.2. ", "।।1.1।।" verse-number prefixes
            text = re.sub(r'^[\d]+\.[\d]+\.?\s*', '', text.strip())
            text = re.sub(r'^।।[\d]+\.[\d]+।।', '', text.strip())
            return text.strip()
        raw_wm = r.get("WordMeaning","")
        clean_wm = re.sub(r'^[\d]+\.[\d]+\.?\s*', '', raw_wm.strip())
        out.append({"chapter": c, "verse": v, "key": vkey,
                    "en": strip_prefix(r.get("EngMeaning","")),
                    "hi": strip_prefix(r.get("HinMeaning","")),
                    "sa": r.get("Shloka",""),
                    "transliteration": r.get("Transliteration",""),
                    "word_meanings": clean_wm,
                    "ai_corpus": vkey in kg.nodes,
                    "concepts": [c.replace("_inst","").replace("_"," ") for c in concepts]})
    return jsonify({"total": len(rows), "verses": out})

# ── BFS ───────────────────────────────────────────────────────────────────────
@app.route("/api/bfs", methods=["POST"])
def bfs():
    from modules.search_agent import bfs_reading_list
    kg = get_kg()
    body = request.json or {}
    concept = body.get("concept","NishkamaKarma")
    hops = int(body.get("hops", 2))
    results = bfs_reading_list(concept, kg, hops)
    return jsonify({"results": results, "count": len(results), "concept": concept, "hops": hops})

# ── DFS ───────────────────────────────────────────────────────────────────────
@app.route("/api/dfs", methods=["POST"])
def dfs():
    from modules.search_agent import dfs_chain
    kg = get_kg()
    body = request.json or {}
    start = body.get("start","Kama")
    result = dfs_chain(start, kg, "leadsTo")
    return jsonify(result)

# ── A* ────────────────────────────────────────────────────────────────────────
@app.route("/api/astar", methods=["POST"])
def astar():
    from modules.search_agent import astar_to_moksha, COMPLEXITY_TABLE
    kg = get_kg()
    body = request.json or {}
    start = body.get("start","Vairagya")
    goal = body.get("goal","Moksha")
    result = astar_to_moksha(start, kg, goal)
    return jsonify({**result, "complexity": COMPLEXITY_TABLE})

# ── CONCEPT LIST ──────────────────────────────────────────────────────────────
@app.route("/api/concepts")
def concepts():
    kg = get_kg()
    names = sorted([n for n,node in kg.nodes.items() if node.node_type=="Concept"])
    return jsonify({"concepts": names})

# ── SPARQL CQ ─────────────────────────────────────────────────────────────────
@app.route("/api/sparql/<cq_id>")
def sparql_cq(cq_id):
    from modules.expert_system import SPARQL_QUERIES
    kg = get_kg()
    if cq_id not in SPARQL_QUERIES:
        return jsonify({"error": "Unknown CQ"}), 404
    cq = SPARQL_QUERIES[cq_id]
    try:
        rows = kg.sparql(cq["query"])
        return jsonify({"question": cq["question"], "technique": cq["technique"],
                        "query": cq["query"], "rows": rows, "count": len(rows)})
    except Exception as e:
        return jsonify({"error": str(e), "query": cq["query"], "rows": []})

# ── EXPERT SYSTEM INFER ───────────────────────────────────────────────────────
@app.route("/api/infer", methods=["POST"])
def infer():
    from modules.expert_system import ExpertSystem, PRODUCTION_RULES
    kg = get_kg()
    body = request.json or {}
    es = ExpertSystem(kg)
    result = es.infer(concern=body.get("concern",""), goal=body.get("goal",""),
                      stage=body.get("stage","beginner"), nature=body.get("nature","active"))
    rules_info = [{
        "name": r.name, "description": r.description,
        "specificity": r.specificity, "cf": r.cf,
        "fired": r.name in [f for f,_ in result["fired_rules"]]
    } for r in sorted(PRODUCTION_RULES, key=lambda x: -x.specificity)]
    return jsonify({
        "fired_rules": result["fired_rules"],
        "rules_info": rules_info,
        "recommend_concept": result["recommend_concept"],
        "start_verse": result["start_verse"],
        "confidence": result["confidence"],
        "recommended_verses": result["recommended_verses"][:3],
    })

# ── EXPERT SYSTEM PROFILES ────────────────────────────────────────────────────
@app.route("/api/profiles")
def profiles():
    from modules.expert_system import ExpertSystem, PRODUCTION_RULES
    kg = get_kg()
    es = ExpertSystem(kg)
    demos = es.reader_profiles_demo()
    out = []
    for d in demos:
        r = d["inference"]
        out.append({"label": d["label"], "concern": d["concern"], "goal": d["goal"],
                    "fired_rules": r["fired_rules"], "confidence": r["confidence"],
                    "recommend_concept": r["recommend_concept"], "start_verse": r["start_verse"]})
    rules = [{"name": r.name, "description": r.description, "specificity": r.specificity, "cf": r.cf}
             for r in sorted(PRODUCTION_RULES, key=lambda x: -x.specificity)]
    return jsonify({"demos": out, "rules": rules})

# ── CSP PLANNER ───────────────────────────────────────────────────────────────
@app.route("/api/plan", methods=["POST"])
def plan():
    from modules.study_planner import StudyPlanner, GOAL_CONSTRAINTS
    kg = get_kg()
    body = request.json or {}
    planner = StudyPlanner(kg)
    result = planner.generate_plan(reader_goal=body.get("goal","general"),
                                   num_sessions=int(body.get("sessions",5)),
                                   verses_per_session=int(body.get("verses_per",2)))
    return jsonify({**result, "goals": list(GOAL_CONSTRAINTS.keys())})

# ── CF ANALYSIS ───────────────────────────────────────────────────────────────
@app.route("/api/cf", methods=["POST"])
def cf():
    from modules.uncertainty_handler import compute_verse_cf, VERSE_CF_DATA
    body = request.json or {}
    result = compute_verse_cf(body.get("verse","Verse_2_47"), body.get("concept","KarmaYoga_inst"))
    concepts_for_verse = {}
    for v, concepts in VERSE_CF_DATA.items():
        concepts_for_verse[v] = list(concepts.keys())
    return jsonify({**result, "all_verses": list(VERSE_CF_DATA.keys()),
                    "concepts_for_verse": concepts_for_verse})

@app.route("/api/cf/all")
def cf_all():
    from modules.uncertainty_handler import cf_analysis_all
    return jsonify({"results": cf_analysis_all()})

# ── FUZZY MEMBERSHIP ──────────────────────────────────────────────────────────
@app.route("/api/fuzzy/<verse_name>")
def fuzzy(verse_name):
    from modules.uncertainty_handler import fuzzy_yoga_membership, dual_membership_verses, YOGA_PATHS
    kg = get_kg()
    result = fuzzy_yoga_membership(verse_name, kg)
    verse_names = [v.name for v in kg.all_verses() if v.name not in ("Verse_3_1","Verse_6_33")]
    return jsonify({**result, "all_verses": verse_names, "yoga_paths": YOGA_PATHS})

# ── BELIEF REVISION ───────────────────────────────────────────────────────────
@app.route("/api/belief", methods=["POST"])
def belief():
    from modules.uncertainty_handler import NonMonotonicEngine
    body = request.json or {}
    engine = NonMonotonicEngine()
    steps = engine.full_revision_demo()
    return jsonify({"steps": steps})

# ── AUDIO ─────────────────────────────────────────────────────────────────────
@app.route("/api/audio/<chapter>/<verse>")
def audio(chapter, verse):
    shloka_id = f"{chapter}_{verse}"
    try:
        lookup = get_audio_ds()
        idx = lookup["_ids"].get(shloka_id)
        if idx is None:
            return jsonify({"error": f"verse {shloka_id} not found"}), 404
        # Slice single row — audio column is struct<bytes: binary, path: string>
        row = lookup["_table"].slice(idx, 1)
        audio_struct = row.column("audio")[0].as_py()
        wav_bytes = audio_struct.get("bytes") if isinstance(audio_struct, dict) else None
        if not wav_bytes:
            return jsonify({"error": "no audio bytes"}), 404
        return Response(wav_bytes, mimetype="audio/wav",
                        headers={"Cache-Control": "public, max-age=86400"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── SEMANTIC SEARCH ───────────────────────────────────────────────────────────
@app.route("/api/semantic_search")
def semantic_search():
    global _st_model
    import numpy as np
    q = request.args.get("q", "").strip()
    k = int(request.args.get("k", 10))
    if not q:
        return jsonify({"error": "q is required"}), 400
    try:
        embeddings, index = get_embeddings()
    except FileNotFoundError:
        return jsonify({"error": "Embeddings not found. Run generate_embeddings.py first."}), 503
    if _st_model is None:
        from sentence_transformers import SentenceTransformer
        _st_model = SentenceTransformer("all-MiniLM-L6-v2")
    q_vec = _st_model.encode([q], normalize_embeddings=True)[0]
    scores = embeddings @ q_vec
    top_k_idx = scores.argsort()[::-1][:k]
    kg = get_kg()
    results = []
    for i in top_k_idx:
        entry = index[i]
        vkey = entry["key"]
        concepts = []
        if vkey in kg.nodes:
            concepts = list(kg.neighbours_by_edge(vkey, "teaches"))
        results.append({
            **entry,
            "score": float(scores[i]),
            "ai_corpus": vkey in kg.nodes,
            "concepts": [c.replace("_inst","").replace("_"," ") for c in concepts],
        })
    return jsonify({"query": q, "results": results, "count": len(results)})

# ── PLANS (SQLite) ────────────────────────────────────────────────────────────
@app.route("/api/plans/save", methods=["POST"])
def plans_save():
    body = request.json or {}
    session_id = body.get("session_id", "default")
    goal       = body.get("goal", "")
    plan_json  = json.dumps(body.get("plan", []))
    now        = datetime.datetime.utcnow().isoformat()
    conn = get_db()
    cur  = conn.execute(
        "INSERT INTO plans (session_id, goal, plan_json, created_at) VALUES (?,?,?,?)",
        (session_id, goal, plan_json, now)
    )
    conn.commit()
    plan_id = cur.lastrowid
    conn.close()
    return jsonify({"id": plan_id, "saved": True})

@app.route("/api/plans/list")
def plans_list():
    session_id = request.args.get("session_id", "default")
    conn = get_db()
    rows = conn.execute(
        "SELECT id, goal, plan_json, created_at FROM plans WHERE session_id=? ORDER BY created_at DESC",
        (session_id,)
    ).fetchall()
    conn.close()
    result = [{"id": r["id"], "goal": r["goal"],
               "plan": json.loads(r["plan_json"]), "created_at": r["created_at"]}
              for r in rows]
    return jsonify({"plans": result})

# ── PROGRESS (SQLite) ─────────────────────────────────────────────────────────
@app.route("/api/progress/update", methods=["POST"])
def progress_update():
    body      = request.json or {}
    uid       = body.get("user_session_id", "default")
    chapter   = str(body.get("chapter", ""))
    verse     = str(body.get("verse", ""))
    completed = 1 if body.get("completed", False) else 0
    now       = datetime.datetime.utcnow().isoformat()
    conn = get_db()
    conn.execute("""
        INSERT INTO progress (user_session_id, chapter, verse, completed, updated_at)
        VALUES (?,?,?,?,?)
        ON CONFLICT(user_session_id, chapter, verse)
        DO UPDATE SET completed=excluded.completed, updated_at=excluded.updated_at
    """, (uid, chapter, verse, completed, now))
    conn.commit()
    conn.close()
    return jsonify({"updated": True})

@app.route("/api/progress/get")
def progress_get():
    uid = request.args.get("user_session_id", "default")
    conn = get_db()
    rows = conn.execute(
        "SELECT chapter, verse, completed FROM progress WHERE user_session_id=?", (uid,)
    ).fetchall()
    conn.close()
    return jsonify({"progress": [dict(r) for r in rows]})

# ── IDDFS ─────────────────────────────────────────────────────────────────────
@app.route("/api/iddfs", methods=["POST"])
def iddfs():
    kg = get_kg()
    body    = request.json or {}
    start   = body.get("start", "Kama")
    goal    = body.get("goal", "Moksha")
    max_dep = int(body.get("max_depth", 6))

    # Run IDDFS manually to collect per-iteration stats
    def dls_count(current, goal_n, limit, path, counter):
        counter[0] += 1
        path = path + [current]
        if current == goal_n:
            return path
        if limit == 0:
            return None
        for nb in kg.neighbours_by_edge(current, "leadsTo"):
            if nb not in path:
                res = dls_count(nb, goal_n, limit - 1, path, counter)
                if res is not None:
                    return res
        return None

    iterations = []
    total_explored = 0
    found_path = None
    found_depth = None
    for d in range(max_dep + 1):
        counter = [0]
        result = dls_count(start, goal, d, [], counter)
        total_explored += counter[0]
        iterations.append({"depth": d, "nodes_explored": counter[0], "found": result is not None})
        if result is not None:
            found_path = result
            found_depth = d
            break

    if found_path:
        return jsonify({"found": True, "path": found_path, "depth_found": found_depth,
                        "nodes_explored": total_explored, "iterations": iterations})
    return jsonify({"found": False, "path": [], "depth_searched": max_dep,
                    "nodes_explored": total_explored, "iterations": iterations})

# ── OLLAMA CONTEXTUALIZE ───────────────────────────────────────────────────────
@app.route("/api/contextualize", methods=["POST"])
def contextualize():
    import requests as _req
    body       = request.json or {}
    verse_ref  = body.get("verse_ref", "")
    english    = body.get("english", "")
    user_query = body.get("user_query", "general study")
    model      = body.get("model", "llama3.2")
    prompt = (
        f"You are a compassionate Bhagavad Gītā scholar. "
        f"Verse {verse_ref}: \"{english[:300]}\"\n\n"
        f"Explain in 3 short paragraphs how this verse applies to: \"{user_query}\".\n"
        f"Be warm, practical, and grounded. Keep each paragraph under 60 words."
    )
    try:
        res = _req.post(
            "http://localhost:11434/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=90,
        )
        res.raise_for_status()
        commentary = res.json().get("response", "")
        return jsonify({"commentary": commentary, "verse_ref": verse_ref, "model": model})
    except _req.exceptions.ConnectionError:
        return jsonify({"error": "Ollama not running. Start with: ollama serve"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 503

if __name__ == "__main__":
    print("🪷 Digital Bhaṣya API starting at http://localhost:8080")
    app.run(debug=True, port=8080, host="127.0.0.1")
