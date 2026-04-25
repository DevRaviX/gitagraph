"""
expert_system.py — Digital Bhaṣya  Module 4
Production Rule Expert System + SPARQL Queries.

Implements:
  ExpertSystem class with forward-chaining rule engine
  SPARQL_QUERIES: dict of all 8 Competency Question queries
  run_all_cqs(kg): run all 8 CQs and return results
"""

from dataclasses import dataclass, field
from typing import Any
from modules.knowledge_graph import GitaKnowledgeGraph


# ─────────────────────────────────────────────────────────────────────────────
# Working Memory  (reader's stated profile)
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class WorkingMemory:
    concern: str = ""
    goal: str = ""
    stage: str = ""           # 'beginner', 'intermediate', 'advanced'
    tradition: str = ""       # 'advaita', 'vishishtadvaita', 'dvaita'
    already_read: list = field(default_factory=list)
    nature: str = ""          # 'active', 'contemplative', 'devotional'
    # Inferred by rules:
    recommend_concept: str = ""
    recommend_chapter: str = ""
    start_verse: str = ""
    fired_rules: list = field(default_factory=list)
    confidence: float = 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Production Rules
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Rule:
    name: str
    description: str
    specificity: int          # higher = fires first when multiple rules match
    cf: float                 # certainty factor
    condition: Any            # callable: WorkingMemory → bool
    action: Any               # callable: WorkingMemory → None


PRODUCTION_RULES = [
    Rule(
        name="R1_AnxietyResults",
        description="Reader anxious about results → recommend Nishkama Karma",
        specificity=1, cf=0.92,
        condition=lambda wm: (
            any(k in wm.concern.lower() for k in [
                # English
                "anxiety", "anxious", "result", "outcome", "fruit", "worry",
                # Hindi / Hinglish
                "chinta", "tension", "pareshaan", "pareshan", "phal", "nateeja",
                "darr", "डर", "चिंता", "परेशान", "फल", "nischint",
            ])
        ),
        action=lambda wm: setattr(wm, "recommend_concept", "NishkamaKarma"),
    ),
    Rule(
        name="R2_PeaceEquanimity",
        description="Reader seeks peace/equanimity → recommend Sthitaprajna",
        specificity=1, cf=0.85,
        condition=lambda wm: (
            any(k in wm.goal.lower() for k in [
                # English
                "peace", "equanimity", "calm", "tranquil", "stillness", "steady",
                # Hindi / Hinglish
                "shanti", "sukoon", "sukun", "chain", "shaanti", "स्थिरता",
                "शांति", "सुकून", "aaram", "sthirta",
            ])
        ),
        action=lambda wm: setattr(wm, "recommend_concept", "Sthitaprajna"),
    ),
    Rule(
        name="R3_BeginnerNishkama",
        description="Beginner + Nishkama Karma → start with Verse_2_47 (most specific)",
        specificity=3, cf=0.95,
        condition=lambda wm: (
            wm.stage.lower() == "beginner" and wm.recommend_concept == "NishkamaKarma"
        ),
        action=lambda wm: (
            setattr(wm, "start_verse", "Verse_2_47"),
            setattr(wm, "confidence", 0.95)
        ),
    ),
    Rule(
        name="R4_AngerDesire",
        description="Reader deals with anger/desire → recommend Kama/Krodha chain",
        specificity=2, cf=0.90,
        condition=lambda wm: (
            any(k in wm.concern.lower() for k in [
                # English
                "anger", "desire", "lust", "rage", "craving",
                # Hindi / Hinglish
                "gussa", "krodh", "kaam", "ichha", "lobh", "lalach",
                "क्रोध", "गुस्सा", "इच्छा", "काम", "naaraaz", "naraaz",
            ])
        ),
        action=lambda wm: (
            setattr(wm, "recommend_concept", "Kama"),
            setattr(wm, "start_verse", "Verse_2_62")
        ),
    ),
    Rule(
        name="R5_MeditationFocus",
        description="Reader wants meditation → recommend Chapter 6, start Verse_6_10",
        specificity=2, cf=0.95,
        condition=lambda wm: (
            any(k in (wm.goal + wm.concern).lower()
                for k in [
                    # English
                    "meditat", "focus", "mind", "dhyana", "concentration", "restless",
                    # Hindi / Hinglish
                    "dhyan", "mann", "man", "ekagr", "chanchal", "chanchalta",
                    "ध्यान", "मन", "एकाग्र", "restlessness", "mann nahi lagta",
                ])
        ),
        action=lambda wm: (
            setattr(wm, "recommend_chapter", "Chapter_6"),
            setattr(wm, "recommend_concept", "DhyanaYoga_inst"),
            setattr(wm, "start_verse", "Verse_6_10"),
            setattr(wm, "confidence", 0.92)
        ),
    ),
    Rule(
        name="R6_DutyConfusion",
        description="Reader confused about duty → recommend Svadharma, Verse_3_35",
        specificity=2, cf=0.88,
        condition=lambda wm: (
            any(k in (wm.goal + wm.concern).lower()
                for k in [
                    # English
                    "duty", "dharma", "svadharma", "confused", "renounce", "action or",
                    # Hindi / Hinglish
                    "kartavya", "farz", "confusion", "samajh nahi", "kya karu",
                    "kya karoon", "tyag", "karm", "karma karna",
                    "कर्तव्य", "फर्ज", "त्याग", "धर्म",
                ])
        ),
        action=lambda wm: (
            setattr(wm, "recommend_concept", "Svadharma"),
            setattr(wm, "start_verse", "Verse_3_35")
        ),
    ),
    Rule(
        name="R7_ContemplativeJnana",
        description="Contemplative reader + Chapter 3 processed → recommend Jnana Yoga",
        specificity=3, cf=0.82,
        condition=lambda wm: (
            wm.nature.lower() == "contemplative" and
            "Verse_3_3" in wm.already_read
        ),
        action=lambda wm: (
            setattr(wm, "recommend_concept", "JnanaYoga_inst"),
        ),
    ),
    Rule(
        name="R8_AdvancedMoksha",
        description="Advanced reader → trace full progression to Moksha via A*",
        specificity=2, cf=0.88,
        condition=lambda wm: (
            wm.stage.lower() == "advanced" and
            any(k in wm.goal.lower() for k in [
                # English
                "liberation", "moksha", "ultimate", "self",
                # Hindi / Hinglish
                "mukti", "moksh", "aatma", "gyan", "gyaan", "atma gyan",
                "मोक्ष", "मुक्ति", "आत्मज्ञान",
            ])
        ),
        action=lambda wm: (
            setattr(wm, "recommend_concept", "Moksha"),
            setattr(wm, "start_verse", "Verse_6_47")
        ),
    ),
    Rule(
        name="R9_GriefSorrow",
        description="Reader experiencing grief/sorrow → recommend Atma Jnana, Verse_2_20",
        specificity=2, cf=0.87,
        condition=lambda wm: (
            any(k in (wm.goal + wm.concern).lower()
                for k in [
                    # English
                    "grief", "sorrow", "sad", "loss", "death", "mourn",
                    # Hindi / Hinglish
                    "dukh", "dard", "dukhi", "udaas", "udaseen", "shok",
                    "rona", "aansu", "dukh hua", "takleef",
                    "दुख", "दर्द", "उदास", "शोक",
                ])
        ),
        action=lambda wm: (
            setattr(wm, "recommend_concept", "AtmaJnana"),
            setattr(wm, "start_verse", "Verse_2_20")
        ),
    ),
]


