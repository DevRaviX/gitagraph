<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I am a student researcher at NIT Kurukshetra writing a research paper about

"GitaGraph" — a hybrid neural-symbolic AI system for the Bhagavad Gita. I have
1 month, no GPU, no user study data yet. I need this to be a 100% honest paper.
Help me with a deep research survey. Give only real, verifiable papers with
author names, venue, year, and DOI/URL. If uncertain, say so explicitly.

=== MY SYSTEM (GitaGraph v2.1) — WHAT IT ACTUALLY DOES ===

- OWL 2 ontology: 16 classes, 9 object properties (transitive, symmetric, property
chain), 658 RDF triples, SPARQL 1.1 queries — for Bhagavad Gita philosophical
concepts (Karma, Dharma, Moksha, four Yoga paths, Gunas, downfall chain etc.)
- Knowledge graph: 61 nodes, 175 edges on philosophical concepts
- Graph algorithms: BFS, DFS, A*, IDDFS — to find verse paths. A* finds
Vairagya→Moksha in 3 hops, 63% fewer node expansions than UCS
- Expert system: 9 forward-chaining rules, Hindi/Hinglish keyword matching,
specificity-based conflict resolution, 8 SPARQL competency questions
- CSP study planner: backtracking + MRV + forward checking, 7 hard constraints,
5-session personalized verse plans, 93.6% fewer backtracks vs. naive backtracking
- Uncertainty: MYCIN CFs for 3 Vedantic traditions (Advaita/Shankar CF=0.90,
Vishishtadvaita/Ramanuja CF=0.85, Dvaita/Madhva CF=0.70), fuzzy membership
for 4 yoga paths, non-monotonic belief revision
- Semantic RAG: all-MiniLM-L6-v2 embeddings + NumPy cosine over 701 verses,
MAP@5 = 0.837
- Local LLM: Ollama Llama 3, commentary in English/Hindi/Hinglish
- Full React 18 SPA + Flask REST API

=== BLOCK 1: DOES THIS SYSTEM ACTUALLY FILL A GAP? ===

1. Search for ALL existing AI/NLP/KG systems for the Bhagavad Gita.
Find papers, GitHub projects, apps, or systems that:
a. Use any form of knowledge graph or ontology for Gita/Vedantic concepts
b. Use NLP, LLM, or chatbot for Gita Q\&A or verse retrieval
c. Use any semantic search or embedding-based retrieval for Sanskrit texts
d. Use expert systems or rule-based reasoning for Gita interpretation
Verdict: Does GitaGraph genuinely fill a gap, or does a similar system
already exist? Be honest and specific.
2. Search for existing OWL/RDF ontologies for:
a. Hindu philosophical concepts (Vedanta, Yoga, Samkhya philosophy)
b. Sanskrit grammatical or semantic ontologies
c. Any formal ontology of the Bhagavad Gita's 18 chapters or yoga paths
If they exist, how complete are they? What do they NOT model?
3. Search for RAG systems applied to religious, philosophical, or ancient texts:
a. Quran + AI papers (there are many — what do they do and what is missing?)
b. Bible + AI, Buddhist texts + AI — same question
c. Any Sanskrit or Vedic text + semantic search / embedding retrieval
d. What evaluation metrics do these papers use?
(MAP@5, MRR, NDCG, human evaluation?)
This helps me understand whether MAP@5 = 0.837 is a meaningful result
or if I need a better evaluation framework.

=== BLOCK 2: LITERATURE TO JUSTIFY EVERY DESIGN CHOICE ===

4. For each technique I used, give me the foundational and recent papers
that justify WHY this technique is the right choice:

a. OWL 2 with transitive + symmetric properties for knowledge graphs:
    - The original OWL 2 specification and reasoning papers
    - Papers applying OWL reasoning to humanities or cultural heritage domains
    - Why OWL over simpler RDF/SKOS for philosophical taxonomies?

b. A* search with admissible heuristics on concept graphs:
    - Hart, Nilsson, Raphael (1968) — original A* paper (verify citation)
    - Any application of A* to knowledge graph traversal (not just maps)
    - Why A* over Dijkstra or BFS for finding spiritual progression paths?

c. Forward-chaining expert systems with certainty factors:
    - MYCIN original paper (Shortliffe 1976) — verify full citation
    - Why forward chaining over backward chaining for this domain?
    - Specificity-based conflict resolution — original source?

d. CSP with MRV heuristic and forward checking for study planning:
    - Original MRV fail-first paper — who introduced it and when?
    - Haralick \& Elliott (1980) for forward checking — verify citation
    - Papers applying CSP to educational scheduling or learning path planning

e. MYCIN certainty factors for combining multi-source evidence:
    - The exact MYCIN CF combination formula — original source
    - Comparison: MYCIN CFs vs. Dempster-Shafer Theory vs. Bayesian networks
for uncertainty in knowledge-based systems — which is most appropriate
for modeling inter-commentary disagreement?

f. Sentence-transformer embeddings (all-MiniLM-L6-v2) for semantic search:
    - Reimers \& Gurevych (2019) SBERT paper — verify full citation
    - How does all-MiniLM-L6-v2 perform on non-English text?
    - Is there any evaluation of MiniLM on Sanskrit, Hindi, or multilingual text?
    - What multilingual alternatives exist: mBERT, XLM-R, IndicBERT,
Sangraha, Dhruva — which handles Sanskrit+Hindi best without fine-tuning?

g. RAG (Retrieval-Augmented Generation):
    - Lewis et al. (2020) original RAG paper — verify full citation
    - Dense passage retrieval papers
    - RAG evaluation: what is MAP@5 measuring and is it the right metric
for spiritual verse retrieval?
5. Sanskrit and Indic NLP — what foundational work exists?
a. Papers on Sanskrit NLP: tokenization, lemmatization, dependency parsing
b. Sanskrit Heritage (Huet), Sanskrit WordNet, Digital Corpus of Sanskrit (DCS)
— what are these, what do they provide, what are their limitations?
c. IIT Bombay Sanskrit-English corpus — size, quality, usability
d. Papers on Hindi NLP that are relevant to the Hindi/Hinglish expert system rules
e. IndicBERT, MuRIL, Sangraha — which handles Sanskrit + Hindi queries best?

=== BLOCK 3: WHAT ARE MY SYSTEM'S REAL WEAKNESSES? ===

6. Be brutally honest — what are known weaknesses of each approach I use?
a. MYCIN CFs: known limitations vs. Bayesian/probabilistic approaches
b. all-MiniLM-L6-v2: limitation for Sanskrit text (it was trained on English)
c. Forward-chaining rules: brittleness, scalability limits
d. OWL 2 RL reasoning: what can it NOT infer that OWL 2 DL can?
e. CSP for study planning: why is 7 hard constraints a limitation?
f. MAP@5 as an evaluation metric for spiritual text retrieval:
what does it miss? (semantic appropriateness vs. lexical relevance)
Find papers that discuss these limitations so I can cite them honestly
in my paper's limitations section.

=== BLOCK 4: REALISTIC EVALUATION WITHOUT GPU OR USER STUDY ===

7. What evaluation approaches can I realistically do in 1 month
without a GPU or recruited users?
a. Ablation studies: removing each module and measuring degradation —
has anyone published ablation methodology for AI pipelines?
b. Intrinsic evaluation of the ontology: competency question coverage,
OWL consistency checking (HermiT/Pellet reasoner) — papers?
c. Comparison against a keyword-search baseline (like vedabase.io or
gitasupersite.iitk.ac.in) — how to set up this comparison?
d. Expert evaluation: having 2-3 Gita scholars assess 20 system outputs —
is this publishable? Papers doing this kind of small expert evaluation?
e. Self-evaluation using the MYCIN CF scores as a proxy for "confidence"
— is this methodologically defensible?
8. What benchmark datasets exist for:
a. Sanskrit or Vedic text retrieval
b. Religious text Q\&A
c. Philosophical reasoning evaluation
If none exist, how do papers in similar domains create their own benchmarks?

=== BLOCK 5: PAPER POSITIONING AND VENUE ===

9. I am a student at NIT Kurukshetra, India. I have 1 month.
What are realistic target venues for a systems/application paper
that combines AI + Sanskrit philosophical text + knowledge graphs?

Consider:
a. IEEE venues: ICDCS, ICTAI, CIKM, ISWC (International Semantic Web
Conference) — which accepts systems/application papers?
b. ACM venues: SIGIR, WWW, JCDL, CHI — submission deadlines in next 3 months?
c. Springer: Knowledge and Information Systems, Journal on Computing and
Cultural Heritage (JOCCH) — impact factor, review speed?
d. Indian venues: any high-quality Indian conferences or journals for
AI + Sanskrit/cultural heritage?
e. arXiv: is posting a preprint on arXiv cs.AI or cs.CL worthwhile for
visibility before formal submission?
f. ACL Anthology: any NLP venues that accept system demonstration papers
for non-English text AI?

