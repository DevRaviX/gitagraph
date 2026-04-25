"""
uncertainty_handler.py — Digital Bhaṣya  Module 6
Uncertainty Handling: Certainty Factors, Fuzzy Logic, Non-Monotonic Reasoning.

Author: Ayushi Choyal (@KA1117)
Module: Uncertainty (MYCIN CF, fuzzy yoga-path membership, non-monotonic reasoning)

Implements:
  mycin_combine(cf1, cf2)           → MYCIN combination formula
  compute_verse_cf(verse, evidences) → combine multiple CFs for a verse
  fuzzy_yoga_membership(verse, kg)   → fuzzy set membership in yoga paths
  NonMonotonicEngine                 → belief revision with default logic
"""

from modules.knowledge_graph import GitaKnowledgeGraph

# ─────────────────────────────────────────────────────────────────────────────
# 1. CERTAINTY FACTORS (MYCIN Model)
# ─────────────────────────────────────────────────────────────────────────────
# CF combination formula:
#   CF(A, B) = CF1 + CF2 * (1 - CF1)   [both positive]
#   CF(A, B) = CF1 + CF2 * (1 + CF1)   [both negative]
#   CF(A, B) = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))  [mixed]

def mycin_combine(cf1: float, cf2: float) -> float:
    """
    MYCIN certainty factor combination for two independent pieces of evidence.
    Range: [-1, 1]
    """
    if cf1 >= 0 and cf2 >= 0:
        return cf1 + cf2 * (1 - cf1)
    elif cf1 < 0 and cf2 < 0:
        return cf1 + cf2 * (1 + cf1)
    else:
        denom = 1 - min(abs(cf1), abs(cf2))
        if denom == 0:
            return 0.0
        return (cf1 + cf2) / denom


def combine_multiple_cfs(cfs: list[float]) -> float:
    """Combine a list of CFs iteratively using MYCIN formula."""
    if not cfs:
        return 0.0
    result = cfs[0]
    for cf in cfs[1:]:
        result = mycin_combine(result, cf)
    return round(result, 4)


# Pre-computed CF data for key verses from three commentary traditions
# Format: {verse_id: {concept: {tradition: cf, ...}, ...}}
VERSE_CF_DATA = {
    "Verse_2_47": {
        "KarmaYoga_inst": {
            "Ramanuja":   0.95,  # primary — Karma as devotional service
            "Keyword_match": 0.85,  # 'action', 'fruits', 'duty'
            "Madhva":     0.80,  # action as offering to Krishna = Bhakti overlap
            "Shankara":   0.40,  # preparatory for Jnana — Karma Yoga is secondary
        },
        "JnanaYoga_inst": {
            "Shankara":   0.70,  # action is ultimately transcended by knowledge
            "Ramanuja":   0.20,  # disagrees — Karma Yoga is primary here
        },
        "BhaktiYoga_inst": {
            "Madhva":     0.80,  # action offered to Krishna = Bhakti at heart
            "Ramanuja":   0.65,  # devotional dimension present
        },
    },
    "Verse_6_47": {
        "DhyanaYoga_inst": {
            "Context_chapter": 0.75,  # Chapter 6 is Dhyana Yoga
            "Ramanuja":        0.60,
        },
        "BhaktiYoga_inst": {
            "Text_analysis":   0.90,  # 'worships Me with devotion' is central
            "Ramanuja":        0.92,
            "Madhva":          0.88,
        },
        "KarmaYoga_inst": {
            "Context_action":  0.20,  # action theme weak in this verse
        },
    },
    "Verse_3_27": {
        "JnanaYoga_inst": {
            "Shankara":     0.88,  # Gunas act, not the Self — pure Jnana
            "Text_analysis": 0.82,
        },
        "KarmaYoga_inst": {
            "Ramanuja":     0.65,  # still in Karma Yoga chapter context
        },
    },
    "Verse_2_55": {
        "JnanaYoga_inst": {
            "Shankara":    0.92,  # Sthitaprajna is Jnani's description
            "Text_analysis": 0.85,
        },
        "DhyanaYoga_inst": {
            "Ramanuja":    0.70,  # mental equanimity = meditative quality
        },
    },
    "Verse_3_9": {
        "KarmaYoga_inst": {
            "All_traditions": 0.92,
        },
        "BhaktiYoga_inst": {
            "Ramanuja":    0.78,  # sacrifice to Vishnu = Bhakti dimension
            "Madhva":      0.82,
        },
    },
}


