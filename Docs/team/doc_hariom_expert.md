# 📘 HariOm — Expert System, Production Rules, Forward Chaining & SPARQL

> **Role:** Expert System Developer  
> **Module owned:** `backend/modules/expert_system.py`  
> **AI Concepts:** Production Rules · Forward Chaining · Conflict Resolution · Specificity · SPARQL · Competency Questions

---

## 1. What You Own — Big Picture

You built the **reasoning engine** of Digital Bhaṣya. When a reader says "I feel anxious about results" and "my goal is peace," your module fires the correct rules, resolves conflicts, and recommends the exact starting verse.

```
Reader inputs (concern, goal, stage, nature)
       ↓
Working Memory (facts assembled from inputs)
       ↓
Match-Select-Execute cycle (forward chaining)
       ↓
Conflict Set → Resolved by Specificity
       ↓
Recommendation: concept + verse + confidence
```

You also own the 8 SPARQL Competency Questions — the queries that prove the knowledge base correctly captures Gita semantics.

---

## 2. Expert System Theory

### 2.1 What Is a Production System?

A production system has three components:
1. **Working Memory (WM)** — current facts (what the system knows right now)
2. **Rule Base** — IF-THEN rules (permanent knowledge)
3. **Inference Engine** — the loop that matches rules to facts

Our system uses **forward chaining**: start from known facts → fire matching rules → add new facts → repeat until no more rules fire (fixed point).

Contrast with **backward chaining** (Prolog): start from a goal → work backwards to find facts that prove it. We don't use it because we don't know the reader's outcome in advance.

### 2.2 The Match-Select-Execute Cycle

```
CYCLE:
  1. MATCH   — find all rules whose conditions are satisfied by WM
  2. SELECT  — if multiple rules match (conflict set), pick the best one
  3. EXECUTE — fire the rule, add its conclusions to WM
  4. REPEAT  until no new rules fire
```

### 2.3 Conflict Resolution — Specificity

When multiple rules match, **which one fires first?** We rank by **specificity** — the rule with more conditions is more specific and takes priority.

```python
# From expert_system.py
@dataclass
class ProductionRule:
    name        : str
    conditions  : list[Callable]  # condition functions
    conclusions : list[str]       # facts to add to WM
    specificity : int             # number of conditions (MORE = higher priority)
    cf          : float           # certainty factor (0–1)
    description : str
```

Rule with `specificity=3` fires before `specificity=2`. This mimics how an expert doctor prioritizes their most specific diagnostic criteria.

---

## 3. The 8 Production Rules — Deep Dive

```python
PRODUCTION_RULES = [

  ProductionRule(
    name="R1_KarmaYoga_Anxious_Active",
    conditions=[
      lambda wm: "anxiety" in wm.get("concern","").lower(),
      lambda wm: wm.get("nature") == "active",
      lambda wm: wm.get("stage") in ("beginner","intermediate"),
    ],
    conclusions=["recommended_path=KarmaYoga"],
    specificity=3, cf=0.90,
    description="Anxious active readers → KarmaYoga (action without attachment)"
  ),

  ProductionRule(
    name="R2_JnanaYoga_Confusion_Advanced",
    conditions=[
      lambda wm: "confusion" in wm.get("concern","").lower()
                 or "wisdom" in wm.get("goal","").lower(),
      lambda wm: wm.get("stage") == "advanced",
    ],
    conclusions=["recommended_path=JnanaYoga"],
    specificity=2, cf=0.85,
    description="Advanced readers seeking wisdom → JnanaYoga"
  ),

  # ... 6 more rules covering DhyanaYoga, BhaktiYoga, etc.
]
```

**Each condition is a lambda** that takes the working memory dict and returns True/False. The rule fires only if ALL conditions return True (AND logic).

---

## 4. Code Walkthrough — `ExpertSystem.infer()`

```python
class ExpertSystem:
    def __init__(self, kg):
        self.kg = kg

    def infer(self, concern, goal, stage, nature):
        # Step 1: Build Working Memory from reader inputs
        wm = {
            "concern": concern,
            "goal":    goal,
            "stage":   stage,
            "nature":  nature,
        }

        fired_rules   = []
        added_facts   = set()
        max_iterations = 10  # safety limit to prevent infinite loops

        # Step 2: Forward Chaining Loop
        for iteration in range(max_iterations):
            new_fired = False

            # Sort rules by specificity DESC (conflict resolution)
            sorted_rules = sorted(PRODUCTION_RULES, key=lambda r: -r.specificity)

            for rule in sorted_rules:
                if rule.name in added_facts:
                    continue  # already fired this rule

                # MATCH: check all conditions against WM
                if all(cond(wm) for cond in rule.conditions):
                    # EXECUTE: add conclusions to WM
                    for fact in rule.conclusions:
                        key, val = fact.split("=", 1)
                        wm[key] = val
                        added_facts.add(rule.name)
                    fired_rules.append((rule.name, rule.description))
                    new_fired = True
                    break  # restart cycle (Rete-like behavior)

            if not new_fired:
                break  # fixed point reached — no more rules can fire

        # Step 3: Extract recommendation
        path    = wm.get("recommended_path", "KarmaYoga")
        concept = f"{path}_inst"

        # Step 4: Find best starting verse via SPARQL
        start_verse = self._find_start_verse(concept)

        # Step 5: Combine CFs of fired rules (MYCIN formula)
        confidence = self._combine_cfs([
            r.cf for r in PRODUCTION_RULES if r.name in added_facts
        ])

        return {
            "fired_rules":       fired_rules,
            "working_memory":    wm,
            "recommend_concept": concept,
            "start_verse":       start_verse,
            "confidence":        confidence,
        }
```

