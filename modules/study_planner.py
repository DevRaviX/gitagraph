"""
study_planner.py — Digital Bhaṣya  Module 5
Constraint Satisfaction Problem (CSP) Study Planner.

Author: Shouryavi Awasthi (@shouryaviawasthi)
Module: Search/CSP (Constraint Satisfaction, MRV, Forward Checking)

Implements:
  StudyPlanner class: Backtracking CSP with MRV + Forward Checking
  generate_plan(reader_goal, num_sessions, verses_per_session)
  Enforces: theme coherence, chapter coverage, prerequisite ordering,
            downfall chain pairing, no repetition, reader-goal constraints
"""

from itertools import combinations
from modules.knowledge_graph import GitaKnowledgeGraph

# ─────────────────────────────────────────────────────────────────────────────
# CSP Formulation
# ─────────────────────────────────────────────────────────────────────────────
# Variables:   S1, S2, S3, S4, S5  (5 study sessions)
# Domains:     D(Si) = all valid verse-pairs from the 30-verse corpus
# Constraints: 1. Theme coherence (shared concept)
#              2. Chapter coverage (all 3 chapters across 5 sessions)
#              3. Prerequisite ordering (2.62 before 2.63)
#              4. Downfall chain: {2.62, 2.63} must be in same session
#              5. No repetition (each verse in exactly one session)
#              6. Reader-goal: if 'meditation', Ch6 verse appears by S3
#              7. Speaker variety: include at least one Arjuna verse if available


MANDATORY_PAIR = ("Verse_2_62", "Verse_2_63")  # downfall chain constraint
PREREQUISITE = ("Verse_2_62", "Verse_2_63")    # 2.62 must precede 2.63 in session order

# Chapter coverage requirement
CHAPTER_COVERAGE = {2: 1, 3: 1, 6: 1}

# Reader goal constraints
GOAL_CONSTRAINTS = {
    "meditation":     {"must_include_chapter": 6, "by_session": 3},
    "anxiety":        {"must_include_verse": "Verse_2_47", "by_session": 2},
    "duty":           {"must_include_verse": "Verse_3_35", "by_session": 3},
    "wisdom":         {"must_include_verse": "Verse_2_55", "by_session": 2},
    "liberation":     {"must_include_verse": "Verse_6_47", "by_session": 4},
    "general":        {},
}