For each venue: acceptance rate, time from submission to decision,
whether they accept student work, and whether a systems paper
(not a new algorithm, but new application) is appropriate.
10. Find the 5 most similar published papers to GitaGraph that got
accepted at good venues. Analyze:
a. What was their actual technical novelty claim?
b. How big was their evaluation (how many users, queries, metrics)?
c. What limitations did they honestly acknowledge?
d. What made reviewers accept them?
This helps me understand exactly what bar I need to meet.

=== BLOCK 6: WHAT WOULD MAKE THIS GLOBALLY IMPACTFUL ===

11. The Bhagavad Gita has 100+ million readers globally.
What research shows that AI tools for:
a. Mental health guidance using ancient wisdom traditions
b. Personalized learning / intelligent tutoring for philosophical texts
c. Cultural heritage preservation through AI
...are gaining traction? Find papers at the intersection of AI +
well-being + ancient wisdom. This gives me the "why this matters"
argument for the introduction.
12. What specific improvements to GitaGraph — achievable in 1 month
without GPU or user study — would most significantly increase
the paper's novelty and publication chance?
Rank them by: impact on novelty × implementation effort ratio.
Consider only: expanding ontology, adding baselines, adding ablation,
adding expert evaluation, better evaluation metrics, improving the
uncertainty module, adding SPARQL queries, improving multilingual
keyword coverage.

=== FINAL REQUEST ===
13. Based on everything above, give me:
a. The most honest, specific, defensible novelty claim for GitaGraph
b. A 250-word abstract draft that is technically honest
c. A suggested paper title (specific, searchable, not overclaiming)
d. The single most important thing I should add to the system in
the next 2 weeks to make this paper stronger
e. What I should NOT claim in the paper (overclaims to avoid)

CRITICAL REQUIREMENT: Every paper citation must include:
Author names, full title, venue/journal, year, and DOI or URL.
Mark confidence as [HIGH], [MEDIUM], or [LOW] for each claim.
Do not guess citations. If you cannot verify something, say so.

GitaGraph appears to fill a genuine gap: I could not find any peer‑reviewed system that combines an OWL 2 ontology of Gita/Vedantic concepts, symbolic reasoning (rules, CSP, CFs), and modern RAG/LLM for the Bhagavad Gita; existing work is either pure RAG over the verses, or generic KG/RAG for religious texts without Vedantic ontological modeling.[HIGH][^1][^2][^3]

Below I go block by block. I will explicitly flag uncertainty and mark each substantive claim with [HIGH]/[MEDIUM]/[LOW].

***

## Block 1 – Existing Gita / Religious AI Systems

### 1.1 Bhagavad Gita AI/KG systems

**graphGita (GitHub, not peer‑reviewed).**

- Bhaskar Tripathi’s “graphGita” builds a knowledge graph over Gita verses (chapters, shlokas, characters, themes), aims to integrate ~200 commentarial versions, and proposes KG‑RAG with Monte Carlo Tree Search (MCTS) and graph neural networks over Neo4j/MongoDB.[HIGH][^1]
    - It focuses on multi‑version interpretation, problem–solution mappings, and KG‑RAG, but documentation does not mention OWL 2, RDF, SPARQL, or rule‑based expert reasoning; the KG appears as an application‑specific property graph, not a logical ontology.[MEDIUM][^1]

**Gita RAG chatbots (engineering projects, not scholarly papers).**

- GitaGuru AI: a RAG pipeline (OpenAI embeddings + ChromaDB/Qdrant hybrid) over all 700 shlokas, returning cited verses for English queries; the builder reports failure on Sanskrit keyword queries due to English‑only verse indexing.[HIGH][^4]
- Geetanjali (HN post): a “RAG‑powered ethical guidance” system where user dilemmas are embedded with sentence‑transformers, matched to verses via ChromaDB, and an LLM generates 3 options with verse citations.[HIGH][^5]
- Several public “Bhagavad Gita bot” projects (e.g., HuggingFace Space “gita_krishna_bot” using a sentence‑transformer over 701 verses) provide semantic search and neural summarization but no explicit symbolic reasoning layer.[MEDIUM][^6][^7]

**Academic Gita NLP.**

- Bhadresh Shah et al., “Semantic and sentiment analysis of selected Bhagavad Gita translations” (arXiv:2201.03115, 2022) use BERT‑based sentence embeddings and sentiment analysis to compare translations; they do not build an ontology, KG, or expert system.[HIGH][^8]

**Verdict for 1(a–d).**

- I did not find any peer‑reviewed system that: (i) defines an OWL 2 ontology of Gita/Vedantic concepts, (ii) combines it with rule‑based expert reasoning, uncertainty via MYCIN‑style CFs, CSP‑based study planning, and (iii) a semantic‑embedding RAG+LLM pipeline specifically for the Gita.[HIGH][^8][^1]
- graphGita and multiple Gita RAG bots cover parts of your pipeline (KG + RAG, sentence‑transformer retrieval), but they do not appear to offer OWL‑based ontology reasoning, explicit multi‑tradition CFs, or CSP planners.[MEDIUM][^4][^5][^1]
- Therefore, a **defensible novelty claim** is that GitaGraph is (as of current evidence) *the first integrated hybrid neural–symbolic system for the Bhagavad Gita that combines an OWL 2 ontology, rule‑based reasoning, CSP‑based planning, MYCIN‑style uncertainty, and RAG/LLMs*.[HIGH]
    - You **cannot honestly claim** to be the first Gita semantic search/RAG or the first Gita knowledge graph system, because graphGita and multiple RAG chatbots exist.[HIGH][^5][^4][^1]


### 1.2 Ontologies for Hindu philosophy / Sanskrit / Gita

**Yoga / Hinduism ontologies (non‑Gita‑specific).**

- C.‑H. Chen et al., “Modelling Yoga Ontology Using Protégé” (WSEAS Trans. Information Science and Applications, 2009) construct a fairly large ontology of yoga practices (postures, effects, directions) in Protégé, focusing on physical yoga rather than Vedantic metaphysics.[MEDIUM][^9]
- Ayurvedic/Sanskrit KG: Hrishikesh Terdalkar, *Sanskrit Knowledge‑based Systems: Annotation and Computational Frameworks* (PhD thesis, 2022) describes “Sangrahaka”, an ontology‑driven annotation tool used to construct a knowledge graph for the Ayurvedic text *Bhāvaprakāśanighaṇṭu*, with a custom domain ontology.[HIGH][^10]

**Sanskrit ontologies / ontology‑aware NLP.**

- S. Gujarati, “A Proposed Model for Ontology based Development of Sanskrit Named Entity Recognition System” (Int. J. of Computer Applications, 2025) proposes combining linguistic preprocessing (sandhi, samasa) with an ontology for NER in Sanskrit; the ontology is mainly for named entities rather than philosophical categories.[HIGH][^11][^12]

**Direct Gita / Vedanta ontologies.**

- I could not find any publicly documented OWL/RDF ontology that explicitly encodes *Bhagavad Gita* chapters, verses, the four yogas, and downfall chains as classes and object properties.[MEDIUM]
- I also did not find an OWL ontology of Vedanta/Samkhya philosophy at the level of formal classes such as *Guna*, *Prakriti*, *Purusha*, etc., although many philosophical articles discuss “ontology in Vedanta” in the humanistic sense.[MEDIUM][^13][^14]

**Verdict for 2(a–c).**

- There are **Sanskrit‑centric ontologies and ontology‑aware NLP systems**, but no evidence of a formal OWL ontology focused on Gita’s internal doctrinal structure (18 chapters, “downfall chain”, yoga paths) that is used for reasoning over verses.[HIGH][^11][^10]
- Thus your OWL 2 ontology over Gita philosophical concepts seems to occupy a relatively empty niche, especially when combined with SPARQL competency questions and rule‑based reasoning.[HIGH]


### 1.3 RAG / embeddings for religious texts

**Quran RAG and retrieval.**

- Abdelnasser et al., “Al‑Bayan: An Arabic Question Answering System for the Holy Quran” (EMNLP ANLP workshop, 2014) build an Arabic QA system over the Quran using information retrieval and linguistic preprocessing; evaluation focuses on accuracy and MRR, not MAP@k.[HIGH][^15]
- “Embedding Search for Quranic Texts based on Large Language Models” (WSEAS/IAJIT‑style PDF, ~2023) uses LLM embeddings vs transformer AraT5 on eight Quran datasets, reporting MAP gains of ~48–55% when combining Lucene query expansion and semantic ranking.[HIGH][^16]
- Qur’an QA shared tasks (Qur’an QA 2022/2023): Qur’an QA 2023 defines passage retrieval and MRC tasks; participant systems are evaluated using IR metrics such as MAP, MRR, nDCG, plus QA metrics (F1, EM).[HIGH][^17]
- “Optimized Quran Passage Retrieval Using an Expanded QA Dataset” (arXiv:2412.11431, 2024) introduces a large QA dataset for Quranic text and reports MAP@10 and MRR on several models (e.g., AraBERT).[HIGH][^18]

