"""
evaluate.py — Standalone evaluation harness for GitaGraph.

Runs 50 gold queries against 3 retrievers and 4 ablation variants.
No Flask server required. Imports directly from backend/modules/.

Usage:
    python backend/evaluation/evaluate.py
    python backend/evaluation/evaluate.py --queries backend/evaluation/gold_queries.json
    python backend/evaluation/evaluate.py --k 5 --output backend/evaluation/results/
"""

import sys, json, argparse, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))  # lets expert_system.py resolve 'modules.*'

import numpy as np
from rank_bm25 import BM25Okapi

from backend.modules.knowledge_graph import GitaKnowledgeGraph
from backend.modules.expert_system import ExpertSystem
from backend.modules.search_agent import bfs_reading_list
from backend.modules.query_pipeline import solve_query

# ── Paths ─────────────────────────────────────────────────────────────────────
GOLD_PATH   = ROOT / "backend" / "evaluation" / "gold_queries.json"
EMB_PATH    = ROOT / "Data" / "embeddings" / "verse_embeddings.npy"
INDEX_PATH  = ROOT / "Data" / "embeddings" / "verse_index.json"
CSV_PATH    = ROOT / "Data" / "corpus" / "Bhagwad_Gita.csv"
OUT_DIR     = ROOT / "backend" / "evaluation" / "results"

# ── Globals (lazy-loaded) ─────────────────────────────────────────────────────
_kg         = None
_embeddings = None
_index      = None
_csv_rows   = None
_st_model   = None
_bm25       = None
_bm25_keys  = None


def get_kg():
    global _kg
    if _kg is None:
        print("  Loading knowledge graph ...", flush=True)
        _kg = GitaKnowledgeGraph()
    return _kg


def get_embeddings():
    global _embeddings, _index
    if _embeddings is None:
        print("  Loading embeddings ...", flush=True)
        _embeddings = np.load(str(EMB_PATH))
        _index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    return _embeddings, _index


def get_csv_rows():
    global _csv_rows
    if _csv_rows is None:
        import csv
        with open(str(CSV_PATH), encoding="utf-8") as f:
            _csv_rows = list(csv.DictReader(f))
    return _csv_rows


def get_st_model():
    global _st_model
    if _st_model is None:
        from sentence_transformers import SentenceTransformer
        print("  Loading sentence-transformer model ...", flush=True)
        # Uses whichever model is currently cached in Data/embeddings
        # Run generate_embeddings.py first to ensure the model is downloaded
        try:
            _st_model = SentenceTransformer(
                "paraphrase-multilingual-MiniLM-L12-v2", local_files_only=True
            )
        except Exception:
            _st_model = SentenceTransformer(
                "all-MiniLM-L6-v2", local_files_only=True
            )
    return _st_model


def get_bm25():
    global _bm25, _bm25_keys
    if _bm25 is None:
        print("  Building BM25 index (English) ...", flush=True)
        _, index = get_embeddings()
        corpus = []
        keys = []
        for entry in index:
            text = (entry.get("en") or "").lower()
            corpus.append(text.split())
            keys.append(entry["key"])
        _bm25 = BM25Okapi(corpus)
        _bm25_keys = keys
    return _bm25, _bm25_keys


# ── Metric computation ────────────────────────────────────────────────────────

def average_precision_at_k(retrieved: list, relevant: set, k: int = 5) -> float:
    """Compute AP@k for a single query."""
    if not relevant:
        return 0.0
    score = 0.0
    hits = 0
    for i, vkey in enumerate(retrieved[:k]):
        if vkey in relevant:
            hits += 1
            score += hits / (i + 1)
    return score / min(len(relevant), k)


def reciprocal_rank(retrieved: list, relevant: set) -> float:
    for i, vkey in enumerate(retrieved):
        if vkey in relevant:
            return 1.0 / (i + 1)
    return 0.0


def precision_at_k(retrieved: list, relevant: set, k: int) -> float:
    hits = sum(1 for v in retrieved[:k] if v in relevant)
    return hits / k


def compute_metrics(all_retrieved: dict, gold: list, k: int = 5) -> dict:
    """
    all_retrieved: {query_id: [verse_key, ...]} (ranked list)
    gold: list of gold query dicts
    Returns: {map, mrr, p1, p3, p5}
    """
    ap_scores, rr_scores, p1_scores, p3_scores, p5_scores = [], [], [], [], []
    gold_map = {q["id"]: set(q["relevant_verses"]) for q in gold}

    for q in gold:
        qid = q["id"]
        retrieved = all_retrieved.get(qid, [])
        relevant = gold_map[qid]
        ap_scores.append(average_precision_at_k(retrieved, relevant, k))
        rr_scores.append(reciprocal_rank(retrieved, relevant))
        p1_scores.append(precision_at_k(retrieved, relevant, 1))
        p3_scores.append(precision_at_k(retrieved, relevant, 3))
        p5_scores.append(precision_at_k(retrieved, relevant, 5))

    return {
        f"MAP@{k}": round(float(np.mean(ap_scores)), 4),
        "MRR":       round(float(np.mean(rr_scores)), 4),
        "P@1":       round(float(np.mean(p1_scores)), 4),
        "P@3":       round(float(np.mean(p3_scores)), 4),
        "P@5":       round(float(np.mean(p5_scores)), 4),
    }


