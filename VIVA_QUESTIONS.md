# GitaGraph — Viva Questions & First-Person Answers

> All answers written in **first person** as if I am presenting my project to the examiner.
> Organised by Module, then by Difficulty Level.

---

## 📋 MODULE 1 — Intelligent Agent Design

---

**Q1. What is the PEAS framework and how did you apply it to your project?**

PEAS stands for Performance, Environment, Actuators, and Sensors. I used it to formally characterise GitaGraph as an intelligent agent before writing a single line of code.

For **Performance**, I defined that my agent succeeds when it returns a verse that genuinely matches the reader's concern — not just a keyword match — finds the shortest concept chain using A*, and generates a study plan that satisfies all 7 hard constraints without contradiction.

For **Environment**, I defined it as my OWL knowledge base: 32 verse nodes, 24 concept nodes, 175 directed edges labelled with relationships like `leadsTo`, `teaches`, and `contrastsWith`. The environment also includes the reader's working memory — their concern, goal, experience stage, and which verses they've already read.

For **Actuators**, my agent outputs verse recommendations with translations, multi-hop concept chains with verse annotations at each node, a 5-session study plan, and certainty-weighted recommendations (e.g., "Verse 2.47 is 99.9% likely a Karma Yoga verse based on three commentary traditions").

For **Sensors**, my agent perceives the reader's free-text concern string, their stated goal, and structured parameters like experience stage and philosophical tradition preference.

---

**Q2. Why did you classify your environment as Sequential rather than Episodic?**

This is the most important environment classification for my project. An episodic agent treats each query in isolation — what happens in one episode has no effect on the next. My environment is sequential because earlier sessions create context and prerequisites for later ones.

Specifically, in my CSP study planner, Verse 2.62 (which introduces desire as the root of the downfall chain) *must* appear in an earlier session than Verse 2.63 (which completes the chain: anger → delusion → ruin of intellect). You cannot understand 2.63 without 2.62. This prerequisite relationship makes the sessions dependent on each other — a defining characteristic of sequential environments.

Additionally, in my non-monotonic reasoning module, the reader's belief state evolves across chapters. After reading Chapter 2, the default belief "Karma Yoga is primary" is held. After reading Verse 3.3, that belief is retracted. This state evolution across episodes is fundamentally sequential — earlier readings inform and constrain later conclusions.

---

**Q3. Is GitaGraph a Simple Reflex Agent or a Goal-Based Agent? Justify.**

GitaGraph is a **Goal-Based Agent**. A Simple Reflex Agent would look at the input and fire a fixed rule — for example, if the query contains "karma", return all Karma Yoga verses. It has no internal model and no concept of an optimal path.

My agent maintains an internal model: the concept-verse knowledge graph with 61 nodes and 175 edges. It uses this model to reason about *which sequence of concepts* leads from the reader's current state of confusion toward their goal (understanding, peace, liberation). It runs A* search to find the *shortest* path from their starting concept to Moksha — not just any path. It runs CSP backtracking to find a study plan that is not just valid but satisfies all 7 constraints simultaneously. This goal-directed, model-based, optimal behaviour is the hallmark of a Goal-Based Agent.

---

**Q4. You said the environment is Partially Observable. Give two specific examples.**

Yes, there are two important cases of partial observability in my system.

**First:** The reader's philosophical tradition is unknown. Verse 2.47 ("You have the right to action alone") is interpreted as a Karma Yoga verse (CF=0.9925 by Ramanuja), a Jnana Yoga verse (CF=0.70 by Shankara), and a Bhakti Yoga verse (CF=0.80 by Madhva). My agent cannot perceive which tradition the reader follows, so it cannot definitively choose which primary concept to attribute to the verse without asking.

**Second:** The reader's prior knowledge is hidden. If a reader asks about Verse 3.3 (Krishna's resolution of the two paths), my agent doesn't know whether the reader has already understood Chapter 2's foundational concepts. If they haven't, recommending 3.3 without first recommending 2.47 would be pedagogically wrong. My `already_read` field in WorkingMemory partially addresses this, but it's self-reported — the agent can't actually verify comprehension.

---

**Q5. What is the state space of your agent? Define all four elements.**

The **state** is any node in my concept-verse knowledge graph — one of 61 nodes: 32 verse nodes, 24 concept nodes, 3 chapter nodes, and 2 speaker nodes.

The **initial state** is the concept identified from the reader's concern by my production rule engine. For example, if the reader says "I'm anxious about outcomes", Rule R1 fires and maps this to the `NishkamaKarma` node. That becomes the initial state for BFS.

The **actions** are traversing any of the 8 named RDF edge types from the current node: `leadsTo`, `requires`, `contrastsWith`, `teaches` (and its reverse), `spokenBy`, `belongsToChapter`, `subConceptOf`, `respondsTo`.

The **goal** depends on the query. For A*, the goal is the `Moksha` node. For CQ2, the goal is any verse node that has a `teaches` edge to the `Sthitaprajna` concept node. For CQ7, the goal is any verse node spoken by `Krishna` that has a `respondsTo` edge to a verse spoken by `Arjuna`.

---

## 🧬 MODULE 2 — Knowledge Representation

---

**Q6. Why did you choose OWL 2 over a simpler representation like a semantic network or frame system?**

I chose OWL 2 for three specific capabilities that the other representations cannot provide.

First, **formal semantics**: OWL 2 is grounded in Description Logic (specifically OWL 2 RL), which means there is a model-theoretic semantics. Any inference I make is provably correct within that semantics. A semantic network is informal — there's no algorithm that can tell you whether an inference is valid.

