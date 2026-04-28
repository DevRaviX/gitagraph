**AI Minor Project**

**Digital Bhaṣya — Intelligent Gītā Reader’s Assistant**

*Knowledge Representation, Search, Inference, CSP & Reasoning over Bhagavad Gītā Philosophy*

# **1\. Project Overview & Motivation**

The Bhagavad Gītā is one of the most systematically argued philosophical texts in the world. Its structure — a dialogue between Krishna (teacher) and Arjuna (questioner), building concepts step by step across chapters — makes it an exceptionally rich domain for AI techniques. The same properties that make it hard to navigate as a linear text (deep concept chains, contrasting paths, prerequisite ideas) make it ideal for knowledge representation, graph search, logical inference, constraint-based study planning, and uncertainty handling.

This project builds an Intelligent Gītā Reader’s Assistant — an agent that helps a genuine reader find relevant verses, trace philosophical progressions, understand apparent contradictions, and plan a structured reading. 

## **1.1 Corpus — Three Chapters, Thirty Verses**

| Chapter | Title | Theme | Selected Verses |
| :---- | :---- | :---- | :---- |
| 2 | Sāṅkhya Yoga | Philosophy of self, steady wisdom, detached action | 2.47, 2.48, 2.50, 2.55, 2.56, 2.62, 2.63, 2.64, 2.68, 2.71 |
| 3 | Karma Yoga | Selfless action, svadharma, the guṇas in action | 3.3, 3.4, 3.5, 3.8, 3.9, 3.19, 3.27, 3.35, 3.42, 3.43 |
| 6 | Dhyāna Yoga | Meditation practice, mind mastery, the ideal yogi | 6.5, 6.10, 6.13, 6.17, 6.18, 6.20, 6.23, 6.25, 6.35, 6.47 |

## **1.2 Competency Questions — What the Reader’s Assistant Must Answer**

| \# | Reader’s Question | AI Technique |
| :---- | :---- | :---- |
| CQ1 | I am anxious about outcomes — which verses teach acting without attachment to results? | SPARQL \+ class inference |
| CQ2 | What kind of person does Krishna consider truly wise? What are their qualities? | SPARQL \+ concept retrieval |
| CQ3 | How does desire cause a person’s downfall? Trace the full chain. | Graph search (DFS/A\*) \+ transitive leadsTo |
| CQ4 | I want to meditate — what are Krishna’s practical instructions for Dhyāna? | SPARQL \+ chapter-filtered query |
| CQ5 | Should I renounce action or keep working? How does the Gītā resolve this? | Inference over contrastsWith \+ SPARQL |
| CQ6 | Does doing good work actually lead to wisdom? Trace the progression. | Property chain \+ transitive leadsTo (A\*) |
| CQ7 | Which verses are Arjuna’s questions vs Krishna’s answers? | Speaker-filtered SPARQL \+ respondsTo traversal |
| CQ8 | What does the Gītā say about one’s own duty — Svadharma? | Inference \+ contrastsWith \+ SPARQL |

# **2\. Module 1 — Problem Formulation & Intelligent Agent Design**

Before building anything, students must characterise the Gītā assistant as an intelligent agent using the PEAS framework and classify the nature of its environment. **PEAS** is a framework from Russell & Norvig for formally describing an intelligent agent. It stands for:

* **P**erformance Measure — how do we evaluate whether the agent is doing well?  
* **E**nvironment — what is the world the agent operates in?  
* **A**ctuators — what actions can the agent take / what outputs does it produce?  
* **S**ensors — what inputs does the agent perceive?

## **2.1 PEAS Description**

| PEAS Component | Description for Gītā Reader’s Assistant |
| :---- | :---- |
| Performance Measure | Verse retrieved is genuinely relevant to the reader’s question; concept path found is the shortest; no logically inconsistent inferences produced; study plan satisfies all constraints |
| Environment | The knowledge base of 30 verse RDF triples, 20+ philosophical concept nodes, inter-concept relationships (leadsTo, requires, contrastsWith), speaker attribution, and chapter structure |
| Actuators | Returns matching verses with translations; traces concept chains; generates personalised study plans; flags uncertain or ambiguous verse interpretations |
| Sensors | Receives reader’s natural-language or structured queries; reads verse text and metadata; perceives reader’s stated goal (e.g., ‘I want to understand meditation’ or ‘I am dealing with anxiety’) |

## **2.2 Environment Classification**

| Dimension | Classification | Justification for Gītā Domain |
| :---- | :---- | :---- |
| Observable | Partially observable | The reader’s background, prior knowledge, and intent are not fully known; verse interpretation depends on commentary tradition (Shankara/Ramanuja/Madhva) |
| Agents | Single agent | One reasoning agent handles queries; no competing agents (though multiple commentary traditions constitute multiple knowledge sources) |
| Deterministic | Deterministic | Given the same KB and query, the same answer is produced; inference is rule-bound |
| Episodic vs Sequential | Sequential | A reader’s understanding of verse 3.3 depends on having processed 2.47–2.71; earlier queries build context for later ones |
| Static vs Dynamic | Static | The KB does not change while reasoning; but note: in Module 6, new interpretive evidence can trigger belief revision (non-monotonic) |
| Discrete vs Continuous | Discrete | Verses and concepts are discrete; relationships are named and categorical |

| *Key difference from the Museum agent: the Gītā environment is Sequential, not Episodic. This matters for the study plan CSP in Module 5 — certain verses must be presented before others because they establish prerequisite concepts.* |
| :---- |

## **2.3 State Space Formulation (for Module 3 Search)**

