# 📘 Ayushi — Uncertainty Handling: MYCIN CFs, Fuzzy Logic & Belief Revision

> **Role:** Uncertainty & Non-Monotonic Reasoning Developer  
> **Module owned:** `modules/uncertainty_handler.py`  
> **AI Concepts:** MYCIN Certainty Factors · Fuzzy Logic · Membership Functions · Defuzzification · Belief Revision · Non-Monotonic Reasoning

---

## 1. What You Own — Big Picture

You handle **everything the system doesn't know for certain**. Spiritual interpretation is inherently uncertain — a verse's meaning depends on commentator, tradition, and context. Your module quantifies this uncertainty rigorously using three complementary approaches:

```
Verse or claim
     ↓
MYCIN CF Analysis        → How confident is this interpretation? (precise)
Fuzzy Logic Membership   → How much does this verse "belong" to each yoga path?
Belief Revision          → How does confidence change with new evidence?
```

This is what separates a shallow chatbot from an **intelligent reasoning system**: it knows *how much* to trust its own answers.

---

## 2. Part 1 — MYCIN Certainty Factors

### 2.1 History and Motivation

A CF is a number in **[-1, +1]**:
- `CF = +1.0` → Certain the hypothesis IS true
- `CF = 0.0` → No information
- `CF = -1.0` → Certain the hypothesis is NOT true

### 2.2 The CF Combination Rules (MYCIN)

#### Case 1: Both CFs are positive
`CF(A,B) = CF_A + CF_B × (1 - CF_A)`

#### Case 2: Both CFs are negative
`CF(A,B) = CF_A + CF_B × (1 + CF_A)`

#### Case 3: Mixed
`CF(A,B) = (CF_A + CF_B) / (1 - min(|CF_A|, |CF_B|))`

---

## 3. Part 2 — Fuzzy Logic

### 3.1 Why Fuzzy Logic?

Classical logic: A verse either teaches KarmaYoga OR it doesn't (0 or 1).  
Reality: Verse 2.47 teaches KarmaYoga with degree 0.95, DhyanaYoga with degree 0.40, and BhaktiYoga with degree 0.15 simultaneously.

### 3.2 Membership Functions

- **Triangular MF**: Defined by points `a`, `b`, `c`.
- **Gaussian MF**: Bell curve for smoother membership transitions.

---

## 4. Part 3 — Non-Monotonic Belief Revision

### 4.1 What Is Non-Monotonic Reasoning?

Classical logic is **monotonic**: adding facts never removes old conclusions. In the real world, new evidence can override old conclusions (e.g., discovering a bird is a penguin).

### 4.2 Revision in Action

1. System initially believes V2.47 teaches NishkamaKarma with CF = 0.85.
2. New evidence arrives arguing it teaches Bhakti with CF = -0.40.
3. System revises belief to CF = 0.75 using MYCIN mixed formula.

---

## 5. Professor Q&A — Ayushi's Section

### Q1: What is a Certainty Factor and how is it different from probability?

**A:** CF is a qualitative belief strength in [-1, +1]. Unlike probability, it doesn't require summing to 1 across all hypotheses and doesn't need precise priors. It captures both degree of belief and disbelief independently.

### Q2: What is fuzzy logic and why did you use it?

**A:** It allows partial set membership. Most Gita verses express multiple themes (Karma, Jnana, etc.). Fuzzy logic captures this richness by assigning a degree of membership (0.0 to 1.0) to each path.

### Q3: Explain non-monotonic reasoning.

**A:** It is reasoning where conclusions can be retracted when new evidence arrives. Our system uses the MYCIN formula to update beliefs, potentially weakening or flipping a conclusion based on contradictory expert commentaries.

---

## 6. Key Numbers to Remember

| Item | Value |
|---|---|
| CF range | [-1.0, +1.0] |
| Yoga path fuzzy sets | 5 |
| Membership types | 2 (triangular, Gaussian) |
| Verse certainty sources | 3 |

---

## 7. Demo Strategy (Viva)

1. **Open Uncertainty module** → show the CF gauge for Verse 2.47 → explain "CF of 0.87 means high confidence".
2. **MYCIN Simulator** → run cases for both positive, both negative, and mixed CFs.
3. **Fuzzy tab** → show the radar chart for Verse 2.47.
4. **Belief Revision tab** → demonstrate adding contradictory evidence and show the CF updating.