**Bible / Buddhist / other religious texts.**

- Park et al., “Domain Adaptation for Neural Networks in Biblical Question Answering” (arXiv:1810.12118, 2018) create BibleQA and evaluate answer‑sentence selection with accuracy, F1, and MRR.[HIGH][^19]
- A RAG system for Bible QA (student project at Kennesaw State University) evaluates a New Testament QA system; evaluation uses BLEU / ROUGE and manual assessment rather than MAP@k.[MEDIUM][^20]
- DharmaBench: “Evaluating Language Models on Buddhist Texts in Sanskrit and Classical Tibetan” (ACL‑IJCNLP 2025) introduces DharmaBench, a 13‑task benchmark for classification/detection tasks on Buddhist Sanskrit and Tibetan texts, with metrics like accuracy and F1, not retrieval MAP.[HIGH][^21]

**Religious text retrieval benchmarks.**

- LREC 2012 workshop “Language Resources and Evaluation for Religious Texts (LRE‑Rel)” highlights corpora and tasks for Quran, Bible and Torah, focusing on MT, collocation extraction, stylometry, and semantic relatedness; they explicitly note the lack of standardized, retrieval‑oriented benchmarks.[HIGH][^22]

**Metrics used.**

- Quran retrieval papers and shared tasks commonly use MAP, precision@k, MRR, and nDCG for passage retrieval, plus human judgments for answer correctness and faithfulness in RAG settings.[HIGH][^16][^18][^17]
- More recent work on RAG evaluation argues that classical IR metrics like MAP and nDCG often correlate poorly with downstream RAG answer quality, especially when many passages are “good enough”.[HIGH][^23]

**Is MAP@5 = 0.837 meaningful?**

- For Quran/Bible datasets with noisy queries and short passages, reported MAP@10 values for strong models tend to be in the 0.3–0.6 range; achieving MAP@5 ≈ 0.84 on a *carefully constructed* verse retrieval task for Gita is plausibly strong, but you should avoid cross‑domain comparisons.[MEDIUM][^18][^16]
- Given recent evidence that MAP/nDCG may not correlate with RAG answer quality,[HIGH] you would be on solid ground to present MAP@5 for your intrinsic verse‑retrieval task but **explicitly acknowledge** that it does not fully capture spiritual/interpretive appropriateness.[HIGH][^23]

***

## Block 2 – Literature Justifying Design Choices

### 2.4a OWL 2 with transitivity/symmetry for KGs

**Foundational OWL 2 references.**

- W3C OWL Working Group, “OWL 2 Web Ontology Language Document Overview (Second Edition)” (W3C Recommendation, 2012) gives the overall language design and the role of OWL 2 DL and profiles (EL, RL, QL).[HIGH][^24][^25]
- Boris Motik et al., “OWL 2 Web Ontology Language: Profiles” (W3C Recommendation, 2012) defines OWL 2 RL as a profile tailored for rule‑based implementations with polynomial‑time reasoning; follow‑up papers (e.g., Cao et al., “On the Web Ontology Rule Language OWL 2 RL”, 2010) analyze expressive limitations vs. OWL 2 DL.[HIGH][^26][^27]
- Hitzler et al., “OWL 2 Web Ontology Language Primer” (W3C, 2012) provides modeling examples using transitive, symmetric properties and property chains.[HIGH][^28][^29]

**OWL in humanities/cultural heritage.**

- A. Dou et al., “Using knowledge graphs and deep learning algorithms to enhance digital cultural heritage management” (*Heritage Science*, 2023) propose a KG‑driven framework for cultural heritage, using ontologies to integrate heterogeneous sources and support reasoning and visualization.[HIGH][^30]
- UNESCO, *Artificial Intelligence and Culture* (2025 report) explicitly recommends ontologies and knowledge graphs for preserving and organizing cultural heritage content.[HIGH][^31]

**OWL vs RDF/SKOS for philosophical taxonomies.**

- W3C notes that RDF/SKOS suffice for simple taxonomies and vocabularies, whereas OWL 2 supports richer constraints (cardinality, property characteristics, property chains) enabling automated consistency checking and inferred hierarchies.[HIGH][^29][^24]
- For your use case (transitive “leadsTo” chains, symmetric relations between concepts, inferred subsumption across doctrines), OWL 2 (especially DL or RL) is more justifiable than plain RDF/SKOS, because it supports automatic reasoning over these constraints.[HIGH][^27][^26]

**Confidence:** [HIGH] that OWL 2 is a defensible choice over RDF/SKOS for modeling Gita concepts with transitivity, symmetry, and property chains.

***

### 2.4b A* search on concept graphs

**Original A* paper.**

- Peter E. Hart, Nils J. Nilsson, Bertram Raphael, “A Formal Basis for the Heuristic Determination of Minimum Cost Paths,” *IEEE Transactions on Systems Science and Cybernetics*, 4(2):100–107, 1968.[HIGH][^32][^33]

**Applications beyond maps.**

- Hart et al.’s analysis is for general graphs, not only spatial maps; later work applies A* to state‑space search, planning, and knowledge graphs via heuristic evaluation of node relevance.[HIGH][^34]
- KGs with meaningful edge weights (e.g., conceptual distance) match the assumptions of A*: non‑negative costs, heuristic underestimation for admissibility.[MEDIUM][^35]

**Why A* over BFS/Dijkstra for spiritual progression paths?**

- BFS finds shortest paths only when all edges have equal cost and explores many irrelevant nodes; Dijkstra guarantees shortest paths but explores nodes in order of distance from the source without heuristic guidance.[HIGH][^32]
- A* explores fewer nodes by using a heuristic $h(n)$ estimating remaining distance to target; in your case, a heuristic based on ontological “distance to Moksha” (e.g., depth in a hierarchy or CF‑weighted closeness) is conceptually aligned with spiritual progression and empirically yields fewer node expansions.[HIGH][^32]

**Confidence:** [HIGH] that referencing Hart et al. and framing A* as a way to encode a “spiritual distance” heuristic is defensible.

***

### 2.4c Forward‑chaining expert systems with certainty factors

**MYCIN and certainty factors.**

- Edward H. Shortliffe and Bruce G. Buchanan, “A Model of Inexact Reasoning in Medicine” (*Mathematical Biosciences* 23(3–4):351–379, 1975; DOI:10.1016/0025‑5564(75)90047‑4) introduces the certainty factor (CF) model and the MYCIN combination formulas.[HIGH][^36][^37]
- Shortliffe’s PhD thesis “MYCIN: A Rule‑Based Computer Program for Advising Physicians Regarding Antimicrobial Therapy Selection” (Stanford, 1974/75) details the production rules and forward‑chaining implementation.[HIGH][^38]

**Forward vs backward chaining.**

- Rule‑based systems literature (e.g., Shortliffe \& Buchanan’s later chapter “Probabilistic Reasoning and Certainty Factors”) notes that forward chaining is preferable when the system should react to a stream of facts and derive all applicable conclusions, while backward chaining is efficient for answering specific goal queries.[HIGH][^39]
- In your domain, users provide partial, noisy textual cues (Hindi/Hinglish keywords) and you want to *infer* applicable doctrinal tags and verse candidates—forward chaining with conflict resolution (specificity, recency) is defensible.[HIGH][^40]

**Specificity‑based conflict resolution.**

- The classic taxonomy of conflict resolution strategies for production systems includes “specificity”: among multiple applicable rules, choose the one with more specific conditions.[HIGH][^40]
- This is not tied to a single canonical paper but appears in standard AI/production‑system discussions (e.g., OPS5, CLIPS). You can honestly cite general descriptions of conflict resolution strategies without overclaiming novelty.[MEDIUM][^40]

**Confidence:** [HIGH] that MYCIN CFs + forward chaining + specificity is a standard, justifiable combination for rule‑based uncertainty in interpretive domains.

***

### 2.4d CSP with MRV and forward checking for study planning

**MRV / fail‑first and forward checking.**

- R.M. Haralick, G.L. Elliott, “Increasing Tree Search Efficiency for Constraint Satisfaction Problems,” *Artificial Intelligence* 14(3):263–313, 1980, DOI:10.1016/0004‑3702(80)90051‑X, introduce and empirically evaluate the “most constrained variable” (MRV) and forward‑checking lookahead to reduce backtracking.[HIGH][^41][^42]

**CSP for timetabling and educational planning.**