| Element | Definition |
| :---- | :---- |
| State | A node in the concept-verse knowledge graph: a Verse, a PhilosophicalConcept (YogaPath, Practice, Attainment, DownfallCause, Guna), or a Speaker node |
| Initial State | The concept or verse specified by the reader’s query (e.g., ‘NishkamaKarma’, ‘Verse\_2\_47’, ‘Kama’) |
| Actions | Traverse any named RDF edge from the current node: leadsTo, requires, contrastsWith, teaches, spokenBy, belongsToChapter, subConceptOf, respondsTo |
| Goal Test | Reached a node satisfying the query (e.g., a node of type Attainment, a Verse spoken by Krishna, a concept named ‘Moksha’) |
| Path Cost | 1 per edge hop (uniform). For A\*: also uses a heuristic based on conceptual category distance from the goal (see Module 3\) |

## **2.4 Assignments — Module 1**

1. Write the full PEAS description with domain-specific examples for at least three different reader queries (one about anxiety, one about meditation, one about duty).

2. Classify the environment on all six dimensions; justify Sequential over Episodic with a concrete example from the verse sequence.

3. Draw a state space diagram starting from the concept ‘Kama’ (Desire) showing all states reachable in 3 hops via leadsTo and contrastsWith edges.

4. Distinguish a simple reflex agent (returns all Karma Yoga verses mechanically) from a goal-based agent (finds the shortest path from the reader’s stated confusion to the relevant verses). Which is this system and why?

5. Identify two scenarios where the Gītā agent environment is partially observable. How should the agent ask clarifying questions, and what type of agent architecture does that require?

# **3\. Module 2 — Knowledge Representation: Ontology & RDF**

The philosophical structure of the Gītā — concepts linked by causation, prerequisite, contrast, and hierarchy — maps naturally onto an OWL ontology. This module builds the knowledge base that all subsequent AI modules reason over.

## **3.1 OWL Ontology**

| @prefix gita:  \<http://example.org/gita\#\> . @prefix owl:   \<http://www.w3.org/2002/07/owl\#\> . @prefix rdfs:  \<http://www.w3.org/2000/01/rdf-schema\#\> . @prefix xsd:   \<http://www.w3.org/2001/XMLSchema\#\> . \# ── Top-level Classes ────────────────────────────────────────────── gita:ScripturalEntity     a owl:Class . gita:PhilosophicalConcept a owl:Class . gita:Person               a owl:Class . gita:Chapter  rdfs:subClassOf gita:ScripturalEntity . gita:Verse    rdfs:subClassOf gita:ScripturalEntity . gita:YogaPath       rdfs:subClassOf gita:PhilosophicalConcept . gita:Practice       rdfs:subClassOf gita:PhilosophicalConcept . gita:Attainment     rdfs:subClassOf gita:PhilosophicalConcept . gita:DownfallCause  rdfs:subClassOf gita:PhilosophicalConcept . gita:Guna           rdfs:subClassOf gita:PhilosophicalConcept . gita:EthicalConcept rdfs:subClassOf gita:PhilosophicalConcept . gita:KarmaYogaClass  rdfs:subClassOf gita:YogaPath . gita:JnanaYogaClass  rdfs:subClassOf gita:YogaPath . gita:DhyanaYogaClass rdfs:subClassOf gita:YogaPath . \# ── Disjointness ─────────────────────────────────────────────────── \[\] a owl:AllDisjointClasses ;    owl:members ( gita:YogaPath gita:DownfallCause gita:Guna gita:Attainment ) . \# ── Object Properties ────────────────────────────────────────────── gita:belongsToChapter  a owl:ObjectProperty ;     rdfs:domain gita:Verse             ; rdfs:range gita:Chapter . gita:spokenBy          a owl:ObjectProperty ;     rdfs:domain gita:Verse             ; rdfs:range gita:Person . gita:teaches           a owl:ObjectProperty ;     rdfs:domain gita:Verse             ; rdfs:range gita:PhilosophicalConcept . gita:respondsTo        a owl:ObjectProperty ;     rdfs:domain gita:Verse             ; rdfs:range gita:Verse . gita:leadsTo           a owl:ObjectProperty, owl:TransitiveProperty ;     rdfs:domain gita:PhilosophicalConcept ; rdfs:range gita:PhilosophicalConcept . gita:requires          a owl:ObjectProperty ;     rdfs:domain gita:Practice          ; rdfs:range gita:Practice . gita:contrastsWith     a owl:ObjectProperty, owl:SymmetricProperty ;     rdfs:domain gita:PhilosophicalConcept ; rdfs:range gita:PhilosophicalConcept . gita:subConceptOf      a owl:ObjectProperty ;     rdfs:domain gita:PhilosophicalConcept ; rdfs:range gita:PhilosophicalConcept . \# ── Property Chain (Key Inference Axiom) ─────────────────────────── \# If a Verse teaches a Concept that leadsTo another Concept, \# infer the Verse 'spirituallyProgressesTo' that downstream Concept. gita:spirituallyProgressesTo  a owl:ObjectProperty ;     owl:propertyChainAxiom ( gita:teaches gita:leadsTo ) ;     rdfs:domain gita:Verse ; rdfs:range gita:PhilosophicalConcept . \# ── Data Properties ──────────────────────────────────────────────── gita:verseNumber    a owl:DatatypeProperty ; rdfs:domain gita:Verse   ; rdfs:range xsd:integer . gita:chapterNumber  a owl:DatatypeProperty ; rdfs:domain gita:Chapter ; rdfs:range xsd:integer . gita:textHindi      a owl:DatatypeProperty ; rdfs:domain gita:Verse   ; rdfs:range xsd:string . gita:translationEn  a owl:DatatypeProperty ; rdfs:domain gita:Verse   ; rdfs:range xsd:string . gita:contextNote    a owl:DatatypeProperty ; rdfs:domain gita:Verse   ; rdfs:range xsd:string . gita:conceptName    a owl:DatatypeProperty ; rdfs:domain gita:PhilosophicalConcept ; rdfs:range xsd:string . gita:definitionEn   a owl:DatatypeProperty ; rdfs:domain gita:PhilosophicalConcept ; rdfs:range xsd:string . gita:category       a owl:DatatypeProperty ; rdfs:domain gita:PhilosophicalConcept ; rdfs:range xsd:string . gita:certaintyScore a owl:DatatypeProperty ; rdfs:domain gita:Verse   ; rdfs:range xsd:decimal . |
| :---- |