# ─────────────────────────────────────────────────────────────────────────────
# Expert System  (Forward-Chaining)
# ─────────────────────────────────────────────────────────────────────────────

class ExpertSystem:
    """
    Forward-chaining production rule engine.
    Conflict resolution: by SPECIFICITY (most specific rule fires first).
    Continues until no new rule fires (fixpoint).
    """

    def __init__(self, kg: GitaKnowledgeGraph):
        self.kg = kg
        self.rules = sorted(PRODUCTION_RULES, key=lambda r: -r.specificity)

    def infer(self, concern: str = "", goal: str = "",
              stage: str = "beginner", tradition: str = "",
              already_read: list = None, nature: str = "active") -> dict:
        """
        Run the forward-chaining inference on the given reader profile.
        Returns the final WorkingMemory + recommended verses.
        """
        wm = WorkingMemory(
            concern=concern, goal=goal, stage=stage,
            tradition=tradition,
            already_read=already_read or [],
            nature=nature,
        )

        # Forward chaining: repeat until fixpoint
        changed = True
        iteration = 0
        while changed and iteration < 10:
            changed = False
            iteration += 1
            for rule in self.rules:
                if rule.name not in wm.fired_rules:
                    try:
                        if rule.condition(wm):
                            rule.action(wm)
                            wm.fired_rules.append(rule.name)
                            if not wm.confidence:
                                wm.confidence = rule.cf
                            changed = True
                    except Exception:
                        pass

        # Collect recommended verses from concept
        recommended_verses = []
        if wm.recommend_concept and wm.recommend_concept in self.kg.nodes:
            from modules.search_agent import bfs_reading_list
            verses = bfs_reading_list(wm.recommend_concept, self.kg, max_hops=1)
            recommended_verses = verses[:5]

        if wm.start_verse and wm.start_verse in self.kg.nodes:
            sv_node = self.kg.nodes[wm.start_verse]
            start_info = {
                "verse": wm.start_verse,
                "chapter": sv_node.chapter_number,
                "verse_number": sv_node.verse_number,
                "translation": sv_node.translation,
                "certainty": sv_node.certainty,
            }
        else:
            start_info = None

        return {
            "working_memory": wm,
            "fired_rules": [(r, [rule for rule in PRODUCTION_RULES if rule.name == r][0].description
                             if any(rule.name == r for rule in PRODUCTION_RULES) else "")
                            for r in wm.fired_rules],
            "recommend_concept": wm.recommend_concept,
            "recommend_chapter": wm.recommend_chapter,
            "start_verse": start_info,
            "confidence": wm.confidence,
            "recommended_verses": recommended_verses,
        }

    def reader_profiles_demo(self) -> list[dict]:
        """Run 4 standard reader profiles for demonstration."""
        profiles = [
            {"label": "Anxious Beginner",
             "concern": "I am anxious about the results of my work and fear failure",
             "goal": "peace of mind and relief from anxiety",
             "stage": "beginner", "nature": "active"},
            {"label": "Meditating Intermediate",
             "concern": "My mind is restless and I cannot concentrate during meditation",
             "goal": "meditation and focus and dhyana practice",
             "stage": "intermediate", "nature": "active"},
            {"label": "Duty-Confused Seeker",
             "concern": "I am confused about my duty — should I renounce action or keep working?",
             "goal": "understand svadharma and duty",
             "stage": "intermediate", "nature": "contemplative",
             "already_read": ["Verse_3_3"]},
            {"label": "Advanced Philosopher",
             "concern": "I seek ultimate liberation and self-knowledge",
             "goal": "liberation and moksha and self realisation",
             "stage": "advanced", "nature": "contemplative"},
        ]
        return [
            {**profile, "inference": self.infer(
                concern=profile["concern"],
                goal=profile["goal"],
                stage=profile.get("stage", "beginner"),
                nature=profile.get("nature", "active"),
                already_read=profile.get("already_read", []),
            )}
            for profile in profiles
        ]