Second, **property axioms**: I needed `leadsTo` to be transitive so that if NishkamaKarma leadsTo ChittaShuddhi and ChittaShuddhi leadsTo AtmaJnana, the reasoner automatically infers NishkamaKarma leadsTo AtmaJnana — without me explicitly asserting it. Only OWL 2 lets me declare `owl:TransitiveProperty`. Similarly, I needed `contrastsWith` to be symmetric so asserting "KarmaYoga contrastsWith Sannyasa" automatically gives me the reverse for free. No frame system supports this.

Third, **the property chain axiom**: I declared `spirituallyProgressesTo` as the composition `teaches ∘ leadsTo`. This means any verse that teaches a concept that leads (transitively) to Moksha is automatically connected to Moksha via `spirituallyProgressesTo` — without me writing this for each of the 30 verses. This is a uniquely OWL 2 DL feature that has no equivalent in semantic networks or frames.

---

**Q7. Explain the difference between TransitiveProperty and SymmetricProperty with examples from your project.**

A **TransitiveProperty** is one where if relation(A, B) and relation(B, C) hold, then relation(A, C) is automatically inferred. In my ontology, `leadsTo` is transitive.

Concretely: I assert `NishkamaKarma leadsTo ChittaShuddhi` and `ChittaShuddhi leadsTo AtmaJnana`. Because `leadsTo` is transitive, the OWL reasoner (or my SPARQL `leadsTo+` path) automatically infers `NishkamaKarma leadsTo AtmaJnana` — even though I never wrote that triple. This is essential for CQ6: I can ask "which concepts lead to Moksha?" and get the full chain, not just the direct predecessors.

A **SymmetricProperty** is one where if relation(A, B) holds, then relation(B, A) is automatically inferred. In my ontology, `contrastsWith` is symmetric.

Concretely: I assert only `KarmaYoga contrastsWith Sannyasa`. The reasoner automatically infers `Sannyasa contrastsWith KarmaYoga`. Without this, CQ5 (which asks for verses teaching both contrasting concepts) would be incomplete — I'd miss verses where the query asks about the relation in the reverse direction.

---

**Q8. What is a Property Chain Axiom and how does it work in your ontology?**

A property chain axiom says that the composition of two properties creates a third property. In my ontology:

```turtle
gita:spirituallyProgressesTo
    owl:propertyChainAxiom ( gita:teaches gita:leadsTo ) .
```

This means: if `Verse_2_47 teaches NishkamaKarma` AND `NishkamaKarma leadsTo ChittaShuddhi`, then the OWL 2 reasoner automatically infers `Verse_2_47 spirituallyProgressesTo ChittaShuddhi`.

Combined with transitivity of `leadsTo`, this means every verse that teaches any concept on the spiritual progression chain is automatically connected to Moksha via `spirituallyProgressesTo` — without me ever explicitly asserting `Verse_2_47 spirituallyProgressesTo Moksha`. This is the computational basis for answering CQ6: "Does good work lead to wisdom?"

In description logic notation: `teaches ∘ leadsTo ⊑ spirituallyProgressesTo`

---

**Q9. How many classes, object properties, and data properties does your ontology have? Name them.**

My ontology has **16 OWL classes**, **9 object properties**, and **10 data properties**.

The **16 classes** are: ScripturalEntity, PhilosophicalConcept, Person, CommentaryTradition (top-level), then Chapter and Verse (subclasses of ScripturalEntity), then YogaPath, Practice, Attainment, DownfallCause, Guna, EthicalConcept (subclasses of PhilosophicalConcept), and finally KarmaYogaPath, JnanaYogaPath, DhyanaYogaPath, BhaktiYogaPath (subclasses of YogaPath).

The **9 object properties** are: `belongsToChapter`, `spokenBy`, `teaches`, `respondsTo`, `leadsTo` (transitive), `requires`, `contrastsWith` (symmetric), `subConceptOf`, and `spirituallyProgressesTo` (property chain).

The **10 data properties** are: `verseNumber`, `chapterNumber`, `textSanskrit`, `translationEn`, `contextNote`, `conceptName`, `definitionEn`, `category`, `certaintyScore`, and `heuristicDist`.

---

**Q10. What is the difference between Open World Assumption (OWA) and Closed World Assumption (CWA)? Which does your system use?**

Under the **Closed World Assumption (CWA)**, if a fact is not in the knowledge base, it is assumed to be false. Relational databases use CWA — if a student's grade is not in the table, they don't have that grade.

Under the **Open World Assumption (OWA)**, if a fact is not in the knowledge base, it is simply *unknown* — not necessarily false. OWL 2 uses OWA.

My system uses **OWA** (via OWL 2). This is philosophically appropriate: if I haven't encoded that Verse 6.47 teaches a particular concept, that doesn't mean the verse *doesn't* teach it — it just means I haven't recorded it yet. The ontology is a partial representation of a vast philosophical domain.

The practical implication: my SPARQL queries return only what is explicitly in the knowledge base or inferrable from axioms. Missing data results in empty results, not false negatives. I note this limitation in my DOCUMENTATION.md.

---

**Q11. What are disjointness axioms and why did you add them?**

A disjointness axiom says that two classes cannot have any common instances. I declared:

```turtle
[] a owl:AllDisjointClasses ;
   owl:members ( gita:YogaPath gita:DownfallCause gita:Guna gita:Attainment ) .
```

This prevents logical inconsistencies. For example, it ensures that `Moksha` (an Attainment) cannot simultaneously be classified as a DownfallCause, and `Kama` (a DownfallCause) cannot be classified as an Attainment. Without this axiom, a reasoner might infer (through some chain of subclass relationships) that a concept belongs to two disjoint categories, producing a contradiction. The disjointness axiom makes such contradictions detectable at reasoning time.

---

