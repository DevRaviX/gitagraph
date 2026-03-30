# 📘 Shouryavi — Graph Search (BFS/DFS/A*/IDDFS) & CSP Study Planner

> **Role:** Search & Planning Developer  
> **Modules owned:** `modules/search_agent.py` · `modules/study_planner.py`  
> **AI Concepts:** BFS · DFS · A* · IDDFS · Heuristic Search · CSP · Backtracking · MRV · Forward Checking · LCV

---

## 1. What You Own — Big Picture

You implemented **two complete AI planning systems**:
1. **Graph Search** — 4 algorithms that navigate the concept-verse graph to find reading paths
2. **CSP Planner** — a constraint satisfaction solver that generates valid, pedagogically sound study plans

```
Knowledge Graph (NetworkX DiGraph)
       ↓
=== GRAPH SEARCH ===          === CSP PLANNER ===
BFS   → reading lists         Variables: sessions
DFS   → downfall chains       Domains: verse pairs
A*    → spiritual paths       Constraints: 5 rules
IDDFS → depth-limited search  Solver: backtrack + MRV
```

---

## 2. Graph Search — Theory and Implementation

### 2.1 State Space Representation

The knowledge graph is our **state space**:
- **State** = a node (concept or verse)
- **Action** = follow an outgoing edge
- **Initial state** = reader's starting concept (e.g., "Vairagya")
- **Goal state** = target concept (e.g., "Moksha")

### 2.2 BFS — Breadth-First Search

**Algorithm:** Explore all nodes at depth 1, then depth 2, etc.

```python
def bfs_reading_list(start_concept: str, kg, max_hops: int = 2) -> list[dict]:
    from collections import deque

    queue      = deque([(start_concept, 0, start_concept)])  # (node, depth, via)
    visited    = {start_concept}
    verses     = []

    while queue:
        node, depth, via = queue.popleft()  # FIFO — breadth first

        if depth > max_hops:
            continue

        # If this node is a Verse, add to reading list
        kg_node = kg.nodes.get(node)
        if kg_node and kg_node.node_type == "Verse":
            verses.append({
                "verse_key":    node,
                "chapter":      kg_node.chapter_number,
                "verse_number": kg_node.verse_number,
                "translation":  kg_node.translation,
                "hop_depth":    depth,
                "reached_via":  via,
            })

        # Expand neighbours (BFS frontier)
        if depth < max_hops:
            for neighbour in kg.nx.successors(node):
                if neighbour not in visited:
                    visited.add(neighbour)
                    queue.append((neighbour, depth + 1, node))

    return sorted(verses, key=lambda v: (v["hop_depth"], v["chapter"]))
```

**Guarantee:** BFS always finds the **shortest path** (fewest hops). If Verse X is reachable in 2 hops, BFS will never return it at 3 hops.

### 2.3 DFS — Depth-First Search (Downfall Chain)

**Algorithm:** Follow one path as deep as possible before backtracking.

```python
def dfs_chain(start: str, kg, edge_type: str = "leadsTo") -> dict:
    visited = set()
    chain   = []

    def dfs_recursive(node: str):
        if node in visited:
            return
        visited.add(node)
        chain.append(node)

        # Only follow edges of a specific type (e.g., "leadsTo")
        for u, v, data in kg.nx.out_edges(node, data=True):
            if data.get("relation") == edge_type:
                dfs_recursive(v)  # RECURSE — depth first

    dfs_recursive(start)

    # Annotate each node with definition and verses
    annotated = []
    for node_name in chain:
        kg_node = kg.nodes.get(node_name)
        if kg_node:
            annotated.append({
                "node":             node_name,
                "definition":       kg_node.definition,
                "taught_by_verses": kg.verses_teaching(node_name),
            })

    return {"chain": chain, "annotated": annotated}
```

### 2.4 A* — Heuristic Search (Spiritual Path)

**Algorithm:** Expand the node with lowest `f(n) = g(n) + h(n)` first.

```python
def astar_to_moksha(start: str, kg, goal: str = "Moksha_inst") -> dict:
    import heapq

    # Priority queue: (f_value, node, path_so_far, g_value)
    frontier = [(0, start, [start], 0)]
    visited  = set()
    f_trace  = []   # for visualization

    while frontier:
        f, node, path, g = heapq.heappop(frontier)  # lowest f first

        if node in visited:
            continue
        visited.add(node)

        if node == goal:
            return {"found": True, "path": path, "total_hops": g,
                    "f_values": f_trace}

        for neighbour in kg.nx.successors(node):
            if neighbour not in visited:
                g_new = g + 1              # cost = 1 per hop
                h     = heuristic(neighbour, goal, kg)  # estimated distance
                f_new = g_new + h

                f_trace.append((neighbour, g_new, h, f_new))
                heapq.heappush(frontier, (f_new, neighbour, path + [neighbour], g_new))

    return {"found": False, "error": f"No path from {start} to {goal}"}
```

---

## 3. CSP Study Planner — Theory

### 3.1 What Is a CSP?

A **Constraint Satisfaction Problem** is defined by:
- **Variables** (X): Things to assign — our *sessions* (S1, S2, S3, S4, S5)
- **Domains** (D): Possible values for each variable — our *verse pairs* from the corpus
- **Constraints** (C): Rules that valid assignments must satisfy

### 3.2 Backtracking Search

```python
def backtrack(assignment: dict, sessions: list, domains: dict) -> dict | None:
    # Base case: all sessions assigned
    if len(assignment) == len(sessions):
        return assignment

    # Choose next unassigned variable (MRV)
    var = select_unassigned_variable(sessions, assignment, domains)

    # Try values in LCV order
    for value in order_domain_values(var, assignment, domains):
        if is_consistent(var, value, assignment):
            # Make assignment
            assignment[var] = value

            # Forward checking: reduce other domains
            inferences = forward_check(var, value, assignment, domains)

            if inferences is not None:  # no domain wipeout
                result = backtrack(assignment, sessions, domains)
                if result is not None:
                    return result  # SUCCESS

            # BACKTRACK: undo assignment
            del assignment[var]
            undo_inferences(inferences, domains)

    return None  # failure — backtrack to parent
```

---

## 4. Professor Q&A — Shouryavi's Section

### Q1: Why is BFS guaranteed to find the shortest path?

**A:** BFS explores nodes in order of their distance from the source — all depth-1 nodes before depth-2, etc. The first time we reach the goal node, it must be via the shortest route.

### Q2: Is your A* heuristic admissible? Prove it.

**A:** Yes. Our heuristic `h(n)` = shortest path length in the **undirected** version of the graph. The real path follows **directed** edges, so it can only be equal to or longer than the undirected path. Therefore `h(n) ≤ actual_cost(n, goal)`.

### Q3: What is the difference between backtracking and brute force?

**A:** Brute force generates all possible assignments and checks constraints afterwards. Backtracking checks constraints **incrementally** — the moment an assignment violates a constraint, we prune that entire branch.

### Q4: Explain MRV. How does it reduce search?

**A:** MRV (Minimum Remaining Values) selects the variable with the fewest valid domain values next. By tackling the hardest constraints first, we prune large subtrees early.

---

## 5. Key Numbers to Remember

| Item | Value |
|---|---|
| Algorithms implemented | 4 (BFS, DFS, A*, IDDFS) |
| CSP variables | 3–7 (sessions) |
| CSP constraints | 5 |
| Typical chapters covered | 3 (Ch. 2, 3, 6) |
| BFS max hops supported | 1–3 |
| A* admissible | ✅ Yes (undirected shortest path) |