## **3.2 Key RDF Instances (Turtle)**

| @prefix gita: \<http://example.org/gita\#\> . @prefix xsd:  \<http://www.w3.org/2001/XMLSchema\#\> . \# Chapters gita:Chapter\_2 a gita:Chapter ; gita:chapterNumber 2 ; rdfs:label 'Sankhya Yoga' . gita:Chapter\_3 a gita:Chapter ; gita:chapterNumber 3 ; rdfs:label 'Karma Yoga' . gita:Chapter\_6 a gita:Chapter ; gita:chapterNumber 6 ; rdfs:label 'Dhyana Yoga' . \# Speakers gita:Krishna a gita:Person ; rdfs:label 'Krishna' ; gita:category 'Teacher' . gita:Arjuna  a gita:Person ; rdfs:label 'Arjuna'  ; gita:category 'Questioner' . \# Concept instances with leadsTo chain (spiritual progression) gita:NishkamaKarma  a gita:Practice ;     gita:conceptName  'Nishkama Karma' ;     gita:definitionEn 'Action without attachment to its fruits' ;     gita:leadsTo      gita:ChittaShuddhi ;     gita:subConceptOf gita:KarmaYoga\_inst . gita:Vairagya  a gita:Practice ;     gita:conceptName  'Vairagya' ;     gita:definitionEn 'Dispassion; non-attachment to sense objects' ;     gita:leadsTo      gita:ChittaShuddhi . gita:ChittaShuddhi  a gita:Attainment ;     gita:conceptName  'Chitta Shuddhi' ;     gita:definitionEn 'Purification of the mind through selfless action' ;     gita:leadsTo      gita:AtmaJnana . gita:Sthitaprajna  a gita:Attainment ;     gita:conceptName  'Sthitaprajna' ;     gita:definitionEn 'Steady wisdom; equanimity in all conditions' ;     gita:leadsTo      gita:AtmaJnana . gita:AtmaJnana  a gita:Attainment ;     gita:conceptName  'Atma Jnana' ;     gita:definitionEn 'Direct knowledge of the eternal Self' ;     gita:leadsTo      gita:Moksha . gita:Moksha  a gita:Attainment ;     gita:conceptName  'Moksha' ;     gita:definitionEn 'Liberation from the cycle of birth and death' . \# Downfall chain gita:Kama    a gita:DownfallCause ; gita:conceptName 'Kama' ;   gita:leadsTo gita:Krodha . gita:Krodha  a gita:DownfallCause ; gita:conceptName 'Krodha' ; gita:leadsTo gita:Moha . gita:Moha    a gita:DownfallCause ; gita:conceptName 'Moha' ;   gita:leadsTo gita:BuddhiNasha . gita:BuddhiNasha a gita:DownfallCause ; gita:conceptName 'Buddhi Nasha' . \# Contrasting concepts gita:KarmaYoga\_inst  gita:contrastsWith gita:Sannyasa\_inst . gita:Svadharma       gita:contrastsWith gita:Paradharma . \# Verse instances gita:Verse\_2\_47  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_2 ; gita:verseNumber 47 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'You have the right to action alone, never to its fruits.' ;     gita:contextNote      'Foundational verse of Nishkama Karma' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:NishkamaKarma ;     gita:teaches          gita:KarmaYoga\_inst ;     gita:teaches          gita:Vairagya . gita:Verse\_2\_62  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_2 ; gita:verseNumber 62 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'By thinking of sense objects, attachment to them arises.' ;     gita:contextNote      'Step 1 of downfall chain: contemplation breeds attachment' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:Kama . gita:Verse\_2\_63  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_2 ; gita:verseNumber 63 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'From anger arises delusion; from delusion, loss of memory; from loss of memory, ruin of intellect.' ;     gita:contextNote      'Completes the downfall chain: Krodha-Moha-BuddhiNasha' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:Krodha ; gita:teaches gita:Moha . gita:Verse\_3\_3  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_3 ; gita:verseNumber 3 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'Two paths were taught by Me: the path of knowledge for the contemplative, the path of action for the active.' ;     gita:contextNote      'Krishna resolves Arjuna\\'s confusion between Karma and Sannyasa' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:KarmaYoga\_inst ;     gita:teaches          gita:Sannyasa\_inst ;     gita:respondsTo       gita:Verse\_3\_1 . gita:Verse\_3\_35  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_3 ; gita:verseNumber 35 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'Better is one\\'s own duty imperfectly performed than the duty of another well performed.' ;     gita:contextNote      'Central Svadharma teaching — even death in own duty is preferable' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:Svadharma . gita:Verse\_6\_35  a gita:Verse ;     gita:belongsToChapter gita:Chapter\_6 ; gita:verseNumber 35 ;     gita:spokenBy         gita:Krishna ;     gita:translationEn    'The mind is indeed restless and hard to restrain, but by practice and dispassion it is controlled.' ;     gita:contextNote      'Key practical verse: Abhyasa (practice) \+ Vairagya (dispassion) \= mastery' ;     gita:certaintyScore   1.0 ;     gita:teaches          gita:DhyanaYoga\_inst ;     gita:teaches          gita:Vairagya ;     gita:respondsTo       gita:Verse\_6\_33 . |
| :---- |

## **3.3 Assignments — Module 2**

1. Design the full OWL ontology in Protege: 15+ classes, 8 object properties (include leadsTo as TransitiveProperty, contrastsWith as SymmetricProperty, and the spirituallyProgressesTo property chain), 8 data properties. Validate using HermiT reasoner.

2. Write the Turtle (.ttl) instance file for all 30 verses, 20+ concept instances, and all inter-concept relationships. Load into Apache Jena Fuseki.

3. Draw the concept graph showing all leadsTo and contrastsWith relationships. Identify and label the two chains: (a) the spiritual progression chain (NishkamaKarma → … → Moksha) and (b) the downfall chain (Kama → … → BuddhiNasha).

