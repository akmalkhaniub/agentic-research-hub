"""
kaggle_provider.py: Orchestrates headless execution of GPU kernels on Kaggle
via the Kaggle API (30 hours/week free NVIDIA T4x2 / P100 quota).
"""

import os
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional

KAGGLE_RUNS_DIR = Path("notebooks/kaggle_runs")
KAGGLE_RUNS_DIR.mkdir(parents=True, exist_ok=True)

class KaggleProvider:
    def __init__(self):
        self.username = os.getenv("KAGGLE_USERNAME")
        self.key = os.getenv("KAGGLE_KEY")
        self.has_credentials = bool(self.username and self.key) or Path("~/.kaggle/kaggle.json").expanduser().exists()

    def submit_kernel(
        self,
        run_id: str,
        title: str,
        notebook_path: str,
        enable_gpu: bool = True
    ) -> Dict[str, Any]:
        """
        Submits a notebook to Kaggle as a private GPU kernel.
        """
        run_folder = KAGGLE_RUNS_DIR / run_id
        run_folder.mkdir(parents=True, exist_ok=True)

        user = self.username or "researcher"
        slug = f"{run_id.replace('_', '-')}"

        metadata = {
            "id": f"{user}/{slug}",
            "title": f"Agentic Hub: {title[:40]}",
            "code_file": "kernel.ipynb",
            "language": "python",
            "kernel_type": "notebook",
            "is_private": True,
            "enable_gpu": enable_gpu,
            "enable_tpu": False,
            "enable_internet": True
        }

        # Write kernel metadata
        with open(run_folder / "kernel-metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        # Copy the notebook as kernel.ipynb
        with open(notebook_path, "r", encoding="utf-8") as src, open(run_folder / "kernel.ipynb", "w", encoding="utf-8") as dst:
            dst.write(src.read())

        if not self.has_credentials:
            return {
                "status": "Running (Mocked)",
                "kernel_id": f"{user}/{slug}",
                "message": "Kaggle credentials not detected; simulated headless run initiated.",
                "is_mock": True
            }

        try:
            cmd = ["kaggle", "kernels", "push", "-p", str(run_folder)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return {
                "status": "Queued",
                "kernel_id": f"{user}/{slug}",
                "output": result.stdout,
                "is_mock": False
            }
        except Exception as e:
            return {
                "status": "Failed_Submission",
                "kernel_id": f"{user}/{slug}",
                "error": str(e),
                "is_mock": False
            }

    def check_status(self, kernel_id: str) -> str:
        if not self.has_credentials:
            return "Running"
        try:
            cmd = ["kaggle", "kernels", "status", kernel_id]
            res = subprocess.run(cmd, capture_output=True, text=True)
            return res.stdout.strip()
        except Exception:
            return "Unknown"