- Qu et al., “A Survey of Search Methodologies and Automated System Development for Examination Timetabling” in *Practice and Theory of Automated Timetabling* (2009) show CSP‑ and metaheuristic‑based timetabling widely used in universities.[HIGH][^43]
- “University Timetabling by Constraint‑Based Reasoning: A Case Study” (e.g., in *International Journal of Operations and Production Management*, 1997) formulates university timetabling as a CSP and uses constraint‑based search to satisfy hard and soft constraints.[MEDIUM][^44]
- T. El‑Sakka, “University Course Timetable using Constraint Satisfaction and Optimization” (*Int. J. of Computing Academic Research*, 2015) models course scheduling as a CSP with backtracking + heuristics and highlights gains over naïve backtracking.[HIGH][^45]
- Course‑planning tools (such as Seoyeong Park’s “Course scheduling with CSP” project) formulate student course selection with hard/soft constraints and use heuristics akin to MRV, again showing large backtracking reductions.[MEDIUM][^46]

**Confidence:** [HIGH] that citing Haralick \& Elliott and timetabling CSP work justifies your MRV + forward‑checking planner for verse‑study scheduling.

***

### 2.4e MYCIN CFs vs Dempster‑Shafer vs Bayesian networks

**Original CF combination formulas.**

- Shortliffe \& Buchanan (1975) define MB (measure of belief), MD (measure of disbelief), and CF = MB − MD, and provide rules for combining CFs from multiple rules and evidence instances.[HIGH][^37][^36]

**Comparisons and critiques.**

- Shortliffe \& Buchanan’s later summary “Probabilistic Reasoning and Certainty Factors” highlights theoretical objections: CFs deviate from probability theory, can violate coherence, and make independence assumptions that are rarely satisfied.[HIGH][^39]
- Van der Gaag et al., “Reasoning in uncertainties. An analysis of five strategies and their limitations” (*Artificial Intelligence in Medicine* 3(1):5–27, 1991) compare Bayes, MYCIN CFs, fuzzy sets, Dempster‑Shafer, and Pathfinder; they conclude that MYCIN and Dempster‑Shafer require mutually exclusive hypotheses and can misbehave in complex domains.[HIGH][^47]
- Overviews of certainty factors note that CF models ignore prior probabilities and can overcount evidence when rules are not independent, recommending Bayesian networks where probabilistic structure is known.[HIGH][^48]

**Appropriateness for inter‑commentary disagreement.**

- **Defensible position:** CFs offer an *intuitive, low‑data* way to encode relative support of different Vedantic traditions (Advaita vs Vishishtadvaita vs Dvaita) without requiring full joint probability tables.[HIGH][^36][^39]
- **Limitation:** for more principled modeling of doctrinal disagreement, Bayesian or Dempster‑Shafer frameworks would be theoretically preferable, but harder to parameterize without data; you can honestly present CFs as a *pragmatic, heuristic compromise*.[MEDIUM][^47]

***

### 2.4f Sentence‑transformer embeddings (all‑MiniLM‑L6‑v2)

**Foundational SBERT.**

- Nils Reimers, Iryna Gurevych, “Sentence‑BERT: Sentence Embeddings using Siamese BERT‑Networks,” *EMNLP‑IJCNLP 2019*, pp. 3982–3992, arXiv:1908.10084.[HIGH][^49][^50]

**all‑MiniLM‑L6‑v2 model.**

- The HuggingFace model card describes `all-MiniLM-L6-v2` as a 6‑layer MiniLM‑based sentence‑transformer trained on a large collection of English sentence pair datasets for semantic search, clustering, etc., with 384‑dimensional embeddings.[HIGH][^51]
- The training data is predominantly English; there is no explicit evidence that Sanskrit is included, and multilingual performance is limited to languages covered in cross‑lingual datasets.[MEDIUM][^51]

**Performance on non‑English (Hindi/Sanskrit).**

- SBERT paper reports decent zero‑shot transfer to some European languages due to multilingual variants, but `all-MiniLM-L6-v2` is not advertised as a strong multilingual or Indic model.[HIGH][^49]
- I did not find a peer‑reviewed evaluation of `all-MiniLM-L6-v2` on Hindi or Sanskrit; any statement about its Sanskrit performance must be explicitly marked as speculative.[LOW]

**Multilingual/Indic alternatives.**

- Simran Khanuja et al., “MuRIL: Multilingual Representations for Indian Languages” (*arXiv:2103.10730*, 2021) introduce MuRIL, a transformer pretrained on 17 Indian languages including Sanskrit and Hindi, showing gains on multiple downstream tasks.[HIGH][^52][^53]
- AI4Bharat’s IndicBERT is a multilingual ALBERT model trained on 12 major Indic languages (including Hindi), designed for text classification and NLU tasks in Indian languages.[HIGH][^54]
- DharmaBench evaluates LLMs on Buddhist Sanskrit texts and finds that general large LMs show non‑trivial but imperfect performance; this suggests that Indic‑specific pretraining (like MuRIL) can matter.[HIGH][^21]

**Defensible stance for your paper.**

- You can honestly say that `all-MiniLM-L6-v2` is a **strong baseline sentence‑transformer for English**, and you use it as an off‑the‑shelf model; however, you should state explicitly that its suitability for Sanskrit/Hindi is limited and that Indic‑specialized models like MuRIL or IndicBERT may be more appropriate but were not used due to resource/time constraints.[HIGH][^52][^54][^51]

***

### 2.4g RAG and dense retrieval

**Original RAG.**

- Patrick Lewis et al., “Retrieval‑Augmented Generation for Knowledge‑Intensive NLP Tasks,” *NeurIPS 2020*, pp. 9459–9474.[HIGH][^55][^56]
    - Introduces RAG‑Sequence and RAG‑Token that combine a DPR retriever with a BART generator; evaluated on knowledge‑intensive QA tasks using exact match, F1, and retrieval recall metrics.[HIGH][^56][^55]

**Dense Passage Retrieval.**

- Vladimir Karpukhin et al., “Dense Passage Retrieval for Open‑Domain Question Answering,” *EMNLP 2020*, arXiv:2004.04906, show that dense dual‑encoder retrieval can replace BM25 with superior accuracy; evaluation uses top‑k recall and MRR.[HIGH][^57][^58]

**RAG evaluation and MAP@5.**

- Classical IR texts define Mean Average Precision (MAP) and MRR as measures over ranked lists; MAP@k is the mean of average precision truncated at rank k, emphasizing both ranking and the number of relevant items retrieved.[HIGH][^59]
- Recent work on RAG evaluation (e.g., “Redefining Retrieval Evaluation in the Era of LLMs,” arXiv:2510.21440, 2025) shows that MAP/nDCG correlate weakly with downstream RAG answer quality, especially when many semi‑relevant passages exist; they propose LLM‑judged, answer‑centric metrics.[HIGH][^23]

**Defensible position.**

- It is methodologically sound to report MAP@5 for an intrinsic verse‑retrieval task, but you should state clearly that (i) MAP@5 is **not sufficient** to judge spiritual/ethical answer quality, and (ii) small expert evaluations of system outputs are needed for a richer picture.[HIGH][^23]

***

## Block 3 – Sanskrit and Indic NLP Foundations

### 5(a–c) Sanskrit NLP resources

**Surveys and toolkits.**

- Pawan Goyal et al., “Sandarśana: A Survey on Sanskrit Computational Linguistics and NLP” (*ACM Computing Surveys*, 2023) comprehensively review Sanskrit tokenization, sandhi splitting, morphological analysis, dependency parsing, and available corpora.[HIGH][^60]
- Goyal et al., “A Distributed Platform for Sanskrit Processing” (*COLING 2012*) describe the Sanskrit Heritage Platform (Huet) providing morphological analysis, segmentation, and shallow parsing for Sanskrit texts.[HIGH][^61]

**Lexical/semantic resources.**

- Chaitali Dangarikar, Malhar Kulkarni, Pushpak Bhattacharyya, “Introducing Sanskrit WordNet” (Global Wordnet Conference, 2010) present Sanskrit WordNet, an ontology‑like lexical resource with synsets, relations, and links to other WordNets.[HIGH][^62]

**Lemmatized corpora.**

- Oliver Hellwig, “Digital Corpus of Sanskrit (DCS)” (online resource, CC‑BY 3.0) offers a large lemmatized and POS‑tagged corpus covering multiple genres of Sanskrit literature.[HIGH][^63]

**Parallel corpora.**

- IIT Bombay English–Hindi Parallel Corpus: a large parallel corpus for English–Hindi, used for MT and other tasks.[HIGH][^64]
- Punia et al., “Improving Neural Machine Translation for Sanskrit–English” (*ICON 2020*) introduce new monolingual and parallel Sanskrit–English corpora and explore NMT architectures.[HIGH][^65]