# ── Retrieval functions ───────────────────────────────────────────────────────

def retrieve_bm25(query: str, k: int = 5) -> list:
    bm25, keys = get_bm25()
    tokens = query.lower().split()
    scores = bm25.get_scores(tokens)
    top_idx = np.argsort(scores)[::-1][:k]
    return [keys[i] for i in top_idx]


def retrieve_semantic(query: str, k: int = 5) -> list:
    embeddings, index = get_embeddings()
    model = get_st_model()
    q_vec = model.encode([query], normalize_embeddings=True)[0]
    scores = embeddings @ q_vec
    top_idx = np.argsort(scores)[::-1][:k]
    return [index[i]["key"] for i in top_idx]


def retrieve_full_system(query: str, k: int = 5,
                         disable_semantic: bool = False,
                         disable_graph: bool = False,
                         disable_expert: bool = False,
                         disable_ontology: bool = False) -> list:
    """Full pipeline with optional ablation flags."""
    kg = get_kg()
    csv_rows = get_csv_rows()

    semantic_results = []
    if not disable_semantic:
        embeddings, index = get_embeddings()
        model = get_st_model()
        q_vec = model.encode([query], normalize_embeddings=True)[0]
        scores = embeddings @ q_vec
        top_idx = np.argsort(scores)[::-1][:10]
        for i in top_idx:
            entry = dict(index[i])
            entry["score"] = float(scores[i])
            semantic_results.append(entry)

    if disable_ontology:
        # Return pure semantic ranking, no KG involved
        return [r["key"] for r in semantic_results[:k]]

    if disable_expert:
        # Use top-1 semantic result's concept as the concept, skip ExpertSystem
        concept = ""
        if semantic_results:
            vkey = semantic_results[0]["key"]
            concepts = list(kg.neighbours_by_edge(vkey, "teaches"))
            if concepts:
                concept = concepts[0]
        # Inject concept into query to guide solve_query
        modified_query = (concept + " " + query).strip() if concept else query
        result = solve_query(
            query=modified_query,
            kg=kg,
            csv_rows=csv_rows,
            semantic_results=semantic_results if not disable_semantic else None,
        )
    else:
        result = solve_query(
            query=query,
            kg=kg,
            csv_rows=csv_rows,
            semantic_results=semantic_results if not disable_semantic else None,
        )

    evidence = result.get("evidence", [])

    if disable_graph:
        # Keep only expert start verse + semantic results, strip graph BFS entries
        evidence = [e for e in evidence if "graph_bfs" not in e.get("sources", [])]

    keys = []
    for e in evidence:
        vkey = e.get("key")
        if vkey and vkey not in keys:
            keys.append(vkey)
        if len(keys) >= k:
            break

    # Pad with semantic results if under k
    for r in semantic_results:
        if len(keys) >= k:
            break
        if r["key"] not in keys:
            keys.append(r["key"])

    return keys[:k]


# ── Main evaluation loop ──────────────────────────────────────────────────────

VARIANTS = [
    ("bm25_baseline",   "BM25 Baseline (English keyword)"),
    ("semantic_only",   "Semantic RAG only (no expert, no graph, no ontology filter)"),
    ("full_system",     "Full System (all modules active)"),
    ("no_expert_rules", "Ablation: No Expert Rules"),
    ("no_semantic",     "Ablation: No Semantic RAG"),
    ("no_graph",        "Ablation: No Graph BFS"),
    ("no_ontology",     "Ablation: No Ontology (pure embedding rank)"),
]


def run_all(gold: list, k: int = 5) -> dict:
    """Run all variants over all 50 queries. Returns per-variant results."""
    results = {vid: {} for vid, _ in VARIANTS}

    print(f"\nRunning evaluation over {len(gold)} queries × {len(VARIANTS)} variants ...\n")

    for q in gold:
        qid   = q["id"]
        query = q["query_en"]   # Use English query for all variants
        query_hi = q.get("query_hi", query)

        for vid, label in VARIANTS:
            try:
                if vid == "bm25_baseline":
                    retrieved = retrieve_bm25(query, k)
                elif vid == "semantic_only":
                    retrieved = retrieve_full_system(query, k,
                        disable_expert=True, disable_graph=True, disable_ontology=True)
                elif vid == "full_system":
                    retrieved = retrieve_full_system(query, k)
                elif vid == "no_expert_rules":
                    retrieved = retrieve_full_system(query, k, disable_expert=True)
                elif vid == "no_semantic":
                    retrieved = retrieve_full_system(query, k, disable_semantic=True)
                elif vid == "no_graph":
                    retrieved = retrieve_full_system(query, k, disable_graph=True)
                elif vid == "no_ontology":
                    retrieved = retrieve_full_system(query, k, disable_ontology=True)
                else:
                    retrieved = []
            except Exception as e:
                print(f"  [WARN] {vid} / {qid}: {e}")
                retrieved = []

            results[vid][qid] = retrieved

    return results


