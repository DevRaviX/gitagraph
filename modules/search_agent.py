"""
search_agent.py — Digital Bhaṣya  Module 3
Graph Search over the Gita Concept-Verse Knowledge Graph.

Author: Shouryavi Awasthi (@shouryaviawasthi)
Module: Graph Search (BFS, DFS, A*, IDDFS)

Implements:
  bfs_reading_list(start_concept, max_hops)  → BFS reading list
  dfs_chain(start_node, edge_type)           → DFS chain tracer
  astar_to_moksha(start_node)                → A* shortest spiritual path
  iterative_deepening(start, goal, max_d)   → IDDFS for completeness
"""

import heapq
from collections import deque
from typing import Optional
from modules.knowledge_graph import GitaKnowledgeGraph, GitaNode, CATEGORY_H


# ─────────────────────────────────────────────────────────────────────────────
# BFS — Find all verses reachable from a concept within N hops
# Task: CQ1 (Nishkama Karma), CQ4 (Dhyana), CQ2 (Sthitaprajna)
# Time: O(V+E)  |  Space: O(V)  |  Complete: Yes  |  Optimal: Yes (min hops)
# ─────────────────────────────────────────────────────────────────────────────

def bfs_reading_list(start_concept: str, kg: GitaKnowledgeGraph,
                     max_hops: int = 2) -> list[dict]:
    """
    BFS from a concept node. Traverses leadsTo, subConceptOf, contrastsWith
    edges to find reachable concept nodes, then collects all verses that
    teach those concepts (reverse teaches edge).

    Returns list of {verse, hop_depth, shared_concepts, translation}.
    """
    if start_concept not in kg.nodes:
        return []

    visited = {start_concept}
    queue = deque([(start_concept, 0)])
    verse_results = []
    seen_verses = set()

    while queue:
        node_name, depth = queue.popleft()
        if depth > max_hops:
            continue

        # Collect verses teaching this concept (reverse teaches edge)
        for verse_name in kg.verses_teaching(node_name):
            if verse_name not in seen_verses:
                v_node = kg.nodes[verse_name]
                seen_verses.add(verse_name)
                verse_results.append({
                    "verse": verse_name,
                    "hop_depth": depth,
                    "reached_via": node_name,
                    "translation": v_node.translation,
                    "chapter": v_node.chapter_number,
                    "verse_number": v_node.verse_number,
                    "speaker": v_node.speaker,
                    "certainty": v_node.certainty,
                })

        # Expand concept neighbours: leadsTo, subConceptOf, contrastsWith
        for neighbour in kg.concept_neighbours(
                node_name, ["leadsTo", "subConceptOf", "contrastsWith"]):
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, depth + 1))

    # Sort by (hop_depth, chapter, verse_number)
    verse_results.sort(key=lambda x: (x["hop_depth"], x["chapter"], x["verse_number"]))
    return verse_results


# ─────────────────────────────────────────────────────────────────────────────
# DFS — Trace a directed chain (e.g., the downfall chain: Kama→BuddhiNasha)
# Task: CQ3 (Kama downfall chain)
# Time: O(V+E)  |  Space: O(depth)  |  Complete: Yes  |  Optimal: No
# ─────────────────────────────────────────────────────────────────────────────

def dfs_chain(start_node: str, kg: GitaKnowledgeGraph,
              edge_type: str = "leadsTo") -> dict:
    """
    DFS following a specific edge type from start_node.
    Returns the chain of nodes and for each node, the verses that teach it.

    Example: dfs_chain("Kama", kg, "leadsTo")
    → chain: [Kama, Krodha, Moha, BuddhiNasha]
    """
    path = []
    visited = set()
    _dfs_recursive(start_node, kg, edge_type, visited, path)

    # Annotate each chain node with verses that teach it
    annotated = []
    for node_name in path:
        node = kg.nodes.get(node_name)
        verses_for_node = kg.verses_teaching(node_name)
        verse_details = []
        for v in verses_for_node:
            vn = kg.nodes.get(v)
            if vn:
                verse_details.append({
                    "verse": v,
                    "chapter": vn.chapter_number,
                    "verse_number": vn.verse_number,
                    "translation": vn.translation,
                })
        annotated.append({
            "node": node_name,
            "category": node.category if node else "",
            "definition": node.definition if node else "",
            "taught_by_verses": verse_details,
        })

    return {
        "chain": path,
        "edge_type": edge_type,
        "length": len(path),
        "annotated": annotated,
    }