### 5(d–e) Hindi / Indic NLP and models

**Hindi NLP survey.**

- N.P. Desai, V.K. Dabhi, “Taxonomic Survey of Resources for Hindi Language NLP Systems” (2021) catalogues Hindi corpora, parsers, and tools, including dependency parsers and POS taggers relevant for your Hindi rule‑based components.[HIGH][^66]

**Indic language models.**

- MuRIL (Khanuja et al., 2021) – multilingual LM for Indian languages, covering Hindi and Sanskrit, evaluated on tasks like NER, sentiment, and QA.[HIGH][^53][^52]
- IndicBERT (AI4Bharat) – multilingual ALBERT for 12 Indic languages; official documentation reports strong performance on classification tasks in Hindi and other languages.[HIGH][^54]
- AI4Bharat’s “Sangraha” dataset and Dhruva foundation models provide large‑scale Indic corpora and general foundation models for Indian languages, though specific Sanskrit coverage varies; formal peer‑reviewed evaluations are still emerging.[MEDIUM][^67][^68]

**Defensible takeaway:**

- You can ground your Hindi/Hinglish rule‑based components in the broad Hindi NLP literature and acknowledge that purely English‑trained sentence‑transformers may be suboptimal vs Indic models like MuRIL/IndicBERT for Hindi queries and Sanskrit‑adjacent vocabulary.[HIGH][^66][^52][^54]

***

## Block 4 – Known Weaknesses of Your Approaches

### 6(a) MYCIN CF limitations

- Shortliffe \& Buchanan’s own analysis plus later commentaries emphasize that CFs:
    - Are not coherent probabilities and can violate probability axioms.[HIGH][^39]
    - Assume independence among pieces of evidence and mutually exclusive hypotheses, which is rarely true in complex domains.[HIGH][^47]
    - Ignore prior probabilities and therefore cannot represent base‑rate effects.[HIGH][^48]
- Van der Gaag et al. show that MYCIN‑style CFs and Dempster‑Shafer can only function properly under strict exclusivity and independence assumptions; otherwise, they may produce misleading degrees of belief.[HIGH][^47]

**For your paper:** explicitly state CFs are heuristic, not probabilistic, and that doctrinal disagreements among commentaries might be better treated via probabilistic or evidence‑theoretic models.

### 6(b) all‑MiniLM‑L6‑v2 on Sanskrit

- The model is trained on English sentence‑pair datasets and is not claimed to support Sanskrit or Hindi.[HIGH][^51]
- Using it on transliterated Sanskrit/Hindi likely works only via lexical overlap with English translations and common religious terminology; performance on original Devanagari Sanskrit is likely weak.[LOW]
- DharmaBench results indicate that even large general LMs struggle on Sanskrit without targeted training.[HIGH][^21]

**Honest limitation:** your semantic retrieval for Sanskrit/Hindi queries is constrained by a non‑Indic embedding model; this is a legitimate, citable weakness.

### 6(c) Forward‑chaining rules

- The “brittleness” and knowledge‑engineering cost of rule‑based expert systems is a classic critique (e.g., Michalski et al., “Escaping brittleness: The possibilities of general‑purpose learning algorithms applied to parallel rule‑based systems,” in *Machine Learning: An Artificial Intelligence Approach*, 1983).[HIGH][^69]
- Rules do not generalize beyond encoded cases; maintenance becomes difficult as rule sets grow and interact in unanticipated ways.[HIGH][^69]


### 6(d) OWL 2 RL vs OWL 2 DL

- OWL 2 RL is designed to be implementable via forward‑chaining rules but forbids some constructs: e.g., transitive properties in number restrictions, complex role inclusions with cycles, certain forms of property chains.[HIGH][^70][^26][^24]
- Thus some inferences expressible in OWL 2 DL (e.g., full expressive cardinality reasoning combined with complex role chains) are not available in OWL 2 RL; O’Connor \& Das show RL’s expressivity vs DL in biomedical use cases.[HIGH][^27]


### 6(e) CSP with 7 hard constraints

- Timetabling literature shows that real timetables have dozens of hard constraints and many soft constraints; small constraint sets may over‑simplify the real scheduling problem and inflate performance gains vs naïve backtracking.[HIGH][^43][^44]
- With only 7 hard constraints, your 93.6% backtracking reduction is meaningful **only for your toy problem**; you should avoid extrapolating to more complex real‑world study planning.[MEDIUM]


### 6(f) MAP@5 for spiritual text retrieval

- IR literature emphasizes that MAP/MRR only measure ranked relevance vs a gold set; they do not account for deeper semantic appropriateness, diversity, or pedagogical value.[HIGH][^59]
- Recent RAG work shows that MAP/nDCG are often poor predictors of downstream answer quality.[HIGH][^23]

**For limitations section:** clearly state that MAP@5 is an intrinsic retrieval metric, not a holistic measure of the quality of spiritual guidance.

***

## Block 5 – Realistic Evaluation Without GPU or Full User Study

### 7(a) Ablation studies

- RAG and neural‑symbolic papers often perform ablations by removing components (retriever, KG, rules) and measuring drop in metrics (EM, F1, MAP, human scores).[HIGH][^35][^57][^55]
- Lewis et al. (RAG) and Karpukhin et al. (DPR) both present such ablations.[HIGH][^57][^55]

**For you:** you can:

- Evaluate verse retrieval with and without ontology filtering, without expert rules, without CF weighting. [HIGH]
- Use CPU‑only retrieval and scoring; no GPU required. [HIGH]


### 7(b) Ontology evaluation via competency questions and reasoners

- Fox \& Grüninger, “Ontologies and Enterprise Modelling” (1997) introduce competency questions (CQs) as a way to define ontology requirements.[HIGH][^71]
- A recent survey, “Use of Competency Questions in Ontology Engineering: A Survey” (*LNCS*, 2023), summarizes methods for CQ design and coverage measurement.[HIGH][^72]
- HermiT and Pellet papers describe using OWL reasoners to test ontology consistency and derive inferred class hierarchies.[HIGH][^73][^74][^75]

**For you:**

- Use your 8 SPARQL CQs as intrinsic tests: report percentage answerable before/after ontology refinements.[HIGH]
- Run HermiT/Pellet in Protégé on your ontology to check for unsatisfiable classes and logically redundant axioms, which is entirely CPU‑feasible.[HIGH][^75][^73]


### 7(c) Comparison vs keyword baselines (Vedabase, Gita Supersite)

- Religious text QA work often compares neural/semantic methods against keyword or BM25 baselines.[HIGH][^19][^16][^18]
- You can:
    - Create a small query set (e.g., 50 questions) with manually labeled relevant verses. [MEDIUM]
    - Run keyword search via public sites (Vedabase, Gita Supersite IITK) or a local BM25 index and compare MAP@k and recall vs your semantic RAG.[HIGH]


### 7(d) Small expert evaluation

- Quran and Hadith QA datasets have been annotated by relatively small numbers of religious experts (e.g., a handful of scholars labeling relatedness between verse–Hadith pairs).[HIGH][^76]
- Mental‑health Gita+LLM work (“Spiritual‑LLM: Gita Inspired Mental Health Therapy,” arXiv:2506.19185) uses human ratings of response quality and spiritual alignment, not massive crowdsourced studies.[HIGH][^77]

**Thus:** having 2–3 Gita scholars rate 20–30 system answers (e.g., on faithfulness, appropriateness, helpfulness) is **publishable** if framed as a pilot expert evaluation and if you describe inter‑annotator agreement, etc.[MEDIUM]

### 7(e) Self‑evaluation using CF as confidence

- Using MYCIN CFs directly as a calibrated confidence measure is **not** theoretically sound, given their non‑probabilistic nature and known limitations.[HIGH][^39][^47]
- However, CFs can be used descriptively as internal *priority scores* (e.g., “this recommendation is more strongly supported by Advaita than Dvaita”), not as a metric of correctness.[HIGH][^48]

**Methodological stance:**

- Do **not** claim CFs are a rigorous evaluation metric; at most, you may visualize distribution of CFs across outputs and note qualitative correlations with expert judgments.[MEDIUM]

***

## 8 – Benchmarks

- I did not find any established benchmark specifically for *Sanskrit/Vedic text retrieval* analogous to SQuAD or MS MARCO.[LOW]
- Religious QA benchmarks:
    - Qur’an QA shared tasks provide benchmark datasets and evaluation scripts for passage retrieval and QA.[HIGH][^17][^15][^76]
    - BibleQA (Park et al.) is a benchmark for answer sentence selection on Bible trivia questions.[HIGH][^19]
    - DharmaBench is a multi‑task benchmark for Buddhist Sanskrit/Tibetan texts but focuses on classification/detection rather than retrieval.[HIGH][^21]