def compute_verse_cf(verse_id: str, concept_id: str) -> dict:
    """
    Compute combined CF for a verse-concept pair from all available evidence.
    Returns combined CF, evidence list, and interpretation.
    """
    if verse_id not in VERSE_CF_DATA:
        return {"verse": verse_id, "concept": concept_id,
                "cf_combined": None, "evidence": [],
                "note": "No CF data for this verse"}
    if concept_id not in VERSE_CF_DATA[verse_id]:
        return {"verse": verse_id, "concept": concept_id,
                "cf_combined": None, "evidence": [],
                "note": "No CF data for this concept in this verse"}

    evidence = VERSE_CF_DATA[verse_id][concept_id]
    cf_values = list(evidence.values())
    cf_combined = combine_multiple_cfs(cf_values)

    interpretation = "Strong" if cf_combined >= 0.80 else \
                     "Moderate" if cf_combined >= 0.60 else \
                     "Weak" if cf_combined >= 0.40 else "Very weak"

    flag = ""
    if cf_combined < 0.60:
        flag = "⚠ Uncertain — assert with uncertainty flag"
    if cf_combined < 0.40:
        flag = "🚫 Unreliable — requires expert review"

    return {
        "verse": verse_id,
        "concept": concept_id,
        "evidence": [{"source": k, "cf": v} for k, v in evidence.items()],
        "cf_individual": cf_values,
        "cf_combined": round(cf_combined, 4),
        "interpretation": interpretation,
        "flag": flag,
        "formula": f"MYCIN: {' ⊕ '.join(str(round(c,2)) for c in cf_values)} = {cf_combined:.4f}",
    }


def cf_analysis_all() -> list[dict]:
    """Run CF analysis for all ambiguous verse-concept pairs."""
    results = []
    for verse_id, concepts in VERSE_CF_DATA.items():
        for concept_id in concepts:
            results.append(compute_verse_cf(verse_id, concept_id))
    return results


# ─────────────────────────────────────────────────────────────────────────────
# 2. FUZZY LOGIC — Yoga Path Membership
# ─────────────────────────────────────────────────────────────────────────────
# mu_KarmaYoga(verse)   = count(Karma Yoga concepts taught) / 3  [max 3]
# mu_DhyanaYoga(verse)  = count(Dhyana Yoga concepts taught) / 3
# mu_JnanaYoga(verse)   = count(Jnana Yoga concepts taught) / 3
# mu_BhaktiYoga(verse)  = count(Bhakti Yoga concepts taught) / 3

