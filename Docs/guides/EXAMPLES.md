# GitaGraph End-to-End Examples

These examples use the unified endpoint:

```bash
POST /api/solve
```

For deterministic reviewer checks, the examples below set `"include_semantic": false`. When semantic search is enabled, the same response also merges dense retrieval evidence from `Data/embeddings/`.

## Example 1 — Anxiety About Results

Input:

```json
{
  "query": "I feel anxious about the results of my work",
  "goal": "peace",
  "stage": "beginner",
  "nature": "active",
  "include_semantic": false
}
```

Reasoning:

```text
R1_AnxietyResults -> NishkamaKarma
R3_BeginnerNishkama -> Verse_2_47
BFS support -> Verse_2_48, Verse_2_71, Verse_3_9
A* path -> NishkamaKarma -> ChittaShuddhi -> AtmaJnana -> Moksha
```

Short output:

```json
{
  "recommend_concept": "NishkamaKarma",
  "confidence": 0.95,
  "top_evidence": [
    {"key": "Verse_2_47", "sources": ["expert_start", "graph_bfs"]},
    {"key": "Verse_2_48", "sources": ["graph_bfs"]},
    {"key": "Verse_2_71", "sources": ["graph_bfs"]},
    {"key": "Verse_3_9", "sources": ["graph_bfs"]}
  ]
}
```

## Example 2 — Restless Mind During Meditation

Input:

```json
{
  "query": "My mind is restless during meditation",
  "goal": "peace",
  "stage": "beginner",
  "nature": "active",
  "include_semantic": false
}
```

Reasoning:

```text
R5_MeditationFocus -> DhyanaYoga_inst
Start verse -> Verse_6_10
BFS support -> Verse_6_5, Verse_6_13, Verse_6_17
A* path -> DhyanaYoga_inst -> Samadhi -> AtmaJnana -> Moksha
```

Short output:

```json
{
  "recommend_concept": "DhyanaYoga_inst",
  "confidence": 0.95,
  "top_evidence": [
    {"key": "Verse_6_10", "sources": ["expert_start", "graph_bfs"]},
    {"key": "Verse_6_5", "sources": ["graph_bfs"]},
    {"key": "Verse_6_13", "sources": ["graph_bfs"]},
    {"key": "Verse_6_17", "sources": ["graph_bfs"]}
  ]
}
```

## Example 3 — Confusion About Duty

Input:

```json
{
  "query": "I am confused about my duty in life",
  "goal": "peace",
  "stage": "beginner",
  "nature": "active",
  "include_semantic": false
}
```

Reasoning:

```text
R6_DutyConfusion -> Svadharma
Start verse -> Verse_3_35
BFS support -> Verse_3_8, Verse_6_20
A* path -> Svadharma -> ChittaShuddhi -> AtmaJnana -> Moksha
```

Short output:

```json
{
  "recommend_concept": "Svadharma",
  "confidence": 0.88,
  "top_evidence": [
    {"key": "Verse_3_35", "sources": ["expert_start", "graph_bfs"]},
    {"key": "Verse_3_8", "sources": ["graph_bfs"]},
    {"key": "Verse_6_20", "sources": ["graph_bfs"]}
  ]
}
```