4. Compare OWL ontology with (a) a semantic network and (b) a frame system using one verse as an example across all three representations. What does OWL add that the others lack?

5. Explain in your own words why leadsTo must be declared owl:TransitiveProperty for CQ6 to work, and why contrastsWith must be owl:SymmetricProperty for CQ5. Relate each to a logical axiom.

# **4\. Module 3 — Search over the Concept-Verse Graph**

The Gītā concept graph is a directed state space with two qualitatively different chains: the upward spiritual progression (Practices → Attainments → Moksha) and the downward downfall chain (Kama → … → BuddhiNasha). Different search algorithms illuminate different aspects of this structure.

## **4.1 Graph Structure for Search**

Model the knowledge graph as G \= (V, E) where:

* V \= all concept nodes (20+) \+ verse nodes (30) \+ chapter nodes (3) \+ speaker nodes (3)

* E \= all named RDF edges: leadsTo, requires, contrastsWith, teaches, spokenBy, respondsTo, subConceptOf

* Edge weight \= 1 (uniform) for BFS/DFS; category-distance score for A\*

The two key chains encoded in this graph:

| \# SPIRITUAL PROGRESSION CHAIN (upward, leadsTo edges): NishkamaKarma \--\> ChittaShuddhi \--\> AtmaJnana \--\> Moksha Vairagya      \--\> ChittaShuddhi      (converges) DhyanaYoga    \--\> Sthitaprajna \--\> AtmaJnana \--\> Moksha \# DOWNFALL CHAIN (downward, leadsTo edges): Kama \--\> Krodha \--\> Moha \--\> BuddhiNasha \# CONTRAST EDGES (contrastsWith, symmetric): KarmaYoga \<--\> Sannyasa Svadharma \<--\> Paradharma \# VERSE-CONCEPT EDGES (teaches): Verse\_2\_47 \--\[teaches\]--\> NishkamaKarma Verse\_2\_62 \--\[teaches\]--\> Kama Verse\_2\_63 \--\[teaches\]--\> Krodha, Moha Verse\_6\_35 \--\[teaches\]--\> DhyanaYoga, Vairagya |
| :---- |

## **4.2 BFS — Find All Verses Reachable from a Concept**

Task (CQ1 & CQ4): Starting from a concept node (e.g., ‘NishkamaKarma’), find all verses that teach it or teach concepts reachable from it within N hops. This gives a ‘reading list’ for that concept.

| def bfs\_reading\_list(start\_concept, graph, max\_hops):     """Return all Verse nodes reachable from start\_concept within max\_hops."""     visited \= {start\_concept}     queue   \= \[(start\_concept, 0)\]     verses  \= \[\]     while queue:         node, depth \= queue.pop(0)         if depth \> max\_hops:             continue         \# Collect verses that teach this concept (reverse teaches edge)         for verse in graph.verses\_teaching(node):             if verse not in visited:                 verses.append((verse, depth))                 visited.add(verse)         \# Traverse leadsTo and subConceptOf edges         for neighbour in graph.concept\_neighbours(node):             if neighbour not in visited:                 visited.add(neighbour)                 queue.append((neighbour, depth \+ 1))     return verses \# Example: bfs\_reading\_list('NishkamaKarma', kg, max\_hops=1) \# Hop 0 \-- NishkamaKarma: \#   Verse\_2\_47 (teaches NishkamaKarma) added \# Hop 1 \-- ChittaShuddhi (NishkamaKarma leadsTo ChittaShuddhi): \#   \[no verse directly teaches ChittaShuddhi \-- illustrates a gap in data\] \# Hop 1 \-- KarmaYoga\_inst (NishkamaKarma subConceptOf KarmaYoga): \#   Verse\_3\_3, Verse\_3\_19 added \# Returns: \[Verse\_2\_47, Verse\_3\_3, Verse\_3\_19\] \# Time:  O(V \+ E)  |  Space: O(V)  |  Complete: Yes  |  Optimal: Yes (min hops) |
| :---- |

## **4.3 DFS — Trace the Full Downfall Chain (CQ3)**

Task: Starting from ‘Kama’, trace the complete downfall chain to BuddhiNasha. DFS naturally follows the chain depth-first and is appropriate because the chain is linear with no branching.

| def dfs\_chain(node, graph, visited, edge\_type, path):     """Follow edges of a specific type depth-first; return the chain."""     visited.add(node)     path.append(node.name)     for neighbour in graph.neighbours\_by\_edge(node, edge\_type):         if neighbour not in visited:             dfs\_chain(neighbour, graph, visited, edge\_type, path)     return path \# Call: dfs\_chain(Kama, kg, set(), 'leadsTo', \[\]) \# Result: \['Kama', 'Krodha', 'Moha', 'BuddhiNasha'\] \# Corresponding verses along the chain (look up teaches reverse edges): \# Kama       \--\> Verse\_2\_62 ('By thinking of sense objects, attachment arises') \# Krodha     \--\> Verse\_2\_63 ('From anger arises delusion...') \# Moha       \--\> Verse\_2\_63 (same verse covers Moha too) \# BuddhiNasha \--\> Verse\_2\_63 (end of the chain: ruin of intellect) \# Time: O(V+E) | Space: O(depth) | Complete: Yes | Optimal: No (path not shortest) |
| :---- |

## **4.4 A\* — Shortest Spiritual Path from a Practice to Moksha (CQ6)**

Task: Given a starting practice (e.g., ‘Vairagya’), find the shortest leadsTo path to Moksha. This is the ‘quickest conceptual route’ the Gītā describes for someone beginning with that practice.

