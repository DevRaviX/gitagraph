"""
Download the Bhagavad-Gita Audio dataset from HuggingFace.
Shows: file-by-file progress, speed, ETA, downloaded size.
Resume-safe: interrupted downloads continue from where they left off.
"""

import os, sys, requests
from tqdm import tqdm
from huggingface_hub import list_repo_files, hf_hub_url

REPO_ID   = "JDhruv14/Bhagavad-Gita_Audio"
REPO_TYPE = "dataset"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAVE_DIR  = os.path.join(PROJECT_ROOT, "Data", "audio_cache")

def fmt_size(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024: return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"

# ─────────────────────────────────────────────────────────────────────────────
print("\n╔══════════════════════════════════════════════════════╗")
print("║   Bhagavad-Gita Audio Dataset  —  Downloader         ║")
print("╚══════════════════════════════════════════════════════╝\n")

print("Fetching file list from HuggingFace Hub…")
all_files = list(list_repo_files(REPO_ID, repo_type=REPO_TYPE))
data_files = [f for f in all_files if f.startswith("data/")]
print(f"Found {len(data_files)} shard(s) to download.\n")

os.makedirs(SAVE_DIR, exist_ok=True)

total_bytes  = 0
skipped      = 0

for idx, fname in enumerate(data_files, 1):
    dest = os.path.join(SAVE_DIR, os.path.basename(fname))
    url  = hf_hub_url(REPO_ID, fname, repo_type=REPO_TYPE)

    # Get remote file size via HEAD
    try:
        head = requests.head(url, allow_redirects=True, timeout=15)
        remote_size = int(head.headers.get("Content-Length", 0))
    except Exception:
        remote_size = 0

    # Resume support: check existing partial file
    resume_from = os.path.getsize(dest) if os.path.exists(dest) else 0

    if resume_from > 0 and remote_size > 0 and resume_from >= remote_size:
        print(f"  [{idx}/{len(data_files)}] ✓  {os.path.basename(fname)}"
              f"  ({fmt_size(remote_size)}) — already complete, skipping.")
        total_bytes += remote_size
        skipped += 1
        continue

    if resume_from > 0:
        print(f"  [{idx}/{len(data_files)}] ↻  Resuming from"
              f" {fmt_size(resume_from)} / {fmt_size(remote_size)}")

    headers = {"Range": f"bytes={resume_from}-"} if resume_from else {}
    resp = requests.get(url, headers=headers, stream=True, timeout=60)
    resp.raise_for_status()

    mode = "ab" if resume_from else "wb"
    bar_desc = f"[{idx}/{len(data_files)}] {os.path.basename(fname)}"

    with open(dest, mode) as f, tqdm(
        desc=bar_desc,
        total=remote_size,
        initial=resume_from,
        unit="B",
        unit_scale=True,
        unit_divisor=1024,
        dynamic_ncols=True,
        colour="yellow",
        bar_format=(
            "{desc}: {percentage:3.0f}%|{bar}|"
            " {n_fmt}/{total_fmt}  {rate_fmt}  ETA {remaining}"
        ),
    ) as bar:
        for chunk in resp.iter_content(chunk_size=256 * 1024):
            if chunk:
                f.write(chunk)
                bar.update(len(chunk))

    total_bytes += remote_size

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "─" * 56)
print(f"  Total size       : {fmt_size(total_bytes)}")
print(f"  Skipped (cached) : {skipped} file(s)")
print(f"  Saved to         : {SAVE_DIR}")
print("─" * 56)

# ── Verify with datasets (load from local parquet files) ─────────────────────
print("\nVerifying from local files…")
try:
    from datasets import load_dataset  # type: ignore
    parquet_files = sorted([
        os.path.join(SAVE_DIR, f)
        for f in os.listdir(SAVE_DIR)
        if f.endswith(".parquet")
    ])
    if not parquet_files:
        raise FileNotFoundError(f"No parquet files found in {SAVE_DIR}")
    ds = load_dataset("parquet", data_files={"train": parquet_files}, split="train")
    print(f"  ✓  {len(ds)} verses ready  |  columns: {ds.column_names}")
except Exception as e:
    print(f"  ✗  {e}")
    sys.exit(1)

print("\n✓  Dataset ready! Start Flask — audio will play instantly.\n")