def _dfs_recursive(node: str, kg: GitaKnowledgeGraph,
                   edge_type: str, visited: set, path: list):
    visited.add(node)
    path.append(node)
    for neighbour in kg.neighbours_by_edge(node, edge_type):
        if neighbour not in visited:
            _dfs_recursive(neighbour, kg, edge_type, visited, path)


# ─────────────────────────────────────────────────────────────────────────────
# A* — Shortest spiritual path from any concept to Moksha
# Task: CQ6 (Does practice lead to wisdom? Trace progression)
# Heuristic h(n): category-distance to goal (Attainment=0, Practice=1, ...)
# Time: O(V log V)  |  Space: O(V)  |  Complete: Yes  |  Optimal: Yes (h admissible)
# ─────────────────────────────────────────────────────────────────────────────

def astar_to_moksha(start_name: str, kg: GitaKnowledgeGraph,
                    goal_name: str = "Moksha") -> dict:
    """
    A* search from start_name to goal_name along leadsTo edges.
    f(n) = g(n) [hops so far] + h(n) [category-distance heuristic]

    Returns:
      path: list of node names
      f_values: f(n) at each expansion
      total_hops: integer
      admissible: True (h never overestimates)
    """
    if start_name not in kg.nodes:
        return {"path": [], "found": False, "error": f"{start_name} not in graph"}
    if goal_name not in kg.nodes:
        return {"path": [], "found": False, "error": f"{goal_name} not in graph"}

    start_node = kg.nodes[start_name]
    # Priority queue: (f, g, node_name, path_so_far, f_history)
    h_start = _h(start_node)
    frontier = [(h_start, 0, start_name, [start_name], [(start_name, 0, h_start, h_start)])]
    explored = set()
    best_g = {start_name: 0}

    while frontier:
        f, g, current, path, f_hist = heapq.heappop(frontier)
        if current in explored:
            continue
        explored.add(current)

        if current == goal_name:
            return {
                "found": True,
                "path": path,
                "total_hops": g,
                "f_values": f_hist,
                "admissible": True,
                "admissibility_note": (
                    "h(n) uses category-distance: Attainment=0, Practice=1, "
                    "YogaPath=2, EthicalConcept=2, Guna=3, DownfallCause=4. "
                    "Each level requires at least that many leadsTo hops — "
                    "h never overestimates the true cost."
                ),
            }

        # Expand leadsTo edges only (spiritual progression)
        for neighbour in kg.neighbours_by_edge(current, "leadsTo"):
            new_g = g + 1
            if neighbour not in explored and new_g < best_g.get(neighbour, float("inf")):
                best_g[neighbour] = new_g
                nbr_node = kg.nodes.get(neighbour)
                h_val = _h(nbr_node) if nbr_node else 3
                new_f = new_g + h_val
                new_path = path + [neighbour]
                new_hist = f_hist + [(neighbour, new_g, h_val, new_f)]
                heapq.heappush(frontier, (new_f, new_g, neighbour, new_path, new_hist))

    return {"found": False, "path": [], "error": f"No path from {start_name} to {goal_name}"}


def _h(node: "GitaNode | None") -> int:
    """Admissible heuristic: category distance to Moksha."""
    if node is None:
        return 3
    if node.name == "Moksha":
        return 0
    return CATEGORY_H.get(node.category, 3)


