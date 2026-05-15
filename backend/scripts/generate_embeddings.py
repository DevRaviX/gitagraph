"""
generate_embeddings.py — One-time script to pre-compute verse embeddings.

Run:
    python backend/scripts/generate_embeddings.py

Outputs:
    Data/embeddings/verse_embeddings.npy  — float32 array, shape (N, 384), L2-normalised
    Data/embeddings/verse_index.json      — list of verse metadata dicts

Model: paraphrase-multilingual-MiniLM-L12-v2 (~420 MB, downloads automatically on first run).
Supports 50+ languages including Hindi — improves retrieval for Hindi/Hinglish queries.
Because embeddings are L2-normalised, cosine similarity = dot product at query time.

Previous model (English-only): all-MiniLM-L6-v2 (~90 MB).
Backup of old embeddings saved as verse_embeddings_en_backup.npy if present.
"""

import os, json, csv, re
import numpy as np
from sentence_transformers import SentenceTransformer

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(PROJECT_ROOT, "Data", "corpus", "Bhagwad_Gita.csv")
OUT_DIR  = os.path.join(PROJECT_ROOT, "Data", "embeddings")
os.makedirs(OUT_DIR, exist_ok=True)

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
print(f"Loading model: {MODEL_NAME}  (downloads ~420 MB on first run, multilingual)")

# Back up existing English-only embeddings before overwriting
import shutil
npy_existing = os.path.join(OUT_DIR, "verse_embeddings.npy")
npy_backup   = os.path.join(OUT_DIR, "verse_embeddings_en_backup.npy")
if os.path.exists(npy_existing) and not os.path.exists(npy_backup):
    shutil.copy2(npy_existing, npy_backup)
    print(f"  Backed up old embeddings → {npy_backup}")

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
    # Concatenate English + Hindi so multilingual model handles both script queries
    hi = strip_prefix(r.get("HinMeaning", ""))
    combined = (eng + " " + hi).strip() if hi else eng
    texts.append(combined)

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