| \# Heuristic h(n): how far is concept n from the category 'Attainment'? \# Category distance (lower \= closer to goal): \#   Attainment      \=\> h \= 0  (already an attainment; Moksha is one step away or IS goal) \#   Practice        \=\> h \= 1  (one leadsTo hop typically reaches an Attainment) \#   YogaPath        \=\> h \= 2  (two hops: YogaPath \-\> Practice \-\> Attainment) \#   DownfallCause   \=\> h \= 4  (wrong direction entirely \-- high penalty) CATEGORY\_H \= {'Attainment': 0, 'Practice': 1, 'YogaPath': 2,               'EthicalConcept': 2, 'Guna': 3, 'DownfallCause': 4} def h(node):     if node.name \== 'Moksha': return 0     return CATEGORY\_H.get(node.category, 3\) \# A\* search: f(n) \= g(n) \[hops so far\] \+ h(n) \[category distance to Moksha\] \# From Vairagya (Practice, h=1): \# Expand Vairagya \-\> ChittaShuddhi: g=1, h=0 (Attainment), f=1 \# Expand ChittaShuddhi \-\> AtmaJnana: g=2, h=0, f=2 \# Expand AtmaJnana \-\> Moksha: g=3, h=0, f=3  \=\> GOAL FOUND \# Path: Vairagya \-\> ChittaShuddhi \-\> AtmaJnana \-\> Moksha  (3 hops) \# From DhyanaYoga (YogaPath, h=2): \# DhyanaYoga \-\> Sthitaprajna: g=1, h=0, f=1 \# Sthitaprajna \-\> AtmaJnana:  g=2, h=0, f=2 \# AtmaJnana \-\> Moksha:        g=3, h=0, f=3 \# Path: DhyanaYoga \-\> Sthitaprajna \-\> AtmaJnana \-\> Moksha  (3 hops \-- same length) \# Admissibility: h never overestimates because each category distance \# is a lower bound on the true number of leadsTo hops needed. |
| :---- |

| *The A\* heuristic here is admissible because the category hierarchy (DownfallCause, YogaPath, Practice, Attainment) reflects the actual depth structure of the Gītā's philosophical progression. A concept at distance h=2 genuinely requires at least 2 leadsTo hops to reach Moksha.* |
| :---- |

## **4.5 Complexity Analysis Table**

| Algorithm | Task in Gītā Project | Time | Space | Complete? | Optimal? |
| :---- | :---- | :---- | :---- | :---- | :---- |
| BFS | Reading list: verses reachable from a concept in N hops | O(V+E) | O(V) | Yes | Yes (min hops) |
| DFS | Trace downfall chain (CQ3) or dialogue thread (CQ7) | O(V+E) | O(depth) | Yes | No |
| Iterative Deepening | Explore concept graph to depth d with BFS completeness | O(V+E) | O(d) | Yes | Yes |
| A\* | Shortest spiritual path from a Practice to Moksha (CQ6) | O(V log V) | O(V) | Yes | Yes (h admissible) |

## **4.6 Assignments — Module 3**

1. Implement BFS (Python or PROLOG) over your Gītā concept graph. For the query ‘Give me a reading list for understanding Vairagya’, return all verses reachable within 2 hops. Print the hop-distance for each verse.

2. Implement DFS to trace the downfall chain starting from Kama. Print the full chain and the verses that teach each step. Verify it matches the OWL transitive leadsTo result from Module 2\.

3. Implement A\* with the category-distance heuristic h(n) above. Find the shortest path from three different starting concepts (NishkamaKarma, DhyanaYoga, Svadharma) to Moksha. Report path and f-values at each expansion.

4. Prove or disprove that h is admissible for your concept graph. Show one example where a non-admissible heuristic would cause A\* to return a suboptimal path.

5. Populate the complexity table (Section 4.5) with measured runtimes on your 50-node graph. Extrapolate: if the full Gītā (700 verses, \~200 concepts) were encoded, which algorithm would still be feasible?

# **5\. Module 4 — Logic, Inference & Rule-Based Reasoning**

The Gītā is already written as a logical dialogue: Krishna states rules (universal propositions), applies them to Arjuna’s specific situation, and derives conclusions. This module formalises that structure using FOL, PROLOG, and production rules.

## **5.1 Predicate Logic Representation**

| \# Ground facts from the knowledge base: Verse(v2\_47). teaches(v2\_47, nishkama\_karma). teaches(v2\_47, karma\_yoga). leadsTo(nishkama\_karma, chitta\_shuddhi). leadsTo(chitta\_shuddhi, atma\_jnana). leadsTo(atma\_jnana, moksha). practice(nishkama\_karma). attainment(moksha). spokenBy(v2\_47, krishna). spokenBy(v3\_1, arjuna). respondsTo(v3\_3, v3\_1). \# Rule R1 (property chain as Horn clause): \# forall V, C, D: teaches(V,C) AND leadsTo(C,D) \=\> spirituallyProgressesTo(V,D) spirituallyProgressesTo(V, D) :- teaches(V, C), leadsTo(C, D). \# Rule R2 (transitivity of leadsTo encoded as PROLOG rule): leadsTo(X, Z) :- leadsTo(X, Y), leadsTo(Y, Z). \# Rule R3: A verse is a Karma Yoga verse if it teaches any Practice \#          that is a subConceptOf Karma Yoga karmaYogaVerse(V) :- teaches(V, C), subConceptOf(C, karma\_yoga). \# Rule R4: A verse that responds to Arjuna and is spoken by Krishna \#          is a direct answer to a question directAnswer(V, Q) :- spokenBy(V, krishna), respondsTo(V, Q), spokenBy(Q, arjuna). \# Applying R1 to v2\_47 via Unification: \# Goal: spirituallyProgressesTo(v2\_47, ?D) \# R1 head: spirituallyProgressesTo(V, D) \-- unify V/v2\_47 \# Subgoal 1: teaches(v2\_47, C) \-- matches fact, C/nishkama\_karma \# Subgoal 2: leadsTo(nishkama\_karma, D) \-- matches fact, D/chitta\_shuddhi \# Answer 1:  spirituallyProgressesTo(v2\_47, chitta\_shuddhi) \-- DERIVED \# Backtrack: try C/karma\_yoga \# Subgoal 2: leadsTo(karma\_yoga, D) \-- matches (if asserted), D/chitta\_shuddhi \# Answer 2:  spirituallyProgressesTo(v2\_47, chitta\_shuddhi) \-- same answer \# With R2 transitivity: also derives spirituallyProgressesTo(v2\_47, moksha) |
| :---- |