# Concept membership in yoga paths (from ontology)
CONCEPT_YOGA_MEMBERSHIP = {
    "NishkamaKarma":    {"KarmaYoga": 1.0, "JnanaYoga": 0.2, "DhyanaYoga": 0.1, "BhaktiYoga": 0.3},
    "Vairagya":         {"KarmaYoga": 0.6, "JnanaYoga": 0.5, "DhyanaYoga": 0.8, "BhaktiYoga": 0.4},
    "Abhyasa":          {"KarmaYoga": 0.3, "JnanaYoga": 0.2, "DhyanaYoga": 1.0, "BhaktiYoga": 0.2},
    "Samata":           {"KarmaYoga": 0.7, "JnanaYoga": 0.5, "DhyanaYoga": 0.8, "BhaktiYoga": 0.3},
    "Buddhi":           {"KarmaYoga": 0.4, "JnanaYoga": 1.0, "DhyanaYoga": 0.6, "BhaktiYoga": 0.1},
    "Svadharma":        {"KarmaYoga": 1.0, "JnanaYoga": 0.3, "DhyanaYoga": 0.1, "BhaktiYoga": 0.2},
    "ChittaShuddhi":    {"KarmaYoga": 0.8, "JnanaYoga": 0.7, "DhyanaYoga": 0.7, "BhaktiYoga": 0.5},
    "Sthitaprajna":     {"KarmaYoga": 0.5, "JnanaYoga": 1.0, "DhyanaYoga": 0.8, "BhaktiYoga": 0.3},
    "Samadhi":          {"KarmaYoga": 0.1, "JnanaYoga": 0.7, "DhyanaYoga": 1.0, "BhaktiYoga": 0.5},
    "AtmaJnana":        {"KarmaYoga": 0.3, "JnanaYoga": 1.0, "DhyanaYoga": 0.8, "BhaktiYoga": 0.4},
    "Moksha":           {"KarmaYoga": 0.5, "JnanaYoga": 0.8, "DhyanaYoga": 0.7, "BhaktiYoga": 0.9},
    "KarmaYoga_inst":   {"KarmaYoga": 1.0, "JnanaYoga": 0.2, "DhyanaYoga": 0.1, "BhaktiYoga": 0.3},
    "JnanaYoga_inst":   {"KarmaYoga": 0.2, "JnanaYoga": 1.0, "DhyanaYoga": 0.5, "BhaktiYoga": 0.2},
    "DhyanaYoga_inst":  {"KarmaYoga": 0.1, "JnanaYoga": 0.5, "DhyanaYoga": 1.0, "BhaktiYoga": 0.4},
    "BhaktiYoga_inst":  {"KarmaYoga": 0.3, "JnanaYoga": 0.2, "DhyanaYoga": 0.4, "BhaktiYoga": 1.0},
    "Kama":             {"KarmaYoga": 0.0, "JnanaYoga": 0.0, "DhyanaYoga": 0.0, "BhaktiYoga": 0.0},
    "Krodha":           {"KarmaYoga": 0.0, "JnanaYoga": 0.0, "DhyanaYoga": 0.0, "BhaktiYoga": 0.0},
    "Moha":             {"KarmaYoga": 0.0, "JnanaYoga": 0.0, "DhyanaYoga": 0.0, "BhaktiYoga": 0.0},
    "BuddhiNasha":      {"KarmaYoga": 0.0, "JnanaYoga": 0.0, "DhyanaYoga": 0.0, "BhaktiYoga": 0.0},
    "Sattva":           {"KarmaYoga": 0.5, "JnanaYoga": 0.8, "DhyanaYoga": 0.7, "BhaktiYoga": 0.4},
    "Rajas":            {"KarmaYoga": 0.6, "JnanaYoga": 0.1, "DhyanaYoga": 0.0, "BhaktiYoga": 0.1},
    "Tamas":            {"KarmaYoga": 0.0, "JnanaYoga": 0.0, "DhyanaYoga": 0.0, "BhaktiYoga": 0.0},
    "Sannyasa_inst":    {"KarmaYoga": 0.2, "JnanaYoga": 0.7, "DhyanaYoga": 0.5, "BhaktiYoga": 0.3},
}

YOGA_PATHS = ["KarmaYoga", "JnanaYoga", "DhyanaYoga", "BhaktiYoga"]


def fuzzy_yoga_membership(verse_name: str, kg: GitaKnowledgeGraph) -> dict:
    """
    Compute fuzzy yoga-path membership for a verse.
    mu_Path(verse) = average concept membership for concepts taught by this verse.
    """
    concepts_taught = list(kg.neighbours_by_edge(verse_name, "teaches"))
    if not concepts_taught:
        return {"verse": verse_name, "memberships": {p: 0.0 for p in YOGA_PATHS},
                "primary_path": None, "concepts": []}

    memberships = {path: 0.0 for path in YOGA_PATHS}
    for concept in concepts_taught:
        concept_mem = CONCEPT_YOGA_MEMBERSHIP.get(concept, {p: 0.0 for p in YOGA_PATHS})
        for path in YOGA_PATHS:
            memberships[path] = max(memberships[path], concept_mem.get(path, 0.0))

    primary_path = max(memberships, key=memberships.get)
    # Linguistic labels for membership grades
    labels = {}
    for path, mu in memberships.items():
        if mu >= 0.80:
            labels[path] = "High"
        elif mu >= 0.50:
            labels[path] = "Medium"
        elif mu >= 0.20:
            labels[path] = "Low"
        else:
            labels[path] = "None"

    return {
        "verse": verse_name,
        "concepts_taught": concepts_taught,
        "memberships": {k: round(v, 2) for k, v in memberships.items()},
        "linguistic_labels": labels,
        "primary_path": primary_path,
        "crisp_would_say": primary_path,
        "fuzzy_reveals": f"{primary_path} with secondary " +
                         (", ".join(p for p in YOGA_PATHS
                                    if p != primary_path and memberships[p] >= 0.5)
                          or "none"),
    }


