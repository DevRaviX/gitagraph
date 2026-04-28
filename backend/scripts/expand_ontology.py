"""
expand_ontology.py — Use Claude Haiku to generate RDF Turtle triples for the
671 Bhagavad Gītā verses not yet in the 30-verse AI corpus.

Usage:
    ANTHROPIC_API_KEY=sk-... python backend/scripts/expand_ontology.py [options]

Options:
    --batch N      Verses per API call (default: 10)
    --limit N      Max verses to process, 0 = all (default: 0)
    --dry-run      Print triples, don't write to TTL
    --output FILE  Write to FILE instead of appending to gita_ontology.ttl

Workflow:
    1. Reads existing TTL to find already-encoded verses (skips them)
    2. Reads CSV for remaining verses
    3. Calls claude-haiku-4-5 in batches with few-shot prompting
    4. Validates each output line with a regex (drops malformed lines)
    5. Appends valid triples to the TTL (or prints with --dry-run)

After running, restart the Flask server so get_kg() reloads the updated TTL.
"""

import os, sys, csv, re, time, argparse, json
from pathlib import Path

ROOT     = Path(__file__).resolve().parents[2]
TTL_PATH = ROOT / "Data" / "ontology" / "gita_ontology.ttl"
CSV_PATH = ROOT / "Data" / "corpus" / "Bhagwad_Gita.csv"

# ── Known concept instances in the ontology ───────────────────────────────────
KNOWN_CONCEPTS = [
    "KarmaYoga_inst", "JnanaYoga_inst", "DhyanaYoga_inst", "BhaktiYoga_inst",
    "NishkamaKarma_inst", "Svadharma_inst", "Yajna_inst", "Tapas_inst",
    "Vairagya_inst", "Viveka_inst",
    "Sattva_inst", "Rajas_inst", "Tamas_inst",
    "Kama_inst", "Krodha_inst", "Lobha_inst", "Ahamkara_inst",
    "Moksha_inst", "Samadhi_inst", "Sthitaprajna_inst",
    "Brahman_inst", "Atman_inst", "Dharma_inst",
]

# ── Few-shot examples ──────────────────────────────────────────────────────────
FEW_SHOT = """
Example 1 — Verse 2.47:
Translation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."
Triples:
gita:Verse_2_47_inst  gita:teaches  gita:NishkamaKarma_inst .
gita:Verse_2_47_inst  gita:teaches  gita:KarmaYoga_inst .

Example 2 — Verse 3.27:
Translation: "All activities are carried out by the three modes of material nature. But in ignorance, the soul, deluded by false identification with the body, thinks itself to be the doer."
Triples:
gita:Verse_3_27_inst  gita:teaches  gita:Ahamkara_inst .
gita:Verse_3_27_inst  gita:teaches  gita:Rajas_inst .
gita:Verse_3_27_inst  gita:teaches  gita:Tamas_inst .

Example 3 — Verse 12.8:
Translation: "Fix your mind on Me alone, let your intellect dwell in Me. Thereafter you will always live in Me. Of this there is no doubt."
Triples:
gita:Verse_12_8_inst  gita:teaches  gita:BhaktiYoga_inst .
gita:Verse_12_8_inst  gita:teaches  gita:Samadhi_inst .
"""

SYSTEM = (
    "You are an RDF knowledge engineer specialising in Vedantic philosophy. "
    "Given one or more Bhagavad Gita verses, output ONLY valid RDF Turtle triples "
    "using the gita: prefix (http://example.org/gita#). "
    "Allowed predicates: gita:teaches, gita:leadsTo, gita:contrastsWith, "
    "gita:subConceptOf, gita:spokenBy. "
    "Use only known concept instances (listed in each prompt) or introduce new ones "
    "with a descriptive _inst suffix. "
    "Each output line must be one complete triple ending with ' .' "
    "Output ONLY triples — no explanations, no prefix declarations, no blank lines "
    "between triples of the same verse."
)

TRIPLE_RE = re.compile(r'^(gita:\S+)\s+(gita:\S+)\s+(gita:\S+)\s*\.$')