## **5.2 Production Rule Expert System for Verse Classification**

A reader asking ‘Which verses should I read for my situation?’ can be served by a production rule system. The working memory holds the reader’s stated concern; rules fire to recommend verses:

| \# Working Memory (from reader's input): WM \= { 'concern': 'anxiety about results',        'goal':    'peace of mind',        'stage':   'beginner' } Rule 1: IF concern CONTAINS 'anxiety' OR concern CONTAINS 'results'         THEN recommend\_concept \= 'Nishkama Karma'    \[CF \= 0.92\] Rule 2: IF goal CONTAINS 'peace' OR goal CONTAINS 'equanimity'         THEN recommend\_concept \= 'Sthitaprajna'      \[CF \= 0.85\] Rule 3: IF stage \= 'beginner' AND recommend\_concept \= 'Nishkama Karma'         THEN start\_verse \= 'Verse\_2\_47'              \[CF \= 0.95\] Rule 4: IF concern CONTAINS 'anger' OR concern CONTAINS 'desire'         THEN recommend\_concept \= 'Kama/Krodha chain' \[CF \= 0.90\]         THEN start\_verse \= 'Verse\_2\_62'              \[CF \= 0.88\] Rule 5: IF goal CONTAINS 'meditation' OR goal CONTAINS 'focus'         THEN recommend\_chapter \= 'Chapter 6'         \[CF \= 0.95\]         THEN start\_verse \= 'Verse\_6\_10'              \[CF \= 0.90\] \# Conflict resolution: specificity (Rule 3 is more specific than Rule 1 alone) \# Rule 1 fires first (concern match), adds recommend\_concept to WM \# Rule 3 then fires on updated WM (stage \+ recommend\_concept both present) \# Final recommendation: Verse\_2\_47 with CF \= 0.95 |
| :---- |

## **5.3 SPARQL Queries for All 8 Competency Questions**

| PREFIX gita: \<http://example.org/gita\#\> PREFIX rdfs: \<http://www.w3.org/2000/01/rdf-schema\#\> \# CQ1: Verses on acting without attachment SELECT ?id ?translation WHERE {   ?v gita:teaches ?c ; gita:translationEn ?translation ;      gita:verseNumber ?n ; gita:belongsToChapter ?ch .   ?c gita:conceptName ?cn . FILTER (?cn IN ('Karma Yoga','Nishkama Karma'))   ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?n)) AS ?id) } ORDER BY ?id \# CQ2: Sthitaprajna verses SELECT ?id ?translation ?context WHERE {   ?v gita:teaches ?c ; gita:translationEn ?translation ;      gita:contextNote ?context ; gita:verseNumber ?n ;      gita:belongsToChapter ?ch .   ?c gita:conceptName 'Sthitaprajna' . ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?n)) AS ?id) } \# CQ3: Full downfall chain (transitive \-- requires OWL reasoning ON) SELECT ?step ?stepName WHERE {   gita:Kama gita:leadsTo+ ?step . ?step gita:conceptName ?stepName . } \# CQ4: Practical Dhyana instructions (Chapter 6 verses) SELECT ?id ?translation WHERE {   ?v gita:belongsToChapter gita:Chapter\_6 ;      gita:translationEn ?translation ; gita:verseNumber ?n .   BIND (CONCAT('6.',STR(?n)) AS ?id) } ORDER BY ?n \# CQ5: Karma vs Sannyasa \-- verses teaching both contrasting concepts SELECT ?id ?translation WHERE {   ?v gita:teaches ?c1 ; gita:teaches ?c2 ;      gita:translationEn ?translation ;      gita:verseNumber ?n ; gita:belongsToChapter ?ch .   ?c1 gita:conceptName 'Karma Yoga' . ?c2 gita:conceptName 'Sannyasa' .   ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?n)) AS ?id) } \# CQ6: Progression to Moksha (property chain inference \-- no explicit assertion needed) SELECT ?id ?translation WHERE {   ?v gita:spirituallyProgressesTo gita:Moksha ;      gita:translationEn ?translation ;      gita:verseNumber ?n ; gita:belongsToChapter ?ch .   ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?n)) AS ?id) } \# CQ7: Dialogue \-- Arjuna questions and Krishna's direct responses SELECT ?qId ?aId ?answerText WHERE {   ?q gita:spokenBy gita:Arjuna ;      gita:verseNumber ?qn ; gita:belongsToChapter ?ch .   ?a gita:spokenBy gita:Krishna ; gita:respondsTo ?q ;      gita:translationEn ?answerText ; gita:verseNumber ?an .   ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?qn)) AS ?qId)   BIND (CONCAT(STR(?chn),'.',STR(?an)) AS ?aId) } ORDER BY ?qId \# CQ8: Svadharma verses and their contrasting concept SELECT ?id ?translation ?opposite WHERE {   ?v gita:teaches ?c ; gita:translationEn ?translation ;      gita:verseNumber ?n ; gita:belongsToChapter ?ch .   ?c gita:conceptName 'Svadharma' .   OPTIONAL { ?c gita:contrastsWith ?opp . ?opp gita:conceptName ?opposite . }   ?ch gita:chapterNumber ?chn .   BIND (CONCAT(STR(?chn),'.',STR(?n)) AS ?id) } \# CONSTRUCT: materialise all spirituallyProgressesTo triples not yet explicit CONSTRUCT { ?v gita:spirituallyProgressesTo ?attainment . } WHERE {   ?v gita:teaches ?c . ?c gita:leadsTo+ ?attainment . ?attainment a gita:Attainment .   FILTER NOT EXISTS { ?v gita:spirituallyProgressesTo ?attainment } } |
| :---- |