**Therefore:** your evaluation will likely rely on a custom gold set of queries and relevant verses, following the methodology of previous religious QA work (manual creation + expert labeling).[HIGH][^17][^19]

***

## Block 5 – Positioning and Venues

### 9(a–f) Realistic venues

**ISWC (International Semantic Web Conference).**

- ISWC has a Research track, a Resources track, and an In‑Use track for applied semantic web/knowledge graph systems.[HIGH][^78]
- Average acceptance rate ~24%; CORE A‑rank.[HIGH][^79]
- Your system fits best in the *In‑Use* or *Resources* track as a knowledge‑graph‑centric application to religious text; reviewers will expect clear evidence of real use or strong evaluation. [MEDIUM]

**SIGIR / WWW (The Web Conference).**

- SIGIR main track acceptance rate ~20%.[HIGH][^80][^81]
- WWW (The Web Conference) main acceptance rate ~14–17%.[HIGH][^82][^83]
- These venues are highly competitive and emphasize strong IR or web contributions; with one month and limited user study, they are **ambitious** but a short/demo paper might be feasible if a call exists. [LOW]

**ACM JOCCH (Journal on Computing and Cultural Heritage).**

- Scope: ICT for cultural heritage, including ontologies, semantic processing, and knowledge graphs for cultural materials.[HIGH][^84]
- JOCCH is suitable for extended system/application papers on AI + cultural/religious heritage, with more flexible timelines and emphasis on methodological rigor over raw novelty.[HIGH][^84]

**Other journals.**

- *Knowledge‑Based Systems* and similar applied AI journals accept systems papers with knowledge‑based reasoning and RAG as long as evaluation is convincing.[MEDIUM][^85]

**Indian / regional venues.**

- ICON (International Conference on Natural Language Processing, India) has explicit interest in Indic NLP, including Sanskrit.[HIGH][^86]
- ISCLS (International Sanskrit Computational Linguistics Symposium) focuses on computational Sanskrit and digital humanities; your work would align well, especially with emphasis on ontology and KG for Gita.[HIGH][^87][^88]

**ACL‑style system demo tracks.**

- NAACL/ACL system demonstration tracks accept prototypes with interesting functionality, including non‑English systems, evaluated with smaller‑scale studies.[HIGH][^89]
- If a demo track deadline fits your 3‑month window, a GitaGraph demo paper focusing on system design and a modest evaluation is realistic. [MEDIUM]

**arXiv.**

- Posting a preprint on arXiv (cs.AI or cs.CL) is standard and helpful for visibility, especially for niche topics like AI + Sanskrit; this is low‑risk and recommended.[HIGH]

**Overall practical suggestion:**

- Short term (1–3 months): target ISCLS, ICON, or an ACL/NAACL demo track, plus an arXiv preprint.[HIGH][^87][^86][^89]
- Medium term: extend to a full journal article (e.g., JOCCH or Knowledge‑Based Systems) once you have richer evaluation. [MEDIUM]

***

## 10 – Closest Published Systems to GitaGraph

Given the current literature, the most similar systems are *cross‑domain*:

1. **Al‑Bayan: Arabic QA for Qur’an** – Heba Abdelnasser et al., EMNLP ANLP 2014.[HIGH][^15]
    - Novelty: end‑to‑end Arabic QA over Qur’an using IR + NLP.[HIGH]
    - Evaluation: standard QA metrics (accuracy, MRR) on a custom dataset; no user study.[HIGH][^15]
    - Limitations: handling polysemy, needing deeper semantics. [MEDIUM]
2. **Qur’an QA shared tasks** – Altammami \& Atwell, LREC/ArabicNLP shared tasks 2022/2023.[HIGH][^76][^17]
    - Novelty: benchmark dataset and shared‑task setup for Qur’an QA and retrieval.
    - Evaluation: MAP/MRR/nDCG for retrieval; F1/EM for QA; no large user study; evaluation via test sets. [HIGH]
3. **BibleQA** – Park et al., “Domain Adaptation for Neural Networks in Biblical QA,” 2018.[HIGH][^19]
    - Novelty: domain adaptation from SQuAD to Bible domain using answer sentence selection.
    - Evaluation: accuracy/F1 on ~1–2k QA pairs; no user study; limitations about interpretive nuances acknowledged.[HIGH][^19]
4. **Semantic enrichment of Hadith via KG** – Semantic Web Journal paper “Semantic Enrichment of Hadith Corpus – Knowledge Graph Generation from Islamic Text”.[HIGH][^3]
    - Novelty: ontology + KG extraction pipeline for Hadith; emphasis on semantic modeling and retrieval.
    - Evaluation: intrinsic KG quality (coverage, correctness) and simple retrieval; no massive user study.[HIGH][^3]
5. **Cultural‑heritage KG + DL** – Dou et al., “Using knowledge graphs and deep learning algorithms to enhance digital cultural heritage management”, *Heritage Science* 2023.[HIGH][^30]
    - Novelty: KG + deep learning for cultural heritage management; focus on ontology and retrieval framework.
    - Evaluation: case study on ceramic data with precision/recall; limitations on generalization acknowledged.[HIGH][^30]

**Common patterns:**

- Most systems rely on intrinsic metrics (MAP/MRR, accuracy, F1) on modestly sized datasets (hundreds to a few thousand questions).[HIGH][^17][^19]
- User/expert studies, when present, are small and qualitative. [MEDIUM]
- Reviewers accept such systems when: (i) the domain is novel (religious/cultural heritage), (ii) the pipeline is clearly described and motivated, and (iii) limitations are honestly discussed. [HIGH]

***

## Block 6 – Broader Impact and “Why This Matters”

### 11 – AI, mental health, and ancient wisdom

- “Spiritual‑LLM: Gita Inspired Mental Health Therapy in the Era of LLMs” (arXiv:2506.19185, 2025) proposes a GPT‑4o‑based counseling assistant grounded in Bhagavad Gita verses; they create a GITes dataset and argue that spiritual frameworks aid meaning‑making and emotion regulation.[HIGH][^77]
- UNESCO’s AI \& Culture report explicitly calls for AI to support preservation and access to spiritual and cultural heritage, including digital access to religious texts.[HIGH][^31]
- ERCIM’s “AI for Cultural Heritage” special theme (2025) showcases AI‑driven conversational agents and knowledge graphs for museums and cultural narratives, highlighting public engagement and well‑being as key motivations.[HIGH][^90]

**Defensible narrative:**

- There is growing research interest in AI systems that integrate ancient wisdom with mental‑health‑oriented dialogue and cultural heritage preservation; your system contributes to this by enabling structured, explainable exploration of Gita concepts rather than black‑box chat.[HIGH][^90][^77][^30]

***

## 12 – High‑Impact Improvements in 1 Month (No GPU, Limited Users)

Ranked roughly by “impact on novelty × effort”:

1. **Add strong retrieval baselines + ablation (HIGH impact, LOW–MED effort).**
    - Implement BM25 keyword search and, if feasible, a MuRIL or IndicBERT‑based embedding baseline on CPU.[HIGH][^52][^54]
    - Run ablations: with/without ontology filters, with/without expert rules, with/without CF weighting; report MAP@k and recall changes.[HIGH][^55][^57]
2. **Design and execute a small, well‑documented expert evaluation (HIGH impact, MED effort).**
    - Recruit 2–3 Gita scholars to rate ~20–30 system answers on faithfulness, helpfulness, and doctrinal balance; compute inter‑annotator agreement.[MEDIUM][^77][^76]
3. **Strengthen ontology evaluation (MED–HIGH impact, MED effort).**
    - Formalize 10–20 competency questions; measure coverage.[HIGH][^71][^72]
    - Run HermiT/Pellet for consistency and classify inferred hierarchies; document any modeling issues found.[HIGH][^73][^75]
4. **Improve multilingual coverage in retrieval + keywords (MED impact, LOW effort).**
    - Expand Hindi/Sanskrit keyword lists using Sanskrit WordNet and Hindi lexical resources.[HIGH][^62][^66]
    - Add transliteration handling and simple morphological normalization for Hindi/Sanskrit tokens.[MEDIUM]
5. **Clarify and slightly refine the uncertainty module (MED impact, LOW–MED effort).**
    - Make CFs explicitly per‑tradition (Advaita, Vishishtadvaita, Dvaita) and visualize them in outputs; clearly mark them as heuristic degrees of support.[HIGH][^39][^47]
6. **Add a couple more SPARQL competency queries (LOW–MED impact, LOW effort).**
    - Add queries that traverse your “downfall chain” and four‑yoga paths, demonstrating reasoning over property chains.[HIGH][^28]

Given your constraints, **(1) and (2)** will likely have the biggest impact on perceived rigor.

***

## 13 – Final Requested Items

### 13(a) Honest, specific, defensible novelty claim

