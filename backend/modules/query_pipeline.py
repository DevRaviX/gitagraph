"""
Unified query pipeline for GitaGraph.

This is the "single brain" abstraction: one user concern enters, and the
pipeline combines expert rules, graph search, optional semantic retrieval,
and path reasoning into one ranked answer.
"""

from __future__ import annotations

import re
from typing import Any

from modules.expert_system import ExpertSystem, PRODUCTION_RULES
from modules.knowledge_graph import GitaKnowledgeGraph
from modules.search_agent import astar_to_moksha, bfs_reading_list


def _strip_prefix(text: str) -> str:
    text = re.sub(r"^[\d]+\.[\d]+\.?\s*", "", (text or "").strip())
    return re.sub(r"^।।[\d]+\.[\d]+।।", "", text).strip()


def _csv_map(csv_rows: list[dict[str, Any]]) -> dict[tuple[str, str], dict[str, Any]]:
    return {(str(r.get("Chapter", "")), str(r.get("Verse", ""))): r for r in csv_rows}


def _verse_name_to_ch_vs(name: str) -> tuple[str | None, str | None]:
    parts = str(name).split("_")
    if len(parts) == 3 and parts[0] == "Verse":
        return parts[1], parts[2]
    return None, None


def _enrich_verse(
    verse: dict[str, Any],
    rows_by_ref: dict[tuple[str, str], dict[str, Any]],
) -> dict[str, Any]:
    chapter = str(verse.get("chapter", verse.get("chapter_number", "")))
    number = str(verse.get("verse_number", verse.get("verse", "")))
    row = rows_by_ref.get((chapter, number), {})

    if not row:
        fallback_name = verse.get("key", verse.get("verse", ""))
        fallback_chapter, fallback_number = _verse_name_to_ch_vs(fallback_name)
        if fallback_chapter and fallback_number:
            row = rows_by_ref.get((fallback_chapter, fallback_number), {})
            chapter = fallback_chapter
            number = fallback_number

    key = verse.get("key") or verse.get("verse") or f"Verse_{chapter}_{number}"
    return {
        **verse,
        "key": key,
        "chapter": chapter,
        "verse_number": number,
        "sa": row.get("Shloka", verse.get("sa", "")),
        "hi": _strip_prefix(row.get("HinMeaning", verse.get("hi", ""))),
        "en": _strip_prefix(
            row.get("EngMeaning", verse.get("en", verse.get("translation", "")))
        ),
        "transliteration": row.get(
            "Transliteration", verse.get("transliteration", "")
        ),
        "word_meanings": row.get("WordMeaning", verse.get("word_meanings", "")),
    }


def _normalise_rule_trace(fired_rules: list[Any]) -> list[dict[str, Any]]:
    rules = {rule.name: rule for rule in PRODUCTION_RULES}
    trace = []
    for item in fired_rules:
        name = item[0] if isinstance(item, (list, tuple)) else item
        rule = rules.get(name)
        trace.append(
            {
                "rule": name,
                "description": rule.description if rule else "",
                "certainty": rule.cf if rule else 0.0,
            }
        )
    return trace


def _merge_evidence(
    start_verse: dict[str, Any] | None,
    graph_results: list[dict[str, Any]],
    semantic_results: list[dict[str, Any]],
    rows_by_ref: dict[tuple[str, str], dict[str, Any]],
) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}

    def add(raw: dict[str, Any], source: str, rank_score: float) -> None:
        enriched = _enrich_verse(raw, rows_by_ref)
        key = enriched["key"]
        existing = merged.get(key, {})
        sources = set(existing.get("sources", []))
        sources.add(source)
        merged[key] = {
            **existing,
            **enriched,
            "sources": sorted(sources),
            "rank_score": max(float(existing.get("rank_score", 0.0)), rank_score),
            "semantic_score": enriched.get(
                "score", existing.get("semantic_score")
            ),
            "hop_depth": enriched.get("hop_depth", existing.get("hop_depth")),
            "reached_via": enriched.get("reached_via", existing.get("reached_via")),
        }

    if start_verse:
        add(start_verse, "expert_start", 1.0)

    for item in graph_results:
        hop = int(item.get("hop_depth", 2))
        add(item, "graph_bfs", max(0.1, 0.8 - (hop * 0.15)))

    for item in semantic_results:
        add(item, "semantic_rag", float(item.get("score", 0.0)))

    return sorted(
        merged.values(),
        key=lambda item: (
            item.get("rank_score", 0.0),
            -int(item.get("hop_depth", 99) or 99),
        ),
        reverse=True,
    )


def solve_query(
    query: str,
    kg: GitaKnowledgeGraph,
    csv_rows: list[dict[str, Any]],
    goal: str = "",
    stage: str = "beginner",
    nature: str = "active",
    semantic_results: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """
    Solve one reader query end-to-end.

    Pipeline:
      1. expert rules map concern/goal to a concept and start verse
      2. BFS retrieves nearby verses from the concept graph
      3. optional semantic RAG results are merged into the same evidence list
      4. A* traces the concept's route to Moksha when available
    """
    semantic_results = semantic_results or []
    rows_by_ref = _csv_map(csv_rows)

    expert = ExpertSystem(kg)
    inference = expert.infer(
        concern=query,
        goal=goal,
        stage=stage,
        nature=nature,
    )

    concept = inference.get("recommend_concept") or ""
    graph_results = (
        bfs_reading_list(concept, kg, max_hops=2)
        if concept and concept in kg.nodes
        else []
    )

    path_result = {}
    if concept and concept in kg.nodes and concept != "Moksha":
        path_result = astar_to_moksha(concept, kg, "Moksha")

    evidence = _merge_evidence(
        inference.get("start_verse"),
        graph_results[:8],
        semantic_results[:5],
        rows_by_ref,
    )

    rules = _normalise_rule_trace(inference.get("fired_rules", []))
    reasoning_steps = [
        {
            "step": "map_concern_to_concept",
            "result": concept or "no direct concept inferred",
            "details": [rule["rule"] for rule in rules],
        },
        {
            "step": "select_start_verse",
            "result": evidence[0]["key"] if evidence else "no verse selected",
        },
        {
            "step": "retrieve_graph_evidence",
            "result": f"{len(graph_results)} graph verses within 2 hops",
        },
        {
            "step": "merge_semantic_retrieval",
            "result": f"{len(semantic_results[:5])} semantic matches merged",
        },
    ]

    if path_result.get("found"):
        reasoning_steps.append(
            {
                "step": "trace_progression",
                "result": " -> ".join(path_result.get("path", [])),
            }
        )

    return {
        "query": query,
        "goal": goal,
        "stage": stage,
        "nature": nature,
        "recommend_concept": concept,
        "confidence": inference.get("confidence", 0.0),
        "fired_rules": rules,
        "reasoning_steps": reasoning_steps,
        "path_to_moksha": path_result if path_result.get("found") else None,
        "evidence": evidence[:8],
        "counts": {
            "graph_results": len(graph_results),
            "semantic_results": len(semantic_results),
            "merged_evidence": len(evidence),
        },
    }