def fuzzy_all_verses(kg: GitaKnowledgeGraph) -> list[dict]:
    """Compute fuzzy membership for all 30 verses."""
    results = []
    for verse_node in kg.all_verses():
        if verse_node.name in ("Verse_3_1", "Verse_6_33"):
            continue
        results.append(fuzzy_yoga_membership(verse_node.name, kg))
    return results


def dual_membership_verses(kg: GitaKnowledgeGraph,
                            threshold: float = 0.5) -> list[dict]:
    """Return verses with high (≥threshold) membership in 2+ yoga paths."""
    result = []
    for entry in fuzzy_all_verses(kg):
        high_paths = [p for p, mu in entry["memberships"].items() if mu >= threshold]
        if len(high_paths) >= 2:
            result.append({**entry, "dual_membership_paths": high_paths})
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 3. NON-MONOTONIC REASONING — Belief Revision
# ─────────────────────────────────────────────────────────────────────────────
# Default logic: default rules are retracted when exceptions are encountered.
# Models the reader's evolving understanding as they progress through chapters.

class Belief:
    def __init__(self, statement: str, source: str, is_default: bool = False):
        self.statement = statement
        self.source = source
        self.is_default = is_default
        self.active = True
        self.retracted_by = None

    def __repr__(self):
        status = "ACTIVE" if self.active else f"RETRACTED by {self.retracted_by}"
        tag = "[DEFAULT]" if self.is_default else "[DERIVED]"
        return f"{tag} '{self.statement}' ({status})"