## 🔍 MODULE 3 — Graph Search

---

**Q12. Explain BFS and why it is optimal for generating reading lists.**

BFS, or Breadth-First Search, explores all nodes at depth 1 before exploring depth 2, all depth 2 before depth 3, and so on. It uses a FIFO queue to maintain the frontier.

In my implementation, `bfs_reading_list(NishkamaKarma, max_hops=2)` starts at the NishkamaKarma concept node. At depth 0, it collects all verses that directly teach NishkamaKarma — these are Verse_2_47, Verse_2_48, Verse_2_71, Verse_3_9, Verse_3_19. At depth 1, it expands to concepts reachable from NishkamaKarma via `leadsTo`, `subConceptOf`, and `contrastsWith` edges (ChittaShuddhi, KarmaYoga, Sannyasa...) and collects verses that teach those. At depth 2, it expands one step further.

BFS is **optimal** for reading lists because it guarantees that each verse is reported at its **minimum** hop distance from the starting concept. A verse found at depth 1 genuinely requires only 1 conceptual step from the starting concept, making it a more direct resource than a depth-2 verse. No other uninformed algorithm guarantees this minimum-distance property.

**Time complexity:** O(V+E) = O(61+175) = O(236) — effectively instantaneous on this graph.

---

**Q13. Why did you use DFS for the downfall chain rather than BFS?**

The downfall chain Kama → Krodha → Moha → BuddhiNasha is **linear** — each node has exactly one `leadsTo` successor. DFS is appropriate here for two reasons:

First, **space efficiency**: DFS uses O(depth) space on the call stack — for a 4-node linear chain, that's O(4) = O(1) effectively. BFS would put all encountered nodes in a queue — for this linear chain, the difference is negligible, but on a larger chain it matters.

Second, **natural structure**: DFS naturally follows chains to their end before backtracking. For the downfall chain, there is no backtracking needed — the chain is linear, so DFS reaches BuddhiNasha in a single forward traversal. BFS would process nodes level by level, which is counterintuitive for a linear chain.

Third, I chose DFS for **pedagogical clarity** — the DFS call stack mirrors the logical chain of causation (Kama causes Krodha, Krodha causes Moha, Moha causes BuddhiNasha), making the code readable and the trace intuitive.

---

**Q14. Prove that your A\* heuristic is admissible.**

An admissible heuristic never overestimates the true cost from a node to the goal. My heuristic is:

```
h(n) = category distance to Moksha:
  Attainment:    0
  Practice:      1
  YogaPath:      2
  EthicalConcept:2
  Guna:          3
  DownfallCause: 4
```

**Proof of admissibility:**

For **Attainment** (h=0): Attainment nodes are directly adjacent to Moksha via `leadsTo` (e.g., AtmaJnana → Moksha is 1 hop, but Moksha itself is 0). The true minimum cost from an Attainment node is 0 or 1 hops. h=0 never overestimates.

For **Practice** (h=1): In my ontology, every Practice node connects to an Attainment within 1 `leadsTo` hop (NishkamaKarma → ChittaShuddhi). So the true minimum is 1 hop to an Attainment, then some hops to Moksha. Since h=1 and the true cost is ≥1, h never overestimates.

For **YogaPath** (h=2): YogaPath nodes connect to Practice or Attainment nodes (e.g., DhyanaYoga → Samadhi — 1 hop, then Samadhi → AtmaJnana → Moksha = 2 more). The minimum true cost is 2 hops. h=2 never overestimates.

For **DownfallCause** (h=4): DownfallCause nodes like Kama lead *away* from Moksha in the ontology's causal structure. h=4 is a high penalty — the true cost of reaching Moksha from Kama via `leadsTo` edges is effectively infinite (no path exists). h=4 correctly signals "wrong direction" without overestimating, since 4 ≤ ∞.

**Therefore h is admissible, and A* is guaranteed to return the optimal path.**

---

**Q15. What is the difference between BFS, DFS, and IDDFS in terms of completeness and optimality?**

**BFS** is both complete and optimal. Complete means it will always find a solution if one exists — it systematically explores all nodes at each depth before going deeper. Optimal means it finds the solution with the minimum number of hops (since all edge costs are uniform in my graph). The tradeoff is O(V) space for the queue.

**DFS** is complete (on finite graphs with visited-set tracking) but not optimal. It finds a solution but not necessarily the shortest one — it might follow a 5-hop chain when a 2-hop solution exists, simply because DFS explores the first branch fully before backtracking. Space is O(depth), which is much better than BFS.

**IDDFS** (Iterative Deepening DFS) achieves both BFS's optimality and DFS's space efficiency. It runs DFS with depth limit 0, then 1, then 2, until the goal is found. The first time it finds the goal, the depth limit equals the optimal path length. Space is O(depth). The time penalty for re-expanding nodes at shallower depths is small — for a branching factor b, the overhead is only a factor of b/(b-1).

In my project, IDDFS is useful for depth-constrained exploration of the concept graph where I want optimal solutions but have limited memory.

---

**Q16. What is the time complexity of A\* and why does it have a log factor?**