def run_hindi_subset(gold: list, k: int = 5) -> dict:
    """Run full_system and semantic variants on Hindi-only queries (Q46-Q50)."""
    hindi_queries = [q for q in gold if q["category"] == "multilingual_only"]
    results = {}

    for vid in ["bm25_baseline", "semantic_only", "full_system"]:
        results[vid] = {}
        for q in hindi_queries:
            qid = q["id"]
            query_hi = q["query_hi"]
            try:
                if vid == "bm25_baseline":
                    retrieved = retrieve_bm25(query_hi, k)
                elif vid == "semantic_only":
                    retrieved = retrieve_full_system(query_hi, k,
                        disable_expert=True, disable_graph=True, disable_ontology=True)
                elif vid == "full_system":
                    retrieved = retrieve_full_system(query_hi, k)
            except Exception as e:
                print(f"  [WARN] Hindi {vid} / {qid}: {e}")
                retrieved = []
            results[vid][qid] = retrieved

    return results


def print_summary_table(summary: dict, k: int = 5):
    header = f"{'Variant':<40} {'MAP@'+str(k):>8} {'MRR':>8} {'P@1':>6} {'P@3':>6} {'P@5':>6}"
    print("\n" + "=" * len(header))
    print(header)
    print("=" * len(header))
    for vid, label in VARIANTS:
        if vid not in summary:
            continue
        m = summary[vid]
        print(f"{label:<40} {m['MAP@'+str(k)]:>8.4f} {m['MRR']:>8.4f} "
              f"{m['P@1']:>6.4f} {m['P@3']:>6.4f} {m['P@5']:>6.4f}")
    print("=" * len(header))


def main():
    parser = argparse.ArgumentParser(description="GitaGraph evaluation harness")
    parser.add_argument("--queries", default=str(GOLD_PATH))
    parser.add_argument("--k",       type=int, default=5)
    parser.add_argument("--output",  default=str(OUT_DIR))
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    gold = json.loads(Path(args.queries).read_text(encoding="utf-8"))
    print(f"Loaded {len(gold)} gold queries from {args.queries}")

    # Warm up shared resources
    print("\nInitialising resources ...")
    get_kg()
    get_embeddings()
    get_st_model()
    get_bm25()

    t0 = time.time()

    # Main evaluation (English queries)
    all_retrieved = run_all(gold, args.k)

    # Compute metrics per variant
    summary = {}
    for vid, _ in VARIANTS:
        summary[vid] = compute_metrics(all_retrieved[vid], gold, args.k)

    # Hindi-only evaluation
    print("\nRunning Hindi-only subset (Q46-Q50) ...")
    hindi_retrieved = run_hindi_subset(gold, args.k)
    hindi_gold = [q for q in gold if q["category"] == "multilingual_only"]
    hindi_summary = {}
    for vid in ["bm25_baseline", "semantic_only", "full_system"]:
        if vid in hindi_retrieved:
            hindi_summary[vid] = compute_metrics(hindi_retrieved[vid], hindi_gold, args.k)

    elapsed = time.time() - t0

    # Print to console
    print_summary_table(summary, args.k)
    print(f"\nHindi-only subset (Q46-Q50):")
    for vid, m in hindi_summary.items():
        print(f"  {vid:<30} MAP@{args.k}={m['MAP@'+str(args.k)]:.4f}  MRR={m['MRR']:.4f}")
    print(f"\nTotal time: {elapsed:.1f}s")

    # Save detailed results
    detail_path = out_dir / "evaluation_results.json"
    detail_path.write_text(json.dumps({
        "k": args.k,
        "num_queries": len(gold),
        "variants": {
            vid: {
                qid: {
                    "retrieved": retrieved,
                    "relevant":  next(q["relevant_verses"] for q in gold if q["id"] == qid),
                    "ap_at_k":   average_precision_at_k(
                                    retrieved,
                                    set(next(q["relevant_verses"] for q in gold if q["id"] == qid)),
                                    args.k
                                 ),
                }
                for qid, retrieved in per_q.items()
            }
            for vid, per_q in all_retrieved.items()
        },
        "hindi_variants": {
            vid: {
                qid: {"retrieved": retrieved}
                for qid, retrieved in per_q.items()
            }
            for vid, per_q in hindi_retrieved.items()
        },
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    # Save summary table
    summary_path = out_dir / "summary_table.json"
    summary_path.write_text(json.dumps({
        "k": args.k,
        "elapsed_seconds": round(elapsed, 2),
        "variants": [
            {"id": vid, "label": label, "metrics": summary.get(vid, {})}
            for vid, label in VARIANTS
        ],
        "hindi_only": [
            {"id": vid, "metrics": hindi_summary.get(vid, {})}
            for vid in ["bm25_baseline", "semantic_only", "full_system"]
        ],
    }, indent=2), encoding="utf-8")

    print(f"\nResults saved:")
    print(f"  {detail_path}")
    print(f"  {summary_path}")


if __name__ == "__main__":
    main()