### Key design decisions:
- **`break` after firing** — restarts the cycle so newly added facts can trigger more rules (forward chaining semantics)
- **`added_facts` set** — prevents the same rule firing twice (loop prevention)
- **`max_iterations=10`** — guards against infinite loops in case rules create cycles

---

## 5. Finding the Start Verse — SPARQL Integration

```python
def _find_start_verse(self, concept_name: str) -> dict | None:
    # Ask the KG: "Which verse teaches this concept?"
    query = f"""
        PREFIX gita: <http://example.org/gita#>
        SELECT ?verse ?chapter ?verseNum ?translation WHERE {{
            ?verse a gita:Verse ;
                   gita:teaches gita:{concept_name} ;
                   gita:inChapter ?ch ;
                   gita:hasVerseNumber ?verseNum ;
                   gita:hasEnglishTranslation ?translation .
            BIND(xsd:integer(?verseNum) AS ?vn)
        }}
        ORDER BY ?chapter ?vn
        LIMIT 1
    """
    rows = self.kg.sparql(query)
    if rows:
        return {
            "chapter":     rows[0].get("chapter", ""),
            "verse_number": rows[0].get("verseNum", ""),
            "translation":  rows[0].get("translation", ""),
        }
    return None
```

The expert system uses SPARQL to ground its recommendation in actual scripture. This is **symbolic AI** at work: the rule fires, picks a concept, then the KG finds the verse.

---

## 6. SPARQL Competency Questions — CQ1 to CQ8

Competency Questions prove the ontology is correctly designed. They are yes/no questions the KG must be able to answer.

### CQ1 — Which verses teach KarmaYoga?
```sparql
SELECT ?verse ?translation WHERE {
    ?verse a gita:Verse ;
           gita:teaches gita:KarmaYoga_inst ;
           gita:hasEnglishTranslation ?translation .
}
```
**Expected:** Returns Verse_2_47, Verse_3_19, Verse_6_47 etc.

### CQ2 — What concepts does Verse 2.47 teach?
```sparql
SELECT ?concept WHERE {
    gita:Verse_2_47 gita:teaches ?concept .
}
```
**Expected:** NishkamaKarma_inst, KarmaYoga_inst

---

## 7. Reader Profile Demos

The `reader_profiles_demo()` method tests all 8 rules with pre-defined personas:

```python
def reader_profiles_demo(self):
    profiles = [
        {
            "label":   "The Anxious Professional",
            "concern": "I feel anxious about the results of my work",
            "goal":    "peace and clarity",
            "stage":   "beginner",
            "nature":  "active",
        },
        # ...
    ]
    return [{"label": p["label"], "concern": p["concern"], "goal": p["goal"],
             "inference": self.infer(**p)} for p in profiles]
```

---

## 8. Professor Q&A — HariOm's Section

### Q1: What is forward chaining? How is it different from backward chaining?

**A:** Forward chaining (data-driven) starts with known facts and applies rules to derive new facts until the goal is reached or no more rules fire. Backward chaining (goal-driven, used by Prolog) starts with a goal and works backwards to find supporting facts. We use forward chaining because we don't know the reader's recommended path in advance — we discover it by reasoning from their stated concern and goal.

### Q2: What is a conflict set and how do you resolve it?

**A:** When multiple rules match the current working memory simultaneously, they form the **conflict set**. We must choose which rule fires first. Our strategy is **specificity ordering**: the rule with the most conditions fires first, because more conditions means more tailored advice.

### Q3: What prevents infinite loops in your forward chaining?

**A:** Two mechanisms: (1) `added_facts` set — once a rule fires, its name is added to this set, and the rule is skipped in future iterations. (2) `max_iterations=10` — a hard limit on the number of forward-chaining cycles.

---

## 9. Key Numbers to Remember

| Item | Value |
|---|---|
| Production rules | 8 |
| Max specificity | 3 |
| Typical rules fired per query | 1–3 |
| SPARQL competency questions | 8 |
| CQs requiring OWL reasoner | 1 (CQ3) |
| Forward chaining cycles (typical) | 2–3 |

---

## 10. Demo Strategy (Viva)

1. **Open Ask the Gītā** → type concern: "anxiety about results" → goal: "peace" → stage: beginner → nature: active
2. Show the response: **R1_KarmaYoga fires**, confidence 90%, starts at Verse 2.47
3. Click "Show inference chain" — show the rule name and description
4. Go to **SPARQL Explorer** → run CQ1 → show real verse results from the ontology
5. Open `expert_system.py` → point to `PRODUCTION_RULES` list → explain a rule's conditions
