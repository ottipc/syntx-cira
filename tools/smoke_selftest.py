#!/usr/bin/env python3
"""Self-test of tools/smoke.sh against local processes (uvicorn on a free port + vite preview on 4173).
This exercises the script and the real backend; it is NOT AK-10, which requires the compose chain (DEP-07a)."""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def wait(url: str, secs: float) -> None:
    until = time.time() + secs
    while time.time() < until:
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except OSError:
            time.sleep(0.2)
    raise SystemExit(f"not reachable: {url}")


def main() -> int:
    port = free_port()
    with tempfile.TemporaryDirectory() as data:
        api = subprocess.Popen([sys.executable, "-m", "uvicorn", "--factory", "app.api.main:create_app", "--host", "127.0.0.1",
                                "--port", str(port), "--log-level", "warning"], cwd=ROOT / "backend", env={**os.environ, "CIRA_DATA": data})
        subprocess.run(["npx", "vite", "build", "--logLevel", "error"], cwd=ROOT / "frontend", check=True)
        fe = subprocess.Popen(["npx", "vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], cwd=ROOT / "frontend",
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        try:
            wait(f"http://127.0.0.1:{port}/health", 30)
            wait("http://127.0.0.1:4173/", 30)
            r = subprocess.run(["bash", str(ROOT / "tools/smoke.sh")], env={**os.environ, "API_URL": f"http://127.0.0.1:{port}",
                                                                           "FRONTEND_URL": "http://127.0.0.1:4173"})
            return r.returncode
        finally:
            os.killpg(fe.pid, signal.SIGTERM)  # npx spawns the preview server as a child: stop the whole group
            api.terminate()
            for p in (fe, api):
                p.wait(timeout=10)


if __name__ == "__main__":
    raise SystemExit(main())
