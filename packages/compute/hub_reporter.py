"""
hub_reporter.py: Lightweight client reporter embedded inside Kaggle & Colab notebooks.
Streams live training loss, memory usage, and checkpoints back to the Agentic Research Hub API.
"""

import os
import json
import time
import urllib.request
import urllib.error

class HubReporter:
    def __init__(self, api_url: str = None, run_id: str = None, token: str = None):
        self.api_url = (api_url or os.getenv("HUB_API_URL") or "http://localhost:8000").rstrip("/")
        self.run_id = run_id or os.getenv("HUB_RUN_ID") or "run_default"
        self.token = token or os.getenv("HUB_RUN_TOKEN") or "token_default"
        self.step = 0
        print(f"📡 [HubReporter] Initialized for run '{self.run_id}' -> target: {self.api_url}")

    def _post(self, endpoint: str, data: dict):
        url = f"{self.api_url}{endpoint}"
        payload = json.dumps(data).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "X-Hub-Token": self.token,
            "User-Agent": "HubReporter/1.0"
        }
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read()
        except urllib.error.URLError as e:
            # Non-blocking: fail quietly in notebook if hub is unreachable from sandbox
            print(f"⚠️ [HubReporter] Telemetry sync notice: {e}")
            return None

    def log_metrics(self, step: int = None, **kwargs):
        """
        Logs metrics e.g. reporter.log_metrics(loss=0.82, accuracy=0.79, gpu_mem_gb=11.2)
        """
        if step is not None:
            self.step = step
        else:
            self.step += 1

        payload = {
            "step": self.step,
            "timestamp": time.time(),
            "metrics": kwargs
        }
        self._post(f"/api/experiments/{self.run_id}/telemetry", payload)
        print(f"📊 [HubReporter Step {self.step}] {kwargs}")

    def log_status(self, status: str, message: str = ""):
        """
        Updates run status (e.g. 'Running', 'Uploading Artifacts')
        """
        payload = {
            "status": status,
            "message": message,
            "timestamp": time.time()
        }
        self._post(f"/api/experiments/{self.run_id}/status", payload)

    def finish(self, status: str = "Succeeded", artifacts: list = None):
        """
        Marks run as completed and registers artifact URLs.
        """
        payload = {
            "status": status,
            "artifacts": artifacts or [],
            "timestamp": time.time()
        }
        self._post(f"/api/experiments/{self.run_id}/finish", payload)
        print(f"✅ [HubReporter] Run finished with status: {status}")