## **5.4 Assignments — Module 4**

1. Express CQ1, CQ3, and CQ6 as FOL statements. Write the query goal, the required rules (as Horn clauses), and show the unification trace for one example derivation.

2. Implement Rules R1–R4 from Section 5.1 in PROLOG. Query: ?- spirituallyProgressesTo(v2\_47, X). Show all answers returned by PROLOG and verify against SPARQL CQ6 result.

3. Implement the production rule expert system (Section 5.2) in Python. Test with at least 4 different reader profiles (e.g., anxious beginner, meditating intermediate, philosopher). Show which rules fire and in what order.

4. Run the CONSTRUCT query in Fuseki. Count how many new spirituallyProgressesTo triples are derived. Verify these match what PROLOG derives via the transitive leadsTo rule.

5. Write a comparison note (300 words): how do semantic networks, frame systems, and OWL each represent the concept ‘Sthitaprajna’ and its relationship to other concepts? What does OWL enable that the others cannot express?

# **6\. Module 5 — Constraint Satisfaction: Personalised Study Plan**

Generating a personalised Gītā reading plan for a student is a natural CSP. A study plan must cover required themes, respect conceptual prerequisites (you cannot understand 2.63 without 2.62), maintain pacing, and match the reader’s stated goal. This directly parallels the 8-queens and graph-colouring problems from Unit 3\.

## **6.1 Problem Formulation**

| CSP Element | Definition for Study Plan Generation |
| :---- | :---- |
| Variables | Five study sessions: S1, S2, S3, S4, S5 (one session \= 2 verses assigned to it) |
| Domains | D(Si) \= any subset of 2 verses from the 30-verse corpus |
| Theme Constraint | Each session must have a coherent theme: both verses in a session should share at least one concept (no random pairing) |
| Chapter Coverage | At least one verse from each of the three chapters must appear across all five sessions |
| Prerequisite Ordering | If verse A has a respondsTo or conceptual prerequisite relationship with verse B, then B must appear in an earlier session than A |
| Reader Goal | If the reader’s goal is 'understand meditation', Chapter 6 verses must appear by session 3 |
| Downfall Warning | The downfall chain verses (2.62–2.63) must appear together in the same session |
| No Repetition | No verse appears in more than one session |

## **6.2 Backtracking Solver with MRV and Forward Checking**

| def backtrack\_study\_plan(assignment, sessions, domains, constraints, kg):     if len(assignment) \== len(sessions):         return assignment     \# MRV: pick session with fewest valid verse-pairs remaining     session \= min\_remaining\_values(sessions, assignment, domains)     for verse\_pair in order\_domain\_values(session, domains, assignment, kg):         if is\_consistent(session, verse\_pair, assignment, constraints, kg):             assignment\[session\] \= verse\_pair             \# Forward checking: prune domains of unassigned sessions             pruned \= forward\_check(session, verse\_pair, domains, constraints, kg)             if pruned is not None:   \# None means domain wipe-out                 result \= backtrack\_study\_plan(                     assignment, sessions, domains, constraints, kg)                 if result is not None:                     return result             restore\_domains(pruned, domains)             del assignment\[session\]     return None def is\_consistent(session, verse\_pair, assignment, constraints, kg):     v1, v2 \= verse\_pair     \# Theme constraint: both verses share a concept     if not kg.shared\_concepts(v1, v2):           return False     \# No repetition     used \= \[v for pair in assignment.values() for v in pair\]     if v1 in used or v2 in used:                 return False     \# Prerequisite: verse\_2\_63 must come after verse\_2\_62     if 'verse\_2\_63' in \[v1,v2\]:         earlier \= \[v for s,p in assignment.items()                    if s \< session for v in p\]         if 'verse\_2\_62' not in earlier:          return False     return True \# Example solution trace: \# S1: \[Verse\_2\_47, Verse\_3\_9\]   \-- both teach Nishkama Karma / selfless action \# S2: \[Verse\_2\_55, Verse\_2\_56\]  \-- both describe Sthitaprajna qualities \# S3: \[Verse\_2\_62, Verse\_2\_63\]  \-- downfall chain (must be together, constraint OK) \# S4: \[Verse\_6\_10, Verse\_6\_35\]  \-- Dhyana practice (reader goal: meditation by S3) \# S5: \[Verse\_3\_35, Verse\_3\_3\]   \-- Svadharma \+ Karma vs Sannyasa resolution |
| :---- |

| *The prerequisite ordering constraint (Verse\_2\_63 must follow Verse\_2\_62) is analogous to the 8-queens row conflict constraint. The theme coherence constraint (shared concepts) is analogous to the colouring constraint (adjacent nodes different colour). Students should draw this analogy explicitly in their report.* |
| :---- |

## **6.3 Assignments — Module 5**

1. Formally define the study plan CSP with all variables, domains, and constraints as specified in Section 6.1.

2. Implement the backtracking solver in Python or PROLOG. Run it on your 30-verse dataset and print the first valid 5-session study plan found, with the verses in each session and the shared concept justifying each pairing.

3. Add MRV heuristic. Show by example which session has fewest valid pairs at the start and why it is chosen first.

4. Add forward checking. Trace one example of domain pruning: after assigning Verse\_2\_62 and Verse\_2\_63 to session S3, which pairs are eliminated from later sessions?

5. Generate two plans: one for a reader whose goal is ‘understand meditation’, one for a reader whose goal is ‘overcome anxiety about duty’. Show how the reader-goal constraint changes the session ordering.

# **7\. Module 6 — Handling Uncertainty in Verse Interpretation**

The Gītā is among the most commented-upon texts in history. Shankara (Advaita), Ramanuja (Vishishtadvaita), and Madhva (Dvaita) read identical verses and reach different philosophical conclusions. This is not error — it is genuine interpretive uncertainty, and it is a natural domain for certainty factors, fuzzy concept membership, and non-monotonic reasoning.