class StudyPlanner:

    def __init__(self, kg: GitaKnowledgeGraph):
        self.kg = kg
        # The 30-verse corpus (excluding reference verses like 3.1, 6.33)
        self.corpus = [
            v.name for v in kg.all_verses()
            if v.name not in ("Verse_3_1", "Verse_6_33")
        ]

    # ── Public API ────────────────────────────────────────────────────────────

    def generate_plan(self, reader_goal: str = "general",
                      num_sessions: int = 5,
                      verses_per_session: int = 2) -> dict:
        """
        Generate a study plan as a list of (session_id, verse_pair, shared_concepts).
        Uses Backtracking CSP with MRV and Forward Checking.
        """
        sessions = [f"S{i}" for i in range(1, num_sessions + 1)]
        # Build domain: all valid pairs from corpus
        all_pairs = list(combinations(self.corpus, verses_per_session))
        domains = {s: list(all_pairs) for s in sessions}

        # Pre-prune: remove pairs with no shared concept
        domains = {s: [p for p in d if self._theme_ok(p)]
                   for s, d in domains.items()}
        mandatory_pairs = [p for p in all_pairs if set(MANDATORY_PAIR).issubset(set(p))]
        if verses_per_session == len(MANDATORY_PAIR) and mandatory_pairs:
            for s in sessions:
                domains[s] = [p for p in domains[s] if (
                    set(MANDATORY_PAIR).issubset(set(p)) or
                    not any(v in p for v in MANDATORY_PAIR)
                )]
            domains[sessions[0]] = [p for p in domains[sessions[0]]
                                    if set(MANDATORY_PAIR).issubset(set(p))]

        assignment = {}
        result = self._backtrack(assignment, sessions, domains, reader_goal)
        if result is None:
            return {"success": False, "plan": [], "error": "No valid plan found"}

        # Annotate
        plan = []
        for i, sess in enumerate(sessions, 1):
            pair = result[sess]
            v1, v2 = [self.kg.nodes[v] for v in pair]
            shared = self.kg.shared_concepts(*pair)
            plan.append({
                "session": i,
                "session_id": sess,
                "verses": list(pair),
                "verse_details": [
                    {"name": v.name, "chapter": v.chapter_number,
                     "verse_number": v.verse_number,
                     "translation": v.translation, "speaker": v.speaker,
                     "certainty": v.certainty}
                    for v in [v1, v2]
                ],
                "shared_concepts": shared,
                "theme": self._describe_theme(shared),
            })

        chapters_covered = set()
        for p in plan:
            for vd in p["verse_details"]:
                chapters_covered.add(vd["chapter"])

        return {
            "success": True,
            "plan": plan,
            "reader_goal": reader_goal,
            "chapters_covered": sorted(list(chapters_covered)),
            "total_verses": num_sessions * verses_per_session,
        }

    # ── Backtracking CSP ─────────────────────────────────────────────────────

    def _backtrack(self, assignment: dict, sessions: list,
                   domains: dict, goal: str) -> dict | None:
        if len(assignment) == len(sessions):
            if self._check_chapter_coverage(assignment):
                if (self._check_mandatory_pair(assignment) and
                        self._check_speaker_variety(assignment) and
                        self._check_goal_complete(assignment, goal)):
                    return assignment
            return None

        # MRV: pick unassigned session with fewest valid pairs remaining
        session = self._mrv(sessions, assignment, domains)
        used = [v for pair in assignment.values() for v in pair]

        for pair in self._order_domain_values(session, domains[session], assignment):
            if self._is_consistent(session, pair, assignment, sessions, goal, used):
                assignment[session] = pair
                new_used = used + list(pair)

                # Forward checking: prune domains of unassigned sessions
                pruned = self._forward_check(session, pair, sessions, domains, assignment, new_used)
                if pruned is not None:
                    result = self._backtrack(assignment, sessions, domains, goal)
                    if result is not None:
                        return result
                    # Restore domains
                    for s, removed in pruned.items():
                        domains[s].extend(removed)

                del assignment[session]

        return None

    # ── MRV Heuristic ────────────────────────────────────────────────────────

    def _mrv(self, sessions: list, assignment: dict, domains: dict) -> str:
        """Minimum Remaining Values: unassigned session with fewest valid pairs."""
        unassigned = [s for s in sessions if s not in assignment]
        used = [v for pair in assignment.values() for v in pair]
        return min(unassigned,
                   key=lambda s: len([p for p in domains[s]
                                      if not any(v in used for v in p)]))

    # ── Domain Ordering ───────────────────────────────────────────────────────

    def _order_domain_values(self, session: str, domain: list,
                              assignment: dict) -> list:
        """Prefer pairs with more shared concepts (Least Constraining Value)."""
        used = [v for pair in assignment.values() for v in pair]
        valid = [p for p in domain if not any(v in used for v in p)]
        return sorted(valid,
                      key=lambda p: (
                          0 if set(MANDATORY_PAIR).issubset(set(p)) else 1,
                          -len(self.kg.shared_concepts(*p)),
                      ))

    # ── Consistency Check ─────────────────────────────────────────────────────

    def _is_consistent(self, session: str, pair: tuple,
                        assignment: dict, sessions: list,
                        goal: str, used: list) -> bool:
        v1, v2 = pair

        # (1) No repetition
        if v1 in used or v2 in used:
            return False

        # (2) Theme coherence: shared concept
        if not self._theme_ok(pair):
            return False

        # (3) Prerequisite: Verse_2_63 must come AFTER Verse_2_62
        session_idx = sessions.index(session)
        if "Verse_2_63" in pair:
            earlier_verses = [v for s in sessions[:session_idx]
                              for v in assignment.get(s, [])]
            if "Verse_2_62" not in earlier_verses and "Verse_2_62" not in pair:
                return False

        # (4) Downfall chain: 2.62 and 2.63 must be in same session
        if ("Verse_2_62" in pair) != ("Verse_2_63" in pair):
            return False

        # (5) Reader-goal requirements such as "include Verse_2_47 by S2"
        goal_lower = goal.lower()
        req = self._goal_requirement(goal_lower)
        if req:
            deadline_idx = req.get("by_session", len(sessions)) - 1
            if session_idx >= deadline_idx:
                assigned_all = [v for p in assignment.values() for v in p] + list(pair)
                if "must_include_verse" in req and req["must_include_verse"] not in assigned_all:
                    return False
                if "must_include_chapter" in req:
                    required_chapter = req["must_include_chapter"]
                    has_chapter = any(
                        self.kg.nodes.get(v) and
                        self.kg.nodes[v].chapter_number == required_chapter
                        for v in assigned_all
                    )
                    if not has_chapter:
                        return False

        return True

    # ── Forward Checking ──────────────────────────────────────────────────────

    def _forward_check(self, session: str, pair: tuple,
                        sessions: list, domains: dict,
                        assignment: dict, new_used: list) -> dict | None:
        """
        Prune domains of unassigned sessions:
        - Remove pairs using already-used verses.
        - If any domain becomes empty → return None (wipe-out detected).
        Returns dict of {session: [removed_pairs]} for backtracking restoration.
        """
        pruned = {}
        for s in sessions:
            if s not in assignment:
                removed = []
                for p in list(domains[s]):
                    if any(v in new_used for v in p):
                        domains[s].remove(p)
                        removed.append(p)
                pruned[s] = removed
                if not domains[s]:
                    # Domain wipe-out: restore and signal failure
                    for s2, rem in pruned.items():
                        domains[s2].extend(rem)
                    return None
        return pruned

    # ── Constraint Helpers ────────────────────────────────────────────────────

    def _theme_ok(self, pair: tuple) -> bool:
        """Theme coherence: pair shares at least one concept."""
        if set(MANDATORY_PAIR).issubset(set(pair)):
            return True
        return bool(self.kg.shared_concepts(*pair))

    def _check_chapter_coverage(self, assignment: dict) -> bool:
        """Check all three chapters appear at least once across all sessions."""
        chapters = set()
        for pair in assignment.values():
            for v in pair:
                node = self.kg.nodes.get(v)
                if node:
                    chapters.add(node.chapter_number)
        return {2, 3, 6}.issubset(chapters)

    def _check_mandatory_pair(self, assignment: dict) -> bool:
        """Require the downfall-chain verses to appear together in one session."""
        return any(set(MANDATORY_PAIR).issubset(set(pair)) for pair in assignment.values())

    def _check_speaker_variety(self, assignment: dict) -> bool:
        """Require at least one Arjuna verse when the corpus/domain allows it."""
        assigned = [v for pair in assignment.values() for v in pair]
        has_arjuna = any(
            self.kg.nodes.get(v) and self.kg.nodes[v].speaker == "Arjuna"
            for v in assigned
        )
        arjuna_available = any(
            self.kg.nodes.get(v) and self.kg.nodes[v].speaker == "Arjuna"
            for v in self.corpus
        )
        return has_arjuna or not arjuna_available

    def _check_goal_complete(self, assignment: dict, goal: str) -> bool:
        """Verify final assignment satisfies the selected reader-goal constraint."""
        req = self._goal_requirement(goal.lower())
        if not req:
            return True
        assigned = [v for pair in assignment.values() for v in pair]
        if "must_include_verse" in req:
            return req["must_include_verse"] in assigned
        if "must_include_chapter" in req:
            required_chapter = req["must_include_chapter"]
            return any(
                self.kg.nodes.get(v) and self.kg.nodes[v].chapter_number == required_chapter
                for v in assigned
            )
        return True

    def _goal_requirement(self, goal_lower: str) -> dict:
        """Map free-text goals to the documented hard goal constraints."""
        if "meditation" in goal_lower or "meditat" in goal_lower or "dhyan" in goal_lower:
            return GOAL_CONSTRAINTS["meditation"]
        if "anxiety" in goal_lower or "anxious" in goal_lower or "worry" in goal_lower:
            return GOAL_CONSTRAINTS["anxiety"]
        if "duty" in goal_lower or "dharma" in goal_lower or "confus" in goal_lower:
            return GOAL_CONSTRAINTS["duty"]
        if "wisdom" in goal_lower or "wise" in goal_lower or "jnana" in goal_lower:
            return GOAL_CONSTRAINTS["wisdom"]
        if "liberation" in goal_lower or "moksha" in goal_lower or "mukti" in goal_lower:
            return GOAL_CONSTRAINTS["liberation"]
        return GOAL_CONSTRAINTS["general"]

    def _describe_theme(self, shared_concepts: list) -> str:
        """Human-readable theme from shared concept names."""
        if not shared_concepts:
            return "General Gita study"
        labels = []
        for c in shared_concepts[:3]:
            node = self.kg.nodes.get(c)
            if node:
                labels.append(node.name.replace("_inst", "").replace("_", " "))
        return " · ".join(labels) if labels else "Mixed themes"


if __name__ == "__main__":
    kg = GitaKnowledgeGraph()
    planner = StudyPlanner(kg)

    print("=== Study Plan: Meditation Goal ===")
    result = planner.generate_plan(reader_goal="meditation")
    if result["success"]:
        for s in result["plan"]:
            verses = " & ".join(f"{v['chapter']}.{v['verse_number']}" for v in s["verse_details"])
            print(f"  Session {s['session']}: {verses}  | Theme: {s['theme']}")
    else:
        print("  Failed:", result.get("error"))

    print("\n=== Study Plan: Anxiety/Duty Goal ===")
    result2 = planner.generate_plan(reader_goal="anxiety")
    if result2["success"]:
        for s in result2["plan"]:
            verses = " & ".join(f"{v['chapter']}.{v['verse_number']}" for v in s["verse_details"])
            print(f"  Session {s['session']}: {verses}  | Theme: {s['theme']}")
