"""
api.py — Digital Bhaṣya Flask REST API
Serves the static SPA and exposes all AI modules as JSON endpoints.
Run: python api.py
"""

import os, sys, json, csv
from flask import Flask, jsonify, request, send_from_directory
from functools import lru_cache

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_folder="static", static_url_path="")

# ── Resource loading (lazy, cached) ──────────────────────────────────────────
_kg = None
_gita_data = None

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
        out.append({"chapter": c, "verse": v, "key": vkey,
                    "en": r.get("EngMeaning",""), "hi": r.get("HinMeaning",""),
                    "sa": r.get("Shloka",""), "ai_corpus": vkey in kg.nodes,
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

if __name__ == "__main__":
    print("🪷 Digital Bhaṣya API starting at http://localhost:8080")
    app.run(debug=True, port=8080, host="127.0.0.1")