The time complexity of A* is O(V log V) where V is the number of nodes. The log factor comes from the **priority queue** (implemented as a min-heap using Python's `heapq`).

In my implementation, every time I expand a node and add its neighbours to the frontier, I perform a `heappush` operation, which costs O(log V) because the heap has at most V elements. Since I expand each node at most once (after adding the visited/explored set), and there are V expansions total, the total time is O(V log V).

For my graph with V=61, O(61 × log 61) ≈ O(61 × 6) ≈ O(366) operations — effectively instantaneous.

---

**Q17. How did you implement the reverse "teaches" edge in your graph?**

The `teaches` relationship in RDF goes from Verse to Concept — `Verse_2_47 teaches NishkamaKarma`. But for BFS, I need to go the other direction: given a concept, find all verses that teach it.

I implemented this as a reverse edge traversal in NetworkX. When I build the graph, I store the `teaches` relation as a directed edge from verse to concept. When I need verses teaching a concept, I use `nx.in_edges(concept_name)` and filter for edges with `relation == "teaches"`. This gives me all incoming "teaches" edges — i.e., all verses that teach this concept.

This is the standard way to query reverse properties in a directed graph without maintaining a separate reverse index. The time complexity is O(in-degree of the concept node), which is small for my graph.

---

## ⚡ MODULE 4 — Inference & Expert System

---

**Q18. Explain forward chaining. How is it different from backward chaining?**

**Forward chaining** starts from known facts in the working memory and fires rules whose conditions are satisfied by those facts, adding new facts to the working memory. It continues until no more rules can fire (fixpoint) or the goal is reached. It is data-driven — it starts from data and produces conclusions.

In my expert system, the working memory starts with the reader's concern, goal, and stage. Rule R1 fires if "anxious" is in the concern, adding `recommend_concept = NishkamaKarma` to the working memory. This new fact triggers Rule R3 (which needs both `stage=beginner` AND `recommend_concept=NishkamaKarma`), which then fires and sets `start_verse = Verse_2_47`. Each rule firing updates the working memory, potentially enabling more rules.

**Backward chaining** starts from a goal and works backward, asking "what conditions would satisfy this goal?" It is goal-driven — like a detective who has a conclusion and looks for evidence. PROLOG uses backward chaining.

I chose forward chaining because my system doesn't have a predetermined goal — it discovers the goal (which concept/verse to recommend) based on the reader's profile. Forward chaining naturally handles this exploratory, data-driven scenario.

---

**Q19. How does your conflict resolution work? What is the specificity ordering?**

When multiple rules can fire simultaneously (they all have their conditions satisfied by the current working memory), I must choose which to fire first. This is the conflict resolution step.

I use **specificity ordering**: the more conditions a rule has, the higher its specificity, and the earlier it fires. I encode this as an integer `specificity` field on each Rule.

- Rule R1 (`specificity=1`): checks one condition — "anxious" in concern
- Rule R3 (`specificity=3`): checks two conditions — `stage=beginner` AND `recommend_concept=NishkamaKarma`

Rules are sorted descending by specificity before each iteration. The most specific rules fire first.

**Why does this matter?** Without specificity ordering, Rule R3 might fire before R1 has set `recommend_concept`. Since R3's condition depends on `recommend_concept`, it would silently fail. The ordering guarantees that general rules (which set context) fire before specific rules (which use that context).

Alternatively framed: specificity ordering implements the "most specific rule wins" principle from traditional expert system design — a rule that matches more specific conditions should override a more general rule.

---

**Q20. Write the SPARQL query for CQ6 and explain every clause.**

```sparql
PREFIX gita: <http://example.org/gita#>

SELECT ?id ?translation WHERE {
  ?v a gita:Verse ;
     gita:teaches ?c ;
     gita:translationEn ?translation ;
     gita:verseNumber ?n ;
     gita:belongsToChapter ?ch .
  ?c gita:leadsTo+ gita:Moksha .
  ?ch gita:chapterNumber ?chn .
  BIND(CONCAT(STR(?chn), ".", STR(?n)) AS ?id)
}
ORDER BY ?id
```

**Explanation:**
- `?v a gita:Verse` — constrain `?v` to be a Verse instance
- `?v gita:teaches ?c` — for each verse, find the concept it teaches (`?c`)
- `?c gita:leadsTo+ gita:Moksha` — the crucial clause: `+` is SPARQL 1.1 property path syntax for transitive closure — it matches any chain of `leadsTo` edges of length ≥1 from `?c` to `Moksha`. So this matches concepts that lead directly to Moksha (AtmaJnana) and concepts that lead transitively (NishkamaKarma → ChittaShuddhi → AtmaJnana → Moksha)
- `?v gita:translationEn ?translation` — retrieve the English translation
- `?v gita:belongsToChapter ?ch`, `?ch gita:chapterNumber ?chn` — get chapter number
- `BIND(CONCAT(...))` — construct a readable verse ID like "2.47"
- `ORDER BY ?id` — sort by verse ID for readability

This query answers CQ6: "Does good work lead to wisdom?" — every verse teaching a concept that (transitively) leads to Moksha is returned. Without `leadsTo+`, only verses teaching AtmaJnana directly would be returned.

---

**Q21. What are Horn clauses and how do they relate to your production rules?**

A **Horn clause** is a logical clause with at most one positive literal — formally, a disjunction of literals where at most one is positive. In practical AI, Horn clauses are rules of the form `B₁ ∧ B₂ ∧ ... ∧ Bₙ → H` (if all conditions B hold, then head H is derived).

My production rules ARE Horn clauses. For example, Rule R3:
```
stage="beginner" ∧ recommend_concept="NishkamaKarma" → start_verse="Verse_2_47"
```
This is a Horn clause with two body literals (the conditions) and one head literal (the action).

The OWL property chain axiom `teaches ∘ leadsTo ⊑ spirituallyProgressesTo` corresponds to:
```prolog
spirituallyProgressesTo(V, D) :- teaches(V, C), leadsTo(C, D).
```
This is exactly a Horn clause — two body atoms (`teaches(V,C)` and `leadsTo(C,D)`) and one head atom.

The transitivity of `leadsTo` corresponds to:
```prolog
leadsTo(X, Z) :- leadsTo(X, Y), leadsTo(Y, Z).
```
Again a Horn clause. PROLOG uses backward chaining on Horn clauses; my expert system uses forward chaining on the same logical structure.

---

## 📅 MODULE 5 — Constraint Satisfaction

---

**Q22. Formally define the CSP for your study planner. What are the variables, domains, and constraints?**

**Variables:** S1, S2, S3, S4, S5 — five study sessions.

**Domain:** D(Si) = all pairs of verses from the 30-verse corpus = C(30,2) = 435 pairs initially. After pre-pruning (removing pairs with no shared concept), the domain shrinks considerably.

**Constraints:**
1. **Theme (binary on pair):** Both verses in a session must share at least one philosophical concept — `shared_concepts(v1, v2) ≠ ∅`
2. **Chapter coverage (global):** Chapters {2, 3, 6} must each appear at least once across all five sessions
3. **Prerequisite ordering (ordering):** If Verse_2_63 is in session Si, then Verse_2_62 must be in Sj where j < i (session index strictly less)
4. **Downfall chain pairing (binary across sessions):** Verse_2_62 and Verse_2_63 must appear in the same session
5. **No repetition (global):** Each verse appears in exactly one session across all assignments
6. **Reader goal — meditation:** If goal contains "meditation", a Chapter 6 verse must appear by Session 3
7. **Reader goal — anxiety:** If goal contains "anxiety", Verse_2_47 must appear by Session 2

---

**Q23. What is the MRV heuristic and why does it reduce search time?**

MRV stands for Minimum Remaining Values. It is a heuristic for choosing which unassigned variable (session) to assign next. It always picks the variable with the **fewest valid assignments remaining** in its domain.

In my context: after assigning some sessions, I compute, for each unassigned session, how many valid verse-pairs remain (pairs that don't reuse already-used verses and satisfy theme coherence). The session with the smallest such count is assigned next.

**Why it works:** By assigning the most constrained session first, we detect failures as early as possible. Imagine the solver is about to assign Session 4, which has only 2 valid pairs remaining due to previous assignments. If neither pair leads to a valid complete assignment, the solver backtracks immediately — before wasting time assigning Sessions 5, which might have had 50 valid pairs. Without MRV, the solver might go all the way to Session 5 before discovering the constraint violation in Session 4.

This is the "fail-first" principle: tackle the hardest constraint first to prune the search tree early.

---

**Q24. Explain Forward Checking. Trace one domain pruning step from your project.**

Forward checking is a technique where, immediately after assigning a value to a variable, we propagate the assignment's consequences to the domains of all unassigned variables and prune any values that violate binary constraints.

**In my CSP:** After assigning `S3 = (Verse_2_62, Verse_2_63)`:
- For every unassigned session S (S1, S2, S4, S5):
  - Remove from `domain(S)` any verse-pair that contains Verse_2_62 or Verse_2_63 (No-Repetition constraint)
  - The pair `(Verse_2_62, Verse_2_55)` in S1's domain is pruned because Verse_2_62 is now used
  - The pair `(Verse_2_48, Verse_2_63)` in S4's domain is pruned because Verse_2_63 is now used
- If any session's domain becomes empty → **domain wipeout** → immediately backtrack without exploring further
- On backtracking → restore all pruned pairs to their domains

**Concrete example:** After assigning Verse_2_62 and Verse_2_63 to Session 3, at least 58 pairs (all pairs involving either verse) are eliminated from the remaining 4 sessions' domains simultaneously. Without forward checking, the solver would only discover these conflicts later when it tries to assign those pairs — after spending effort on deeper assignments.

---

**Q25. What is the analogy between your CSP constraints and the 8-Queens problem?**

The 8-Queens problem assigns a queen to each row (variables = rows, domain = columns 1–8) subject to: no two queens in the same column, no two queens on the same diagonal (binary constraints between all pairs of rows).

My study planner CSP is structurally similar:

| 8-Queens | Study Planner |
|---|---|
| Variables = 8 rows | Variables = 5 sessions |
| Domain = column 1–8 | Domain = verse-pairs from 30-verse corpus |
| "No same column" | "No repetition" (each verse used once) |
| "No same diagonal" | "Theme coherence" (both verses share a concept) |
| Any valid 8-queen arrangement | Any valid 5-session plan satisfying all constraints |

The prerequisite constraint (Verse_2_63 must follow Verse_2_62) is analogous to the ordering constraint in the N-queens problem variant where queens in certain rows must precede queens in others. The chapter coverage constraint (all three chapters must appear) is analogous to a coverage constraint that requires queens in certain regions of the board.

---

## 🌫️ MODULE 6 — Uncertainty Handling

---

**Q26. Explain the MYCIN Certainty Factor formula. Give a worked example from your project.**

The MYCIN CF formula combines two independent pieces of evidence for the same hypothesis:

```
CF(H, E1 ∧ E2) = CF1 + CF2 × (1 − CF1)    [when both CFs are positive]
```

This formula gives diminishing returns: combining CF1=0.95 and CF2=0.85 gives CF=0.9925, not 1.80. The intuition is that two pieces of evidence for the same claim build on each other, but the second piece adds less incremental value if the first was already strong.

**Worked example — Verse 2.47 → Karma Yoga classification:**

I have four pieces of evidence:
1. Ramanuja commentary: CF = 0.95 (primary — calls 2.47 the heart of Karma Yoga)
2. Keyword match (action/duty/fruits): CF = 0.85
3. Madhva commentary: CF = 0.80
4. Context note: CF = 0.70

Combining step by step:
```
Step 1: CF = 0.95 + 0.85 × (1 − 0.95) = 0.95 + 0.0425 = 0.9925
Step 2: CF = 0.9925 + 0.80 × (1 − 0.9925) = 0.9925 + 0.006 = 0.9985
Step 3: CF = 0.9985 + 0.70 × (1 − 0.9985) ≈ 0.9991
```

Final CF = **0.9991** — Strong. I assert: "Verse 2.47 primarily teaches Karma Yoga" with high confidence.

---

**Q27. What is fuzzy logic? How did you compute fuzzy membership for verses?**

In classical (crisp) logic, a verse either belongs to Karma Yoga (1) or it doesn't (0). In **fuzzy logic**, membership is a real number in [0, 1] representing the *degree* to which something belongs to a set.

I defined fuzzy membership as: `μ_Path(verse) = max over all concepts taught by verse of concept_membership[concept][Path]`

Each philosophical concept has a pre-defined membership degree in each of the four yoga paths, based on my analysis of the Gītā's philosophy:
- NishkamaKarma has μ_KarmaYoga = 1.0, μ_DhyanaYoga = 0.1
- Abhyasa has μ_KarmaYoga = 0.3, μ_DhyanaYoga = 1.0
- Vairagya has μ_KarmaYoga = 0.6, μ_DhyanaYoga = 0.8

For Verse_6_47 (which teaches DhyanaYoga, BhaktiYoga, and Moksha):
```
μ_DhyanaYoga(6.47) = max(DhyanaYoga_inst→DhyanaYoga=1.0, ...) = 1.0
μ_BhaktiYoga(6.47) = max(BhaktiYoga_inst→BhaktiYoga=1.0, ...) = 1.0
μ_JnanaYoga(6.47)  = max(Moksha→JnanaYoga=0.8, ...) = 0.8
μ_KarmaYoga(6.47)  = max(Moksha→KarmaYoga=0.5, ...) = 0.5
```

Crisp classification would label 6.47 as "DhyanaYoga" (chapter-based). Fuzzy classification reveals it is **simultaneously** DhyanaYoga and BhaktiYoga at full membership — capturing the verse's true multi-dimensional nature.

---

**Q28. Explain non-monotonic reasoning with a specific example from your project.**

In **monotonic** logic, adding new facts can only add new conclusions — you can never retract a conclusion by adding more information. Classical logic is monotonic.

In **non-monotonic** logic, adding new facts can retract previously derived conclusions. This mirrors how humans revise their beliefs when they learn something new.

In my project, a reader who has only read Chapter 2 forms the default belief: "Karma Yoga is the recommended path." This is a reasonable default — Chapter 2 emphasises action and duty for Arjuna.

When the reader then processes Verse 3.3 ("Two paths: Jnana for contemplatives, Karma for the active") and is found to have a contemplative nature, my `NonMonotonicEngine` does the following:
1. **Retracts:** "Karma Yoga is recommended for all readers" — now marked as RETRACTED, reason: Verse_3_3
2. **Retracts:** "Reader is suited for Karma Yoga (active path)" — now marked as RETRACTED, reason: Verse_3_3 + nature=contemplative
3. **Adds:** "Two paths exist: Jnana for contemplatives, Karma for active"
4. **Adds:** "Jnana Yoga is recommended for this contemplative reader"

The set of active conclusions *shrank* and *changed* after adding Verse 3.3. This is non-monotonic behaviour. The initial conclusion was not wrong — it was a reasonable *default* that was overridden by more specific evidence.

---

**Q29. What is the difference between certainty factors, Bayesian probability, and fuzzy logic?**

**Certainty Factors (MYCIN model):**
- Not a proper probability — doesn't follow Bayes' theorem
- Combines evidence from multiple independent sources using the formula `CF1 + CF2(1−CF1)`
- Designed for expert systems where sources are not truly independent
- In my context: three commentary traditions are not statistically independent events — they share a common text. CF is more appropriate than probability here.
- Range: [−1, 1]; my project uses [0, 1] (positive evidence only)

**Bayesian Probability:**
- Requires a proper probability distribution over all possible states
- Requires prior probabilities (P(KarmaYoga | Verse_2_47)) and conditional probabilities
- Updating uses Bayes' theorem: P(H|E) = P(E|H)×P(H) / P(E)
- Advantage: principled and well-founded mathematically
- Disadvantage: requires complete probability estimates that are hard to obtain for philosophical interpretation

**Fuzzy Logic:**
- Handles graded truth — a verse can be 75% Dhyana Yoga and 90% Bhakti Yoga simultaneously
- Models ambiguity (the verse belongs to *both* categories to varying degrees)
- Not about uncertainty (we know the verse is 1.0 Bhakti) but about vagueness (category boundaries are not sharp)

For my domain, **CFs are best** for handling interpretive uncertainty (which tradition's view to trust), and **fuzzy logic is best** for handling conceptual vagueness (a verse can genuinely belong to multiple yoga paths simultaneously). Bayesian probability would require statistical data about scholarly consensus that I don't have.

---

**Q30. What is the difference between uncertainty and vagueness? Which of your techniques handles which?**

**Uncertainty** is about incomplete knowledge — we don't know which of several possible states is true. For Verse 2.47, we're uncertain which yoga path is primary because three scholars disagree. If we polled all Sanskrit scholars, we might converge on one answer — the uncertainty would resolve.

**Vagueness** is about the inherent imprecision of concepts — even with complete knowledge, the answer is genuinely "both/and." Verse 6.47 is not *uncertain* about whether it belongs to Dhyana Yoga or Bhakti Yoga — it genuinely, fully belongs to both simultaneously. No amount of scholarship would resolve this to a single answer, because the verse intentionally integrates both themes.

**In my project:**
- **MYCIN Certainty Factors** handle **uncertainty**: different scholars are uncertain about which tradition's reading is correct. I combine their CFs to find the most likely primary concept.
- **Fuzzy Logic** handles **vagueness**: a verse can have membership 1.0 in two yoga paths simultaneously, capturing the genuine multi-dimensionality of the text.
- **Non-Monotonic Reasoning** handles **belief revision under new evidence**: it's not that the reader was uncertain — they had a valid default belief that was subsequently overridden by more specific information.

---

## 🛠️ GENERAL / INTEGRATION QUESTIONS

---

**Q31. How does your system integrate all six modules?**

The modules form a pipeline. When a reader submits a concern:

1. **Module 4 (Expert System)** fires production rules against the reader's profile to identify the primary concept and starting verse.
2. **Module 3 (Graph Search)** runs BFS from that concept to find all relevant verses within N hops, annotated by their distance.
3. **Module 6 (Uncertainty)** applies MYCIN CF scores to weight the returned verses, and computes fuzzy membership to categorise them.
4. **Module 4 (SPARQL)** answers the specific competency question using the knowledge base built in Module 2.
5. **Module 5 (CSP)** takes the relevant verses and generates a 5-session study plan satisfying all constraints.
6. **Module 6 (Non-Monotonic)** maintains the reader's belief state across sessions, retracting defaults when new evidence arrives.

All modules share the `GitaKnowledgeGraph` object — a single source of truth that provides both the RDFLib SPARQL endpoint and the NetworkX directed graph. This shared state ensures consistency across all six AI techniques.

---

**Q32. What would you do if you had to scale your system to all 700 verses?**

Several changes would be needed.

For the **knowledge base**, I would need a semi-automated pipeline to convert the CSV data (which I already have for all 700 verses) into OWL/RDF instances. This would use a template-based Turtle generator with manual concept annotation for key verses.

For the **CSP planner**, the domain size would explode: C(700,2) = 244,650 pairs. I would need AC-3 (Arc Consistency 3) constraint propagation instead of just forward checking, and possibly a smarter initial domain ordering to avoid exploring irrelevant pairs.

For the **SPARQL/RDF**, scaling to 700 verses would require Apache Jena Fuseki with full OWL reasoning enabled (HermiT reasoner), because RDFLib's native SPARQL would become too slow without proper indexing.

For the **expert system**, I would need NLP for concept mapping — keyword matching won't scale to 200+ concepts without embedding-based similarity.

For the **UI**, I would add pagination to the verse browser (it currently shows 50 results max) and server-side graph rendering for the knowledge graph (client-side Plotly would struggle with 700+ nodes).

---

**Q33. What is the difference between your system and a simple keyword search?**

A keyword search for "action" in the Gītā would return every verse that contains the word "action" — including verses where action is discussed negatively (the downfall chain), verses in unrelated contexts, and verses in all 18 chapters regardless of their philosophical relevance.

My system does something fundamentally different at four levels:

**Level 1 (Concept mapping):** My production rules map "anxious about results" to the concept `NishkamaKarma` — not just looking for keyword "anxious". A keyword search would find only verses containing "anxious."

**Level 2 (Concept graph traversal):** BFS from `NishkamaKarma` also returns verses teaching `ChittaShuddhi` (which NishkamaKarma leads to), even if those verses don't contain the word "karma" or "attachment." Concept-level retrieval through graph traversal is fundamentally richer than text matching.

**Level 3 (Prerequisite awareness):** My CSP ensures that a verse is never recommended unless its philosophical prerequisites have been covered in earlier sessions. A keyword search has no notion of prerequisites.

**Level 4 (Certainty weighting):** My MYCIN CF scores rank verses by interpretive consensus across three scholarly traditions. A keyword search has no notion of scholarly authority or interpretive confidence.

---

**Q34. If the examiner asks: "What is the most challenging part of your project?" — what would you say?**

The most technically challenging part was designing the A* heuristic for the concept graph.

Initially I considered using the hop distance to Moksha from the actual graph as the heuristic (true distance). But that would require precomputing shortest paths from every node to Moksha, which defeats the purpose of A* (it would be as expensive as BFS).

The challenge was designing an admissible heuristic that is both *informative* (close to the true distance, so A* doesn't explore too many nodes) and *computable in O(1)* (lookup in a dictionary). My solution was to use the ontology's class hierarchy as a proxy for distance. The class hierarchy was designed philosophically (Practice → Attainment → Moksha), but it happens to encode the true minimum distance structure of the graph. I proved admissibility by showing that each category level corresponds to at least that many minimum `leadsTo` hops to Moksha in the actual graph.

The second challenge was the CSP forward checking: tracking which pairs to restore on backtracking required careful state management. I had to ensure that the `pruned` dictionary accumulated all removed pairs and that `restore_domains` correctly returned them, even when multiple layers of backtracking occurred simultaneously.

---

**Q35. What are the limitations of your project? Be honest.**

I'm happy to be honest about three important limitations.

**First**, my SPARQL queries use property path syntax (`leadsTo+`) to simulate transitivity rather than OWL reasoning. This works, but it's not true OWL-DL reasoning. For the `spirituallyProgressesTo` property chain to fully materialise as new triples, I need Apache Jena Fuseki with HermiT or Pellet reasoning enabled — I don't have that running locally, so `spirituallyProgressesTo` triples are not automatically asserted.

**Second**, the natural language processing is very basic — I match keywords from the reader's concern against hardcoded strings. If a reader says "I fear the consequences of my choices" instead of "I am anxious about results", my keyword-based rules would miss it. A real production system needs transformer embeddings for robust concept mapping.

**Third**, my certainty factors and fuzzy memberships were hand-assigned based on my reading of the commentary traditions. They're not derived from any statistical analysis of scholarly consensus. A more rigorous approach would involve corpus analysis of actual Vedantic commentaries and learned probabilities.

Despite these limitations, the system correctly demonstrates all six AI techniques on a meaningful and philosophically rich domain, which was the primary objective.

---

## 🎓 CONCEPTUAL / THEORY QUESTIONS

---

**Q36. What is an OWL Ontology? How is it different from a database schema?**

An OWL ontology is a formal representation of knowledge in a domain, using Description Logic as its mathematical foundation. It consists of a TBox (terminological box — classes and relationships, the "schema") and an ABox (assertional box — individual instances and their properties, the "data").

A database schema defines table structures and foreign key constraints — it's imperative and procedural. An OWL ontology is declarative and logical — it supports automatic inference. If I add a new instance and assert some properties, the OWL reasoner can automatically classify it into the correct classes and derive new relationships, without me writing any code.

The key differences:
- **Inference:** OWL supports automated reasoning (HermiT, Pellet); databases do not
- **Open World:** OWL assumes what's not stated is unknown; databases assume what's not stored is false
- **Semantic richness:** OWL supports transitive properties, symmetric properties, property chains — databases support only foreign keys and basic constraints
- **Interoperability:** OWL triples can be published on the Semantic Web and linked to other ontologies; database schemas are proprietary

---

**Q37. What is SPARQL and how does it differ from SQL?**

SPARQL is the query language for RDF graphs. It stands for SPARQL Protocol and RDF Query Language.

SQL queries relational tables with rows and columns: `SELECT name FROM students WHERE grade > 8`.

SPARQL queries RDF triples (subject-predicate-object): `SELECT ?name WHERE { ?student rdf:type :Student ; :grade ?g . FILTER(?g > 8) }`.

Key differences:
- **Data model:** SQL operates on tables; SPARQL operates on graphs of triples
- **Schema:** SQL requires a fixed schema; SPARQL works on schema-free RDF graphs
- **Property paths:** SPARQL 1.1 supports property paths (`leadsTo+` for transitive closure) with no SQL equivalent without recursive CTEs
- **Inference:** SPARQL queries over an OWL knowledge base can leverage reasoner-inferred triples; SQL cannot query inferred data
- **Open-endedness:** SPARQL `SELECT ?x WHERE { ?x rdf:type :Verse }` works even if I add 700 more verses — I don't need to know the schema in advance

---

**Q38. What is the difference between OWL DL, OWL Full, and OWL Lite?**

OWL has three expressivity profiles:

**OWL Lite** is the most restricted — no disjoint classes, limited cardinality. Supports efficient reasoning (polynomial time). I don't use OWL Lite because I need disjointness axioms.

**OWL DL** (Description Logic) is the main profile I use. It supports all the constructs I used: transitive properties, symmetric properties, property chains, disjointness, intersection, and full class hierarchy. Reasoning is decidable (EXPTIME-complete for OWL DL). My ontology is OWL 2 RL-compatible (a profile of OWL 2 DL that supports efficient rule-based reasoning).

**OWL Full** is unrestricted — it allows classes to be instances of other classes. Reasoning in OWL Full is undecidable — no reasoner can guarantee to terminate. I avoided OWL Full by keeping my ontology in OWL DL.

My system is specifically OWL 2 DL because I use: `owl:TransitiveProperty`, `owl:SymmetricProperty`, `owl:AllDisjointClasses`, and `owl:propertyChainAxiom` — all standard OWL 2 DL constructs.

---

**Q39. What is the role of the `rdf:type` predicate in your ontology?**

`rdf:type` (abbreviated as `a` in Turtle syntax) is the fundamental RDF predicate for asserting class membership. When I write:

```turtle
gita:Verse_2_47 a gita:Verse .
gita:NishkamaKarma a gita:Practice .
```

I am asserting that `Verse_2_47` is an instance of the class `Verse`, and `NishkamaKarma` is an instance of the class `Practice`. This is analogous to `instanceof` in object-oriented programming.

In my SPARQL queries, I use `?v a gita:Verse` to constrain results to Verse instances. The OWL reasoner uses these type assertions combined with the class hierarchy (e.g., Practice is a subclass of PhilosophicalConcept) to infer additional memberships: since NishkamaKarma is a Practice, and Practice rdfs:subClassOf PhilosophicalConcept, the reasoner automatically infers `NishkamaKarma a gita:PhilosophicalConcept`.

---

**Q40. You mentioned the Bhagavad Gita has 700 verses but your corpus has 30. How did you choose these 30?**

I selected 30 verses across three chapters based on three criteria:

**Coverage of core AI-demonstrable concepts:** The downfall chain (2.62–2.63), the spiritual progression chain (2.47, 3.19, 6.35), and the Karma-Jnana contrast (3.3) were the top-priority selections because they directly demonstrate BFS/DFS/A*, SPARQL property paths, and non-monotonic reasoning.

**Competency question coverage:** I traced back from all 8 CQs to identify which verses are needed to answer each. CQ2 requires Sthitaprajna verses (2.55, 2.56, 2.68). CQ4 requires Chapter 6 meditation verses (6.10, 6.13, 6.17, 6.18, 6.20, 6.23, 6.25, 6.35). CQ8 requires Svadharma verses (3.35). This drove the selection of 20+ of the 30 verses.

**Philosophical balance:** I ensured representation of Karma Yoga's key tension (action vs renunciation — 3.3, 3.4), Guna philosophy (3.27), and the culminating Bhakti verse (6.47 — needed for the fuzzy membership demonstration). The selection gives sufficient diversity for the CSP to have multiple valid study plans for different reader goals.

---

*End of VIVA_QUESTIONS.md*
*GitaGraph — AI Minor Project | DevRaviX | 2026*
