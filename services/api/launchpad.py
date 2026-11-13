"""
launchpad.py: Cloud Deployment Blueprints and Infrastructure-as-Code generator.
Generates Terraform, Dockerfile, and CLI deployment runbooks optimized for permanent free tiers.
"""

from typing import List, Dict, Any, Optional

LAUNCHPAD_TEMPLATES = [
    {
        "id": "gcp_cloud_run_api",
        "name": "FastAPI Agent Service",
        "cloud": "GCP",
        "service": "Cloud Run (Fully Managed)",
        "free_tier_fit": "100% Free (2 Million req/mo, 360,000 vCPU-s, 5GB storage)",
        "description": "Production containerized agent backend with scale-to-zero capability. Consumes zero cost when idle.",
        "category": "API & Serverless",
        "icon": "gcp",
        "env_vars": ["GEMINI_API_KEY", "DATABASE_URL", "KAGGLE_KEY"],
        "dockerfile": """FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir uv && uv pip install --system fastapi uvicorn
COPY . .
CMD ["uvicorn", "services.api.main:app", "--host", "0.0.0.0", "--port", "8080"]""",
        "terraform": """resource "google_cloud_run_v2_service" "agent_api" {
  name     = "agentic-research-hub-api"
  location = "us-central1"
  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
    containers {
      image = "gcr.io/${var.project_id}/agentic-api:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }
  }
}""",
        "cli_command": """gcloud run deploy agentic-api \\
  --image gcr.io/$PROJECT_ID/agentic-api:latest \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --min-instances 0 \\
  --max-instances 3"""
    },
    {
        "id": "gcp_mcp_server",
        "name": "Model Context Protocol (MCP) Streamable Server",
        "cloud": "GCP",
        "service": "Cloud Run (HTTP SSE)",
        "free_tier_fit": "100% Free (Within 2M requests/mo grant)",
        "description": "Exposes research paper search and GPU experiment execution as remote MCP tools to Claude Desktop and Cursor.",
        "category": "Protocol & MCP",
        "icon": "mcp",
        "env_vars": ["MCP_SECRET_KEY", "HUB_API_URL"],
        "dockerfile": """FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir mcp fastapi uvicorn
CMD ["uvicorn", "services.mcp.server:app", "--host", "0.0.0.0", "--port", "8080"]""",
        "terraform": """resource "google_cloud_run_v2_service" "mcp_server" {
  name     = "agent-mcp-server"
  location = "us-central1"
  template {
    containers {
      image = "gcr.io/${var.project_id}/agent-mcp:latest"
    }
  }
}""",
        "cli_command": """gcloud run deploy agent-mcp-server \\
  --image gcr.io/$PROJECT_ID/agent-mcp:latest \\
  --region us-central1 \\
  --allow-unauthenticated"""
    },
    {
        "id": "aws_lambda_agent",
        "name": "AWS Lambda Serverless Agent",
        "cloud": "AWS",
        "service": "Lambda + Function URL",
        "free_tier_fit": "100% Free (1 Million requests/mo & 3.2M seconds compute)",
        "description": "Event-driven autonomous tool runner triggered via EventBridge cron or HTTP Function URL.",
        "category": "Serverless Worker",
        "icon": "aws",
        "env_vars": ["AWS_REGION", "ANTHROPIC_API_KEY"],
        "dockerfile": """FROM public.ecr.aws/lambda/python:3.12
COPY pyproject.toml ${LAMBDA_TASK_ROOT}
RUN pip install uv && uv pip install --system mangum fastapi
COPY . ${LAMBDA_TASK_ROOT}
CMD ["services.api.main.handler"]""",
        "terraform": """resource "aws_lambda_function" "agent_worker" {
  function_name = "agentic-research-worker"
  runtime       = "provided.al2023"
  architectures = ["arm64"]
  memory_size   = 256
  timeout       = 60
}""",
        "cli_command": """aws lambda create-function \\
  --function-name agentic-worker \\
  --package-type Image \\
  --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agentic:latest \\
  --role arn:aws:iam::$AWS_ACCOUNT_ID:role/lambda-role"""
    },
    {
        "id": "hf_spaces_demo",
        "name": "Hugging Face Spaces Interactive Demo",
        "cloud": "Hugging Face",
        "service": "HF Spaces (Gradio / Streamlit)",
        "free_tier_fit": "100% Free (Permanent 2 vCPU / 16GB RAM + ZeroGPU H200 slices)",
        "description": "Public or private interactive research playground for sharing agent benchmarks and paper RAG with team members.",
        "category": "Interactive Demo",
        "icon": "hf",
        "env_vars": ["HF_TOKEN"],
        "dockerfile": """FROM python:3.12
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]""",
        "terraform": "# Hugging Face Spaces can be synced directly via git push to https://huggingface.co/spaces/$USER/$SPACE",
        "cli_command": """git remote add hf https://huggingface.co/spaces/$HF_USERNAME/agentic-hub-demo
git push hf main"""
    }
]

def get_launchpad_templates() -> List[Dict[str, Any]]:
    return LAUNCHPAD_TEMPLATES

def get_launchpad_template_by_id(template_id: str) -> Optional[Dict[str, Any]]:
    return next((t for t in LAUNCHPAD_TEMPLATES if t["id"] == template_id), None)