def validate_triples(raw: str) -> list[str]:
    valid = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('@'):
            continue
        if TRIPLE_RE.match(line):
            valid.append(line)
        else:
            print(f"  [skip malformed] {line[:90]}")
    return valid

def load_existing_verse_keys() -> set:
    from rdflib import Graph, Namespace, RDF
    GITA = Namespace("http://example.org/gita#")
    g = Graph()
    g.parse(str(TTL_PATH), format="turtle")
    keys = set()
    for s in g.subjects(RDF.type, GITA.Verse):
        local = str(s).split("#")[-1]
        keys.add(local)
    return keys

def strip_prefix(text: str) -> str:
    text = re.sub(r'^[\d]+\.[\d]+\.?\s*', '', text.strip())
    text = re.sub(r'^।।[\d]+\.[\d]+।।', '', text.strip())
    return text.strip()

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--batch",   type=int, default=10,  help="Verses per API call (default 10)")
    parser.add_argument("--limit",   type=int, default=0,   help="Max verses to process, 0=all")
    parser.add_argument("--dry-run", action="store_true",   help="Print triples without writing")
    parser.add_argument("--output",  type=str, default="",  help="Output file (default: append to TTL)")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("Error: ANTHROPIC_API_KEY environment variable not set.")

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)

    print("Loading existing ontology…")
    existing = load_existing_verse_keys()
    print(f"  {len(existing)} verses already in corpus")

    # Load CSV and filter
    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(row)

    todo = []
    seen_keys = set()
    for r in rows:
        ch, v = r.get("Chapter", ""), r.get("Verse", "")
        key   = f"Verse_{ch}_{v}_inst"
        if key in existing or key in seen_keys:
            continue
        eng = strip_prefix(r.get("EngMeaning", ""))
        if eng:
            todo.append({"ch": ch, "verse": v, "key": key, "translation": eng[:500]})
            seen_keys.add(key)

    if args.limit:
        todo = todo[:args.limit]
    print(f"  {len(todo)} new verses to expand")

    if not todo:
        print("Nothing to do.")
        return

    concepts_block = "\n".join(f"  - {c}" for c in KNOWN_CONCEPTS)
    all_triples: list[str] = []
    errors = 0

    for i in range(0, len(todo), args.batch):
        batch = todo[i : i + args.batch]
        verse_block = "\n\n".join(
            f"Verse {item['ch']}.{item['verse']}:\nTranslation: {item['translation']}"
            for item in batch
        )
        prompt = (
            f"Known concept instances:\n{concepts_block}\n\n"
            f"{FEW_SHOT}\n"
            f"Now generate triples for these verses:\n\n{verse_block}\n\nTriples:"
        )

        lo, hi = i + 1, min(i + args.batch, len(todo))
        print(f"[{lo}–{hi}/{len(todo)}] calling Claude Haiku…", end=" ", flush=True)
        try:
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1200,
                system=SYSTEM,
                messages=[{"role": "user", "content": prompt}],
            )
            raw     = msg.content[0].text
            triples = validate_triples(raw)
            all_triples.extend(triples)
            print(f"→ {len(triples)} triples")
        except Exception as e:
            print(f"ERROR: {e}")
            errors += 1
        time.sleep(0.3)

    print(f"\nTotal valid triples: {len(all_triples)} | API errors: {errors}")

    if not all_triples:
        print("No triples generated — nothing to write.")
        return

    if args.dry_run:
        print("\n--- DRY RUN (first 40 triples) ---")
        for t in all_triples[:40]:
            print(t)
        if len(all_triples) > 40:
            print(f"… and {len(all_triples) - 40} more")
        return

    block = (
        "\n\n# ── AUTO-GENERATED via expand_ontology.py ────────────────────────────\n"
        "@prefix gita: <http://example.org/gita#> .\n\n"
        + "\n".join(all_triples)
        + "\n"
    )

    dest = Path(args.output) if args.output else TTL_PATH
    with open(dest, "a", encoding="utf-8") as f:
        f.write(block)
    print(f"Appended {len(all_triples)} triples to {dest}")
    print("Restart the Flask server to reload the updated ontology.")

if __name__ == "__main__":
    main()