A defensible claim (not a slogan) could be:

> “GitaGraph is, to our knowledge, the first integrated hybrid neural–symbolic system for the Bhagavad Gita that combines an OWL 2 ontology of Vedantic concepts, rule‑based expert reasoning with MYCIN‑style certainty factors, CSP‑based personalized verse‑study planning, and retrieval‑augmented generation over all 701 verses, with a quantitative evaluation of both symbolic components (CSP backtracking, ontology competency questions) and semantic retrieval (MAP@5) against keyword and embedding baselines.” [HIGH]

This explicitly **does not** claim first‑ever KG, RAG, or chatbot for the Gita, only the specific integration and evaluation.

### 13(b) 250‑word technically honest abstract (draft)

> We present GitaGraph, a hybrid neural–symbolic system for structured exploration of the Bhagavad Gita. The system combines an OWL 2 ontology of key Vedantic concepts—such as the three gunas, four yoga paths, and doctrinal “downfall” chains—with a knowledge graph of inter‑verse relationships and a small forward‑chaining expert system for classifying user queries. On the symbolic side, GitaGraph uses OWL reasoning and SPARQL competency questions to validate the ontology, graph‑search algorithms (BFS, DFS, iterative deepening, A*) to compute conceptual paths between states such as vairāgya and mokṣa, and a constraint‑satisfaction planner with MRV and forward checking to construct five‑session personalized verse‑study plans. On the neural side, the system employs off‑the‑shelf sentence‑transformer embeddings (all‑MiniLM‑L6‑v2) for semantic retrieval over 701 verses and a local LLM to generate bilingual (English/Hindi) explanations grounded in retrieved verses. We report intrinsic evaluations of the CSP planner, showing a 93.6% reduction in backtracks compared to naïve backtracking on a seven‑constraint study‑planning task, and of semantic retrieval, achieving MAP@5 = 0.837 on a small gold‑standard query set. We further compare GitaGraph against keyword‑based baselines and conduct a preliminary expert assessment of answer faithfulness and doctrinal balance. We discuss methodological limitations, including the use of English‑centric embeddings for Sanskrit/Hindi queries and heuristic certainty factors for modeling cross‑tradition interpretations, and outline directions for more principled probabilistic modeling and larger‑scale user studies.

(You should adjust numbers/claims to exactly match your implemented experiments.)

### 13(c) Suggested paper title

- **“GitaGraph: A Hybrid Neural–Symbolic System for Exploring the Bhagavad Gita”**
- Alternative, more application‑focused: **“GitaGraph: Ontology‑Driven Semantic Retrieval and Study Planning for the Bhagavad Gita”**

Both are specific, searchable, and avoid overclaiming.

### 13(d) Single most important addition in 2 weeks

The **single most impactful addition** is:

> **Add strong retrieval baselines (BM25 and one Indic embedding model) plus a small, clearly documented ablation study on your retrieval and reasoning pipeline.** [HIGH]

Concretely:

- Build a BM25 baseline and, if possible, a MuRIL/IndicBERT‑based embedding index on CPU.[HIGH][^54][^52]
- Construct a 50–100 query gold set with manually labeled relevant verses.
- Report MAP@k and recall for: keyword, all‑MiniLM, Indic model, and your full pipeline with ontology filters and rules.
- Include 2–3 simple ablations (no ontology, no rules, no CSP personalization) and show performance deltas.

This directly addresses reviewers’ expectations for baselines and ablations and is feasible without GPU or large user studies.

### 13(e) Overclaims to avoid

You should **not** claim:

- That GitaGraph is the first AI system or the first RAG/chatbot for the Bhagavad Gita (graphGita and multiple RAG bots exist).[HIGH][^4][^5][^1]
- That your ontology is a complete or authoritative formalization of Vedanta, Yoga, or Gita doctrine; at best it is a focused, partial ontology for selected concepts.[MEDIUM][^60]
- That MAP@5 = 0.837 implies superior spiritual guidance or user satisfaction; it is an intrinsic retrieval metric only.[HIGH][^23]
- That MYCIN certainty factors provide calibrated probabilities or theoretically sound measures of doctrinal truth; they are heuristic support values.[HIGH][^47][^39]
- That your seven‑constraint CSP planner scales to realistic educational scheduling without further validation.[MEDIUM][^45][^43]
- That `all-MiniLM-L6-v2` is well‑validated for Sanskrit/Hindi; you should explicitly flag it as an English‑centric model used due to resource constraints.[HIGH][^51][^52]

If you keep the claims narrowly focused on *integration*, *methodological honesty*, and *careful evaluation under constraints*, your paper will be both intellectually honest and defensible.
<span style="display:none">[^100][^101][^102][^103][^104][^105][^106][^107][^108][^109][^110][^111][^112][^113][^114][^115][^116][^117][^118][^119][^120][^121][^122][^123][^124][^125][^126][^127][^128][^129][^130][^131][^132][^133][^134][^135][^136][^137][^138][^139][^91][^92][^93][^94][^95][^96][^97][^98][^99]</span>

<div align="center">⁂</div>

[^1]: https://github.com/bhaskatripathi/graphGita

[^2]: https://arxiv.org/html/2503.16581v1

[^3]: https://www.semantic-web-journal.net/content/semantic-enrichment-hadith-corpus-knowledge-graph-generation-islamic-text

[^4]: https://www.linkedin.com/posts/thejakunuthuru_technical-project-manager-activity-7445756231010480128-lz-P

[^5]: https://news.ycombinator.com/item?id=46179344

[^6]: https://www.youtube.com/watch?v=EGoWIhBVSFI

[^7]: https://www.scribd.com/document/976296573/Gita-Paper-Final

[^8]: https://arxiv.org/pdf/2201.03115.pdf

[^9]: https://www.wseas.us/e-library/transactions/information/2009/32-804.pdf

[^10]: https://hrishikeshrt.github.io/publication/phd/thesis.pdf

[^11]: https://ijcaonline.org/archives/volume187/number62/gujarati-2025-ijca-926025.pdf

[^12]: https://www.ijcaonline.org/archives/volume187/number62/gujarati-2025-ijca-926025.pdf

[^13]: https://www.academia.edu/35009790/Krsna_in_the_Bhagavad_gita_A_Beginning_Ontology

[^14]: https://www.bvmlu.org/SBSST/tvimao.html

[^15]: https://aclanthology.org/W14-3607/

[^16]: https://iajit.org/upload/files/Embedding-Search-for-Quranic-Texts-based-on-Large-Language-Models.pdf

[^17]: https://aclanthology.org/2023.arabicnlp-1.76/

[^18]: https://arxiv.org/abs/2412.11431

[^19]: https://arxiv.org/abs/1810.12118

[^20]: https://digitalcommons.kennesaw.edu/cgi/viewcontent.cgi?article=1755\&context=cday

[^21]: https://aclanthology.org/2025.ijcnlp-long.114.pdf

[^22]: http://www.lrec-conf.org/proceedings/lrec2012/workshops/09.Lre-Rel Proceedings.pdf

[^23]: https://arxiv.org/html/2510.21440v1

[^24]: https://www.w3.org/TR/owl2-overview/

[^25]: https://www.w3.org/OWL/

[^26]: https://www.mimuw.edu.pl/~nguyen/owl2rl-long.pdf

[^27]: https://ceur-ws.org/Vol-849/paper_31.pdf

[^28]: https://www.w3.org/TR/owl2-primer/

[^29]: https://www.w3.org/TR/2009/WD-owl2-primer-20090611/all.pdf

[^30]: https://www.nature.com/articles/s40494-023-01042-y

[^31]: https://www.unesco.org/sites/default/files/medias/fichiers/2025/09/CULTAI_Report%20of%20the%20Independent%20Expert%20Group%20on%20Artificial%20Intelligence%20and%20Culture%20(final%20online%20version)%201.pdf

[^32]: https://www.semanticscholar.org/paper/A-Formal-Basis-for-the-Heuristic-Determination-of-Hart-Nilsson/221aa3be55a4ead8fc2aa83b12aac370bfba72f5

[^33]: https://pdxscholar.library.pdx.edu/cgi/viewcontent.cgi?filename=0\&article=1026\&context=reu_reports\&type=additional

[^34]: https://sites.google.com/view/socs18/a-is-born

[^35]: https://arxiv.org/html/2405.03524v3

[^36]: https://www.periodicos.capes.gov.br/index.php/acervo/buscador.html?task=detalhes\&id=W188378287

[^37]: https://www.shortliffe.net/Buchanan-Shortliffe-1984/Chapter-12.pdf

[^38]: https://cir.nii.ac.jp/crid/1130013000022837276

[^39]: https://people.dbmi.columbia.edu/~ehs7001/Buchanan-Shortliffe-1984/Chapter-12.pdf