# ─────────────────────────────────────────────────────────────────────────────
# SPARQL Queries — All 8 Competency Questions
# ─────────────────────────────────────────────────────────────────────────────

PREFIX = """
PREFIX gita: <http://example.org/gita#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
"""

SPARQL_QUERIES = {

    "CQ1": {
        "question": "Which verses teach acting without attachment to results?",
        "technique": "SPARQL + class inference",
        "query": PREFIX + """
SELECT ?id ?translation ?certainty WHERE {
  ?v a gita:Verse ;
     gita:teaches ?c ;
     gita:translationEn ?translation ;
     gita:verseNumber ?n ;
     gita:belongsToChapter ?ch ;
     gita:certaintyScore ?certainty .
  ?c gita:conceptName ?cn .
  FILTER(?cn IN ("Karma Yoga", "Nishkama Karma"))
  ?ch gita:chapterNumber ?chn .
  BIND(CONCAT(STR(?chn), ".", STR(?n)) AS ?id)
}
ORDER BY ?id
""",
    },

    "CQ2": {
        "question": "What kind of person does Krishna consider truly wise? (Sthitaprajna)",
        "technique": "SPARQL + concept retrieval",
        "query": PREFIX + """
SELECT ?id ?translation ?context WHERE {
  ?v a gita:Verse ;
     gita:teaches ?c ;
     gita:translationEn ?translation ;
     gita:contextNote ?context ;
     gita:verseNumber ?n ;
     gita:belongsToChapter ?ch .
  ?c gita:conceptName "Sthitaprajna" .
  ?ch gita:chapterNumber ?chn .
  BIND(CONCAT(STR(?chn), ".", STR(?n)) AS ?id)
}
ORDER BY ?id
""",
    },

    "CQ3": {
        "question": "How does desire cause a person's downfall? Trace the full chain.",
        "technique": "SPARQL + transitive leadsTo (use leadsTo+)",
        "query": PREFIX + """
SELECT ?step ?stepName ?definition WHERE {
  gita:Kama gita:leadsTo+ ?step .
  ?step gita:conceptName ?stepName .
  OPTIONAL { ?step gita:definitionEn ?definition . }
}
""",
    },

    "CQ4": {
        "question": "What are Krishna's practical instructions for Dhyana meditation?",
        "technique": "SPARQL + chapter-filtered query",
        "query": PREFIX + """
SELECT ?id ?translation ?context WHERE {
  ?v a gita:Verse ;
     gita:belongsToChapter gita:Chapter_6 ;
     gita:translationEn ?translation ;
     gita:contextNote ?context ;
     gita:verseNumber ?n ;
     gita:spokenBy gita:Krishna .
  BIND(CONCAT("6.", STR(?n)) AS ?id)
}
ORDER BY ?n
""",
    },

    "CQ5": {
        "question": "Should I renounce action or keep working? How does the Gita resolve this?",
        "technique": "Inference over contrastsWith + SPARQL",
        "query": PREFIX + """
SELECT ?id ?translation WHERE {
  ?v a gita:Verse ;
     gita:teaches ?c1 ;
     gita:teaches ?c2 ;
     gita:translationEn ?translation ;
     gita:verseNumber ?n ;
     gita:belongsToChapter ?ch .
  ?c1 gita:conceptName "Karma Yoga" .
  ?c2 gita:conceptName "Sannyasa" .
  ?ch gita:chapterNumber ?chn .
  BIND(CONCAT(STR(?chn), ".", STR(?n)) AS ?id)
}
""",
    },

    "CQ6": {
        "question": "Does doing good work actually lead to wisdom? Trace the progression.",
        "technique": "Property chain (teaches∘leadsTo) + transitive leadsTo",
        "query": PREFIX + """
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
""",
    },

    "CQ7": {
        "question": "Which verses are Arjuna's questions vs Krishna's answers?",
        "technique": "Speaker-filtered SPARQL + respondsTo traversal",
        "query": PREFIX + """
SELECT ?qId ?aId ?questionText ?answerText WHERE {
  ?q a gita:Verse ;
     gita:spokenBy gita:Arjuna ;
     gita:translationEn ?questionText ;
     gita:verseNumber ?qn ;
     gita:belongsToChapter ?qch .
  ?a a gita:Verse ;
     gita:spokenBy gita:Krishna ;
     gita:respondsTo ?q ;
     gita:translationEn ?answerText ;
     gita:verseNumber ?an ;
     gita:belongsToChapter ?ach .
  ?qch gita:chapterNumber ?qchn .
  ?ach gita:chapterNumber ?achn .
  BIND(CONCAT(STR(?qchn), ".", STR(?qn)) AS ?qId)
  BIND(CONCAT(STR(?achn), ".", STR(?an)) AS ?aId)
}
ORDER BY ?qId
""",
    },

    "CQ8": {
        "question": "What does the Gita say about one's own duty — Svadharma?",
        "technique": "Inference + contrastsWith + SPARQL",
        "query": PREFIX + """
SELECT ?id ?translation ?context ?opposite WHERE {
  ?v a gita:Verse ;
     gita:teaches ?c ;
     gita:translationEn ?translation ;
     gita:contextNote ?context ;
     gita:verseNumber ?n ;
     gita:belongsToChapter ?ch .
  ?c gita:conceptName "Svadharma" .
  OPTIONAL {
    ?c gita:contrastsWith ?opp .
    ?opp gita:conceptName ?opposite .
  }
  ?ch gita:chapterNumber ?chn .
  BIND(CONCAT(STR(?chn), ".", STR(?n)) AS ?id)
}
""",
    },

    "CQ_CONSTRUCT": {
        "question": "Materialise all spirituallyProgressesTo triples (property chain)",
        "technique": "SPARQL CONSTRUCT (derives CQ6 inferences explicitly)",
        "query": PREFIX + """
CONSTRUCT { ?v gita:spirituallyProgressesTo ?attainment . }
WHERE {
  ?v a gita:Verse .
  ?v gita:teaches ?c .
  ?c gita:leadsTo+ ?attainment .
  ?attainment a gita:Attainment .
}
""",
    },
}