## **7.1 Certainty Factors for Concept-Verse Mappings**

The certaintyScore data property records interpretive confidence. When the same verse is claimed to teach different concepts by different commentary traditions, CFs capture the degree of scholarly consensus:

| \# Verse\_2\_47: 'You have the right to action alone, never to its fruits.' \# Commentary traditions assign different primary concepts: \# Shankara (Advaita Vedanta):   primary concept \= Jnana Yoga  \[CF \= 0.70\] \#   (action is ultimately transcended by knowledge; this verse is preparatory) \# Ramanuja (Vishishtadvaita):    primary concept \= Karma Yoga  \[CF \= 0.95\] \#   (action as devotional service to God; verse is Karma Yoga heart) \# Madhva (Dvaita):              primary concept \= Bhakti Yoga  \[CF \= 0.80\] \#   (action performed as offering to Krishna \= Bhakti) \# MYCIN combination: two independent pieces of evidence for Karma Yoga \# Evidence 1: Ramanuja CF \= 0.95 \# Evidence 2: Verse context 'selfless action' keyword match CF \= 0.85 \# CF\_combined \= 0.95 \+ 0.85\*(1 \- 0.95) \= 0.95 \+ 0.0425 \= 0.9925 \# If CF(concept-verse link) \< 0.60: assert with uncertainty flag \# If CF(concept-verse link) \< 0.40: do not assert; require expert review \# Representing uncertainty in RDF (using reification or RDF\*): gita:Verse\_2\_47 gita:teaches gita:JnanaYoga\_inst . \# CF \= 0.70 \-- Shankara reading gita:Verse\_2\_47 gita:teaches gita:KarmaYoga\_inst . \# CF \= 0.9925 \-- combined |
| :---- |

## **7.2 Fuzzy Yoga-Path Membership for Verses**

Many Gītā verses do not belong ‘purely’ to one yoga path. Verse 6.47 (‘the greatest yogi is the one who worships Me with devotion’) straddles Dhyāna Yoga and Bhakti Yoga. Fuzzy sets capture this:

| \# Fuzzy membership of Verse\_6\_47 in each yoga path: \# mu\_DhyanaYoga(Verse\_6\_47)  \= 0.75  (chapter is Dhyana Yoga, but ends with devotion) \# mu\_BhaktiYoga(Verse\_6\_47)  \= 0.90  ('who worships Me with devotion' is central) \# mu\_KarmaYoga(Verse\_6\_47)   \= 0.20  (action theme weak in this verse) \# mu\_JnanaYoga(Verse\_6\_47)   \= 0.15  (knowledge theme weak) \# Crisp classification would force: Dhyana Yoga (chapter-based rule) \# Fuzzy classification reveals: this verse is predominantly Bhakti Yoga \# with strong Dhyana Yoga secondary membership \# Fuzzy membership function for Karma Yoga (concept-presence based): \# mu\_KarmaYoga(verse) \= (count of Karma Yoga concepts taught by verse) / 3 \# mu\_KarmaYoga(Verse\_2\_47) \= 3/3 \= 1.0  (teaches NishkamaKarma, KarmaYoga, Vairagya) \# mu\_KarmaYoga(Verse\_6\_35) \= 1/3 \= 0.33 (teaches Vairagya, but mainly Dhyana) |
| :---- |

## **7.3 Non-Monotonic Reasoning — Recontextualisation Across Chapters**

The Gītā is uniquely suited to non-monotonic reasoning: a concept established in Chapter 2 is frequently ‘overridden’ or refined by a later verse. A reader’s understanding is revised, not simply extended:

| \# Default rule (after reading Chapter 2): \# A reader concludes: 'the Gita recommends action over renunciation' default: recommendedPath(reader, karma\_yoga) :-              hasRead(reader, chapter\_2),              NOT exception(reader, karma\_yoga). \# Exception introduced in Chapter 3, Verse 3.3: \# 'Two paths were taught: knowledge for contemplatives, action for the active' \# A reader suited to Jnana Yoga should choose that path instead. exception(Reader, karma\_yoga) :-     hasRead(Reader, verse\_3\_3),     natureof(Reader, contemplative). \# Result: The previous conclusion recommendedPath(reader, karma\_yoga) is RETRACTED \# for a contemplative reader, and replaced by recommendedPath(reader, jnana\_yoga). \# This is open-world, default reasoning: \# \-- Classic logic: adding verse\_3\_3 can only add conclusions \# \-- Non-monotonic: adding verse\_3\_3 RETRACTS the earlier karma\_yoga recommendation \# Further retraction: after reading Chapter 18 (Moksha Sannyasa Yoga, outside scope): \# Krishna reconciles all paths as equally valid for different temperaments. \# All earlier 'exclusive' path recommendations are retracted and replaced by \# 'all paths lead to Me' \-- a higher-order generalisation. |
| :---- |

## **7.4 Assignments — Module 6**

1. Select 5 verses in your dataset that have genuinely ambiguous concept mappings (e.g., Verse\_6\_47, Verse\_2\_47, Verse\_3\_27). For each, assign CFs from at least two commentary traditions and compute the combined CF using the MYCIN formula.

2. Implement a SPARQL query that retrieves only verse-concept mappings with certaintyScore \>= 0.80. Compare the result set with the full unfiltered result for CQ1. Identify which verses drop out and why.

3. Draw fuzzy membership curves for at least three yoga paths (Karma Yoga, Dhyana Yoga, Bhakti Yoga) as a function of concept-presence score for your 30 verses. Which verses have high membership in two paths simultaneously?

4. Write two non-monotonic reasoning examples from your dataset: (a) a default assumption made after Chapter 2 that is retracted by Chapter 3, (b) a default assumption about a reader that is revised when new information about the reader arrives. Model each using default logic notation.

5. Write a comparative overview (300 words) of certainty factors, Bayesian probability, and fuzzy logic for the task of verse-to-concept mapping. Which approach best handles the kind of interpretive uncertainty present in the Gita, and why?

