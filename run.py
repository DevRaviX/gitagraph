"""
GitaGraph local launcher.

Run the full development stack with:
    python run.py

Useful options:
    python run.py --api-only
    python run.py --host 0.0.0.0 --api-port 8080 --frontend-port 3000
"""

from __future__ import annotations

import argparse
import os
import signal
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run GitaGraph locally.")
    parser.add_argument("--host", default="127.0.0.1", help="Flask API host")
    parser.add_argument("--api-port", type=int, default=8080, help="Flask API port")
    parser.add_argument(
        "--frontend-port", type=int, default=3000, help="Vite frontend port"
    )
    parser.add_argument(
        "--api-only", action="store_true", help="Run only the Flask REST API"
    )
    parser.add_argument(
        "--skip-checks",
        action="store_true",
        help="Skip local dependency and data checks before launching",
    )
    return parser.parse_args()


def check_required_files() -> list[str]:
    required = [
        ROOT / "Bhagwad_Gita.csv",
        ROOT / "knowledge_base" / "gita_ontology.ttl",
        ROOT / "requirements.txt",
    ]
    return [str(path.relative_to(ROOT)) for path in required if not path.exists()]


def check_frontend_ready() -> tuple[bool, str]:
    if not FRONTEND.exists():
        return False, "frontend/ directory not found"
    if not (FRONTEND / "package.json").exists():
        return False, "frontend/package.json not found"
    if not (FRONTEND / "node_modules").exists():
        return False, "frontend dependencies missing; run: cd frontend && npm install"
    return True, ""


def start_api(args: argparse.Namespace) -> subprocess.Popen:
    env = os.environ.copy()
    env["FLASK_RUN_HOST"] = args.host
    env["GITAGRAPH_API_PORT"] = str(args.api_port)
    env["GITAGRAPH_DEBUG"] = "0"
    return subprocess.Popen(
        [sys.executable, "api.py"],
        cwd=ROOT,
        env=env,
    )


def start_frontend(args: argparse.Namespace) -> subprocess.Popen:
    env = os.environ.copy()
    proxy_host = "127.0.0.1" if args.host == "0.0.0.0" else args.host
    env["VITE_API_PROXY_TARGET"] = f"http://{proxy_host}:{args.api_port}"
    return subprocess.Popen(
        [
            "npm",
            "run",
            "dev",
            "--",
            "--host",
            "127.0.0.1",
            "--port",
            str(args.frontend_port),
        ],
        cwd=FRONTEND,
        env=env,
    )


def terminate(processes: list[subprocess.Popen]) -> None:
    for process in processes:
        if process.poll() is None:
            process.send_signal(signal.SIGTERM)
    for process in processes:
        if process.poll() is None:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


def main() -> int:
    args = parse_args()

    if not args.skip_checks:
        missing = check_required_files()
        if missing:
            print("Missing required project files:")
            for item in missing:
                print(f"  - {item}")
            return 1

    processes: list[subprocess.Popen] = []
    try:
        print(f"Starting GitaGraph API: http://{args.host}:{args.api_port}")
        api_process = start_api(args)
        processes.append(api_process)
        time.sleep(1)

        if args.api_only:
            print("Frontend skipped. API-only mode is running.")
        else:
            ready, reason = check_frontend_ready()
            if ready:
                print(f"Starting React UI: http://127.0.0.1:{args.frontend_port}")
                processes.append(start_frontend(args))
            else:
                print(f"Frontend not started: {reason}")
                print("The Flask API is still available. Run frontend setup when needed.")

        print("Press Ctrl+C to stop.")
        while all(process.poll() is None for process in processes):
            time.sleep(0.5)

        for process in processes:
            if process.poll() not in (None, 0):
                return process.returncode or 1
        return 0
    except KeyboardInterrupt:
        print("\nStopping GitaGraph...")
        return 0
    finally:
        terminate(processes)


if __name__ == "__main__":
    raise SystemExit(main())
