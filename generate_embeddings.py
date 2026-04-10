"""
generate_embeddings.py — One-time script to pre-compute verse embeddings.

Run:
    python generate_embeddings.py

Outputs:
    embeddings/verse_embeddings.npy  — float32 array, shape (N, 384), L2-normalised
    embeddings/verse_index.json      — list of verse metadata dicts

The embeddings use all-MiniLM-L6-v2 (90 MB, downloads automatically on first run).
Because embeddings are L2-normalised, cosine similarity = dot product at query time.
"""

import os, json, csv, re
import numpy as np
from sentence_transformers import SentenceTransformer

ROOT     = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(ROOT, "Bhagwad_Gita.csv")
OUT_DIR  = os.path.join(ROOT, "embeddings")
os.makedirs(OUT_DIR, exist_ok=True)

MODEL_NAME = "all-MiniLM-L6-v2"
print(f"Loading model: {MODEL_NAME}  (downloads ~90 MB on first run)")
model = SentenceTransformer(MODEL_NAME)

def strip_prefix(text):
    text = re.sub(r'^[\d]+\.[\d]+\.?\s*', '', text.strip())
    text = re.sub(r'^।।[\d]+\.[\d]+।।', '', text.strip())
    return text.strip()

# Load CSV
rows = []
with open(CSV_PATH, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        rows.append(row)

print(f"Read {len(rows)} rows from CSV")

# Build (index entry, text to embed) pairs
index = []
texts = []
for r in rows:
    ch  = r.get("Chapter", "")
    v   = r.get("Verse",   "")
    eng = strip_prefix(r.get("EngMeaning", ""))
    if not eng:
        continue
    key = f"Verse_{ch}_{v}"
    index.append({
        "key":            key,
        "chapter":        ch,
        "verse":          v,
        "en":             eng,
        "sa":             r.get("Shloka", ""),
        "hi":             strip_prefix(r.get("HinMeaning", "")),
        "transliteration": r.get("Transliteration", ""),
        "word_meanings":  r.get("WordMeaning", ""),
    })
    texts.append(eng)

print(f"Encoding {len(texts)} verses with {MODEL_NAME}…")
embeddings = model.encode(
    texts,
    batch_size=64,
    show_progress_bar=True,
    normalize_embeddings=True,   # L2-normalise → cosine sim = dot product
    convert_to_numpy=True,
)

npy_path  = os.path.join(OUT_DIR, "verse_embeddings.npy")
json_path = os.path.join(OUT_DIR, "verse_index.json")

np.save(npy_path, embeddings.astype("float32"))
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print(f"\nDone.")
print(f"  Embeddings: {npy_path}  shape={embeddings.shape}  dtype=float32")
print(f"  Index:      {json_path}  ({len(index)} verses)")
print(f"\nRestart the Flask server — /api/semantic_search is now active.")