# ─────────────────────────────────────────────────────────────────────────────
# Iterative Deepening DFS (IDDFS)
# BFS completeness + DFS memory efficiency
# ─────────────────────────────────────────────────────────────────────────────

def iterative_deepening(start: str, goal: str, kg: GitaKnowledgeGraph,
                        max_depth: int = 6) -> dict:
    """
    IDDFS from start to goal via leadsTo edges.
    Combines BFS completeness (finds shortest path) with DFS memory (O(depth)).
    """
    for depth_limit in range(max_depth + 1):
        result = _dls(start, goal, kg, depth_limit, [])
        if result is not None:
            return {
                "found": True,
                "path": result,
                "depth_found": depth_limit,
            }
    return {"found": False, "path": [], "depth_searched": max_depth}


def _dls(current: str, goal: str, kg: GitaKnowledgeGraph,
         limit: int, path: list) -> Optional[list]:
    """Depth-Limited Search helper for IDDFS."""
    path = path + [current]
    if current == goal:
        return path
    if limit == 0:
        return None
    for neighbour in kg.neighbours_by_edge(current, "leadsTo"):
        if neighbour not in path:
            result = _dls(neighbour, goal, kg, limit - 1, path)
            if result is not None:
                return result
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Complexity Analysis
# ─────────────────────────────────────────────────────────────────────────────

COMPLEXITY_TABLE = [
    {
        "Algorithm": "BFS",
        "Task in Gita": "Reading list: verses reachable from a concept in N hops (CQ1, CQ4)",
        "Time": "O(V+E)",
        "Space": "O(V)",
        "Complete": "Yes",
        "Optimal": "Yes (min hops)",
    },
    {
        "Algorithm": "DFS",
        "Task in Gita": "Trace downfall chain Kama→BuddhiNasha (CQ3); dialogue threads (CQ7)",
        "Time": "O(V+E)",
        "Space": "O(depth)",
        "Complete": "Yes",
        "Optimal": "No",
    },
    {
        "Algorithm": "IDDFS",
        "Task in Gita": "Explore concept graph to depth d: BFS completeness + DFS memory",
        "Time": "O(V+E)",
        "Space": "O(d)",
        "Complete": "Yes",
        "Optimal": "Yes",
    },
    {
        "Algorithm": "A*",
        "Task in Gita": "Shortest spiritual path from Practice to Moksha (CQ6)",
        "Time": "O(V log V)",
        "Space": "O(V)",
        "Complete": "Yes",
        "Optimal": "Yes (h admissible)",
    },
]


if __name__ == "__main__":
    kg = GitaKnowledgeGraph()
    print("=== BFS: Reading list for NishkamaKarma (max_hops=2) ===")
    results = bfs_reading_list("NishkamaKarma", kg, max_hops=2)
    for r in results:
        print(f"  Hop {r['hop_depth']} | {r['verse']} (via {r['reached_via']}) | {r['translation'][:60]}...")

    print("\n=== DFS: Downfall chain from Kama ===")
    chain = dfs_chain("Kama", kg, "leadsTo")
    print(f"  Chain: {' → '.join(chain['chain'])}")
    for step in chain["annotated"]:
        verses = [v["verse"] for v in step["taught_by_verses"]]
        print(f"  {step['node']} — taught by: {verses}")

    print("\n=== A*: Shortest path from Vairagya to Moksha ===")
    result = astar_to_moksha("Vairagya", kg)
    if result["found"]:
        print(f"  Path: {' → '.join(result['path'])} ({result['total_hops']} hops)")
        for name, g, h, f in result["f_values"]:
            print(f"    {name}: g={g}, h={h}, f={f}")

    print("\n=== A*: Shortest path from DhyanaYoga_inst to Moksha ===")
    result2 = astar_to_moksha("DhyanaYoga_inst", kg)
    if result2["found"]:
        print(f"  Path: {' → '.join(result2['path'])} ({result2['total_hops']} hops)")