class NonMonotonicEngine:
    """
    Implements default logic with belief revision.
    When new evidence (a verse or chapter) is processed, default assumptions
    may be retracted and replaced with more specific conclusions.
    """

    def __init__(self):
        self.beliefs: list[Belief] = []
        self.reader_state = {"nature": "active", "chapter_read": []}
        self._init_defaults()

    def _init_defaults(self):
        """Default assumptions before any chapter is read."""
        self.beliefs = [
            Belief(
                "Karma Yoga is the recommended path for all readers",
                source="Default rule: Chapter 2 establishes action as primary",
                is_default=True
            ),
            Belief(
                "All verses recommend action over renunciation",
                source="Default rule: Chapter 2 emphasis on Arjuna's duty",
                is_default=True
            ),
            Belief(
                "The reader is suited for Karma Yoga (active path)",
                source="Default rule: no information about reader's nature",
                is_default=True
            ),
        ]

    def process_verse(self, verse_id: str, reader_nature: str = "active") -> dict:
        """
        Process a new verse and trigger belief revision if needed.
        Returns the list of belief changes (retractions + additions).
        """
        changes = []
        self.reader_state["chapter_read"].append(verse_id)
        self.reader_state["nature"] = reader_nature

        # ── Verse 3.3: Two paths are equally valid ────────────────────────────
        if verse_id == "Verse_3_3":
            # Retract: "Karma Yoga is the only path"
            for b in self.beliefs:
                if b.active and b.statement == "Karma Yoga is the recommended path for all readers":
                    b.active = False
                    b.retracted_by = "Verse_3_3"
                    changes.append({
                        "type": "RETRACT",
                        "belief": b.statement,
                        "trigger": verse_id,
                        "reason": "Verse 3.3: Krishna explicitly teaches two paths (Jnana for contemplatives, Karma for active)"
                    })
            # Add new derived belief
            new_b = Belief(
                "Two paths exist: Jnana Yoga for contemplatives, Karma Yoga for the active",
                source="Verse_3_3 (Krishna explicitly resolves Arjuna's confusion)",
                is_default=False
            )
            self.beliefs.append(new_b)
            changes.append({
                "type": "ADD",
                "belief": new_b.statement,
                "trigger": verse_id,
                "reason": "Verse 3.3 introduces the two-path resolution"
            })

            # If reader is contemplative → retract Karma Yoga recommendation
            if reader_nature == "contemplative":
                for b in self.beliefs:
                    if b.active and b.statement == "The reader is suited for Karma Yoga (active path)":
                        b.active = False
                        b.retracted_by = f"Verse_3_3 + reader nature={reader_nature}"
                        changes.append({
                            "type": "RETRACT",
                            "belief": b.statement,
                            "trigger": verse_id,
                            "reason": f"Reader nature is '{reader_nature}' → Jnana Yoga preferred"
                        })
                new_jnana = Belief(
                    "Jnana Yoga is recommended for this contemplative reader",
                    source=f"Verse_3_3 + reader_nature={reader_nature}",
                    is_default=False
                )
                self.beliefs.append(new_jnana)
                changes.append({"type": "ADD", "belief": new_jnana.statement,
                                 "trigger": verse_id, "reason": "Contemplative reader → Jnana path"})

        # ── Verse 6.47: Bhakti Yoga crowned as greatest ───────────────────────
        elif verse_id == "Verse_6_47":
            for b in self.beliefs:
                if b.active and "Two paths exist" in b.statement:
                    b.active = False
                    b.retracted_by = "Verse_6_47"
                    changes.append({
                        "type": "RETRACT",
                        "belief": b.statement,
                        "trigger": verse_id,
                        "reason": "Verse 6.47: All yogis are transcended by the Bhakta — Bhakti Yoga is the highest"
                    })
            new_b = Belief(
                "All yoga paths lead to Me; the greatest yogi is the devoted Bhakta (Verse 6.47)",
                source="Verse_6_47 — culminating verse of Chapter 6",
                is_default=False
            )
            self.beliefs.append(new_b)
            changes.append({"type": "ADD", "belief": new_b.statement,
                             "trigger": verse_id,
                             "reason": "Chapter 6 concludes with Bhakti as the highest path"})

        # ── Verse 2.71: Desirelessness alone gives peace ─────────────────────
        elif verse_id == "Verse_2_71":
            for b in self.beliefs:
                if b.active and b.statement == "All verses recommend action over renunciation":
                    b.active = False
                    b.retracted_by = "Verse_2_71"
                    changes.append({
                        "type": "RETRACT",
                        "belief": b.statement,
                        "trigger": verse_id,
                        "reason": "Verse 2.71: Peace comes from desirelessness — action is a means, not the end"
                    })
            new_b = Belief(
                "Action is a means; the goal is desirelessness and inner peace (2.71)",
                source="Verse_2_71",
                is_default=False
            )
            self.beliefs.append(new_b)
            changes.append({"type": "ADD", "belief": new_b.statement,
                             "trigger": verse_id})

        return {
            "verse_processed": verse_id,
            "reader_nature": reader_nature,
            "belief_changes": changes,
            "active_beliefs": [b.statement for b in self.beliefs if b.active],
            "retracted_beliefs": [(b.statement, b.retracted_by)
                                   for b in self.beliefs if not b.active],
        }

    def full_revision_demo(self) -> list[dict]:
        """
        Simulate a reader progressing through:
        Chapter 2 → Verse 3.3 → Verse 6.47
        showing belief revision at each step.
        """
        self._init_defaults()
        steps = []

        steps.append({
            "step": "Initial (after Chapter 2)",
            "reader_nature": "active",
            "active_beliefs": [b.statement for b in self.beliefs if b.active],
            "retracted": [],
            "event": "Default beliefs established from Chapter 2 reading",
        })

        result = self.process_verse("Verse_3_3", reader_nature="contemplative")
        steps.append({
            "step": "After reading Verse 3.3",
            "event": "Krishna teaches two paths",
            **result,
        })

        result = self.process_verse("Verse_6_47", reader_nature="contemplative")
        steps.append({
            "step": "After reading Verse 6.47",
            "event": "Chapter 6 concludes — Bhakti as highest path",
            **result,
        })

        return steps


if __name__ == "__main__":
    kg = GitaKnowledgeGraph()

    print("=== MYCIN Certainty Factors ===")
    cf = compute_verse_cf("Verse_2_47", "KarmaYoga_inst")
    print(f"Verse_2_47 → KarmaYoga:  CF_combined = {cf['cf_combined']} | {cf['interpretation']}")
    print(f"  Formula: {cf['formula']}")
    cf2 = compute_verse_cf("Verse_2_47", "JnanaYoga_inst")
    print(f"Verse_2_47 → JnanaYoga:  CF_combined = {cf2['cf_combined']} | {cf2['interpretation']}")

    print("\n=== Fuzzy Yoga Membership ===")
    for v in ["Verse_6_47", "Verse_2_47", "Verse_6_35"]:
        result = fuzzy_yoga_membership(v, kg)
        print(f"{v}: {result['memberships']} → primary: {result['primary_path']}")

    print("\n=== Non-Monotonic Belief Revision ===")
    engine = NonMonotonicEngine()
    for step in engine.full_revision_demo():
        print(f"\n[{step['step']}]")
        print(f"  Active: {step['active_beliefs']}")