def run_all_cqs(kg: GitaKnowledgeGraph) -> dict:
    """Execute all 8 SPARQL CQs against the RDF graph. Returns results keyed by CQ id."""
    results = {}
    for cq_id, cq_data in SPARQL_QUERIES.items():
        if cq_id == "CQ_CONSTRUCT":
            continue  # CONSTRUCT queries return graph, not rows
        try:
            rows = kg.sparql(cq_data["query"])
            results[cq_id] = {
                "question": cq_data["question"],
                "technique": cq_data["technique"],
                "rows": rows,
                "count": len(rows),
            }
        except Exception as e:
            results[cq_id] = {
                "question": cq_data["question"],
                "technique": cq_data["technique"],
                "rows": [],
                "count": 0,
                "error": str(e),
            }
    return results


if __name__ == "__main__":
    kg = GitaKnowledgeGraph()
    es = ExpertSystem(kg)

    print("=== Expert System — Reader Profile Demos ===\n")
    for demo in es.reader_profiles_demo():
        result = demo["inference"]
        wm = result["working_memory"]
        print(f"Profile: {demo['label']}")
        print(f"  Fired rules: {wm.fired_rules}")
        print(f"  Recommend concept: {result['recommend_concept']}")
        print(f"  Start verse: {result['start_verse']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print()