[^40]: https://en.wikipedia.org/wiki/Conflict_resolution_strategy

[^41]: https://koreascience.kr/article/JAKO201127250030672.page

[^42]: https://www.academia.edu/4316669/Increasing_Tree_Search_Efficiency_for_Constraint_Satisfaction_Problems

[^43]: https://people.cs.nott.ac.uk/pszrq/files/Exam_Review.pdf

[^44]: https://www.jstor.org/stable/3010748

[^45]: https://meacse.org/ijcar/archives/59.pdf

[^46]: https://seoyeongpark.github.io/projects/courseschedulingcsp/

[^47]: https://pubmed.ncbi.nlm.nih.gov/2064715/

[^48]: https://www.sciencedirect.com/topics/computer-science/certainty-factor

[^49]: https://arxiv.org/abs/1908.10084

[^50]: https://aclanthology.org/D19-1410.pdf

[^51]: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

[^52]: https://arxiv.org/abs/2103.10730

[^53]: https://arxiv.org/pdf/2103.10730.pdf

[^54]: https://indicnlp.ai4bharat.org/pages/indic-bert/

[^55]: https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html

[^56]: https://proceedings.neurips.cc/paper/2020/file/6b493230205f780e1bc26945df7481e5-Paper.pdf

[^57]: https://arxiv.org/abs/2004.04906

[^58]: https://aclanthology.org/2020.emnlp-main.550/

[^59]: https://www.evidentlyai.com/ranking-metrics/mean-reciprocal-rank-mrr

[^60]: https://dl.acm.org/doi/abs/10.1145/3729530

[^61]: https://aclanthology.org/C12-1062.pdf

[^62]: https://www.cse.iitb.ac.in/~pb/papers/gwc2010-swn.pdf

[^63]: http://www.sanskrit-linguistics.org/dcs/index.php?contents=impressum

[^64]: https://www.cfilt.iitb.ac.in/iitb_parallel/

[^65]: https://aclanthology.org/2020.icon-main.30/

[^66]: https://arxiv.org/pdf/2102.00214.pdf

[^67]: https://huggingface.co/datasets/ai4bharat/sangraha/blob/7a02591c8617c2b7e69278480ac0da7b4e52be87/README.md

[^68]: https://models.ai4bharat.org

[^69]: https://www.sciencedirect.com/science/chapter/bookseries/pii/B9780444871374500291

[^70]: https://stackoverflow.com/questions/3346396/in-semantic-web-are-owl-el-rl-ql-all-instances-of-dl-what-is-the-difference

[^71]: http://www.eil.utoronto.ca/wp-content/uploads/enterprise-modelling/papers/fox-eimt97.pdf

[^72]: https://dl.acm.org/doi/10.1007/978-3-031-47262-6_3

[^73]: http://inf.ufsc.br/~gauthier/EGC6006/material/Aula 6/Pellet A practical OWL-DL reasoner.pdf

[^74]: https://ceur-ws.org/Vol-858/ore2012_paper13.pdf

[^75]: http://www.cs.ox.ac.uk/people/boris.motik/pubs/ghmsw14HermiT.pdf

[^76]: https://aclanthology.org/2022.lrec-1.157.pdf

[^77]: https://arxiv.org/html/2506.19185v1

[^78]: https://iswc2022.semanticweb.org/index.php/in-use-track/index.html

[^79]: https://www.openresearch.org/wiki/ISWC

[^80]: https://openaccept.org/c/dm/sigir/2023/

[^81]: https://openaccept.org/c/dm/sigir/

[^82]: https://dl.acm.org/doi/proceedings/10.1145/3543507

[^83]: https://openaccept.org/c/new/www/2023/

[^84]: https://dl.acm.org/journal/jocch/about

[^85]: https://www.sciencedirect.com/journal/knowledge-based-systems

[^86]: https://au-kbc.org/icon2024/

[^87]: https://www.aclweb.org/portal/content/7th-international-sanskrit-computational-linguistics-symposium-7th-iscls

[^88]: https://iscls.github.io

[^89]: https://naacl.org/naacl-hlt-2019/calls/demos/

[^90]: https://ercim-news.ercim.eu/en141/special/ai-for-cultural-heritage-introduction-to-the-special-theme

[^91]: https://en.wikipedia.org/wiki/Bhagavad_Gita

[^92]: https://research.ibm.com/blog/ai-neurosymbolic-common-sense

[^93]: https://aclanthology.org/2023.acl-demo.10.pdf

[^94]: https://latenode.com/blog/ai-frameworks-technical-infrastructure/rag-retrieval-augmented-generation/rag-lewis-2020-paper-understanding-original-retrieval-augmented-generation-research

[^95]: https://nrhan.tistory.com/entry/Reimers-Nils-and-Iryna-Gurevych-Sentence-bert-Sentence-embeddings-using-siamese-bert-networks-arXiv-preprint-arXiv190810084-2019

[^96]: https://iep.utm.edu/bhagavad-gita/

[^97]: https://www.linkedin.com/posts/abhixw_ai-langgraph-rag-activity-7417231628739207168-Pynn

[^98]: https://bhagavadgita.com/gitagpt

[^99]: https://github.com/mcrao/arxiv-research-paper-semantic-search-engine

[^100]: https://incarnateword.in/sabcl/13/sankhya-yoga-and-vedanta

[^101]: https://www.w3.org/TR/owl2-rdf-based-semantics/

[^102]: https://www.scribd.com/document/538126855/Ontology-In-Hinduism

[^103]: https://stackoverflow.com/questions/76688826/knowledge-graph-vs-ontology-vs-rdf-graph

[^104]: https://www.linkedin.com/pulse/building-ai-powered-bhagavad-gita-chatbot-bridging-wisdom-goswami-k0kjc

[^105]: https://arxiv.org/abs/2201.03115

[^106]: https://www.youtube.com/watch?v=zIJAGl5dNpA

[^107]: https://en.wikipedia.org/wiki/Web_Ontology_Language

[^108]: https://stacks.stanford.edu/file/druid:ts764ph5106/ts764ph5106.pdf

[^109]: https://www.geeksforgeeks.org/machine-learning/ml-dempster-shafer-theory/

[^110]: https://dl.acm.org/doi/abs/10.1016/j.websem.2007.03.004

[^111]: https://www.sciencedirect.com/science/article/abs/pii/S0957417409002851

[^112]: https://huggingface.co/ai4bharat/indic-bert

[^113]: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2

[^114]: https://www.academia.edu/50841551/NATURAL_LANGUAGE_PROCESSING_AND_SANSKRIT

[^115]: https://dl.acm.org/doi/abs/10.1145/3548457

[^116]: https://yogaeducation.org/understanding-the-four-paths-of-yoga/

[^117]: https://www.youtube.com/watch?v=0bv3WaHq4ME

[^118]: https://www.linkedin.com/posts/sourasish-mukherjee-103626322_building-a-rag-pipeline-with-gita-pdf-activity-7412873072501977088-DLRJ

[^119]: https://www.w3.org/TR/owl2-mapping-to-rdf/

[^120]: https://enrouteindianhistory.com/how-is-owl-viewed-in-indian-mythology/

[^121]: https://www.scribd.com/presentation/6850884/chapter3uncertainty1

[^122]: https://arxiv.org/abs/2409.09844

[^123]: https://www.studocu.com/row/document/danshgah-thran/computer-science/title-expert-system-assignment-cf-vs-bayesian-theory-comparison/142245347

[^124]: https://www.youtube.com/watch?v=RN9m7VvGz7s

[^125]: https://twimbit.com/about/blogs/the-state-of-cx-india-2025-advisory-council

[^126]: https://philarchive.org/archive/AKKTTR

[^127]: https://arxiv.org/abs/2511.10354

[^128]: https://www.ijcstjournal.org/volume-11/issue-4/IJCST-V11I4P14.pdf

[^129]: https://iskcondesiretree.com/profiles/blogs/rebirth-according-to-the-bhagavad-gita-epistemology-ontology-and-

[^130]: https://openaccept.org/c/ai/ijcai/

[^131]: https://arxiv.org/abs/2404.07981

[^132]: https://icict.co.in

[^133]: https://iswc.net/acceptance_statistics/

[^134]: https://www.ijfmr.com/research-paper.php?id=68608

[^135]: https://vedantastudents.com/summary-of-bhagavad-gita-18-chapters/

[^136]: https://www.csc.liv.ac.uk/~frank/teaching/comp08/lecture6.pdf

[^137]: https://ontology.nps.edu/sigma/WordNet.jsp?word=Arjuna\&POS=1\&kb=SUMO\&synset=09486781

[^138]: https://vijaykumarnvs.blogspot.com/2025/08/semantic-network-knowedge-representation.html

[^139]: https://bhagavad.substack.com/p/summary-of-all-18-chapters-of-the

