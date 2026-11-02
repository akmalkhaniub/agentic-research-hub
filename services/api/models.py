import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, DateTime, Boolean, JSON, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class FeedItem(Base):
    __tablename__ = "feed_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    source: Mapped[str] = mapped_column(String(128), nullable=False)
    source_type: Mapped[str] = mapped_column(String(64), default="Paper")  # Paper, Release, News, Blog, Repo
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="")
    why_it_matters: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    relevance: Mapped[str] = mapped_column(String(32), default="med")  # high, med, low
    author: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    published_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False)
    raw_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    template: Mapped[str] = mapped_column(String(128), nullable=False)
    provider: Mapped[str] = mapped_column(String(64), default="Kaggle")  # Kaggle, Modal, Lightning, Colab, Local
    gpu: Mapped[str] = mapped_column(String(64), default="T4")
    status: Mapped[str] = mapped_column(String(32), default="Queued")  # Queued, Running, Succeeded, Failed, Awaiting_Handoff
    duration_str: Mapped[str] = mapped_column(String(64), default="0s")
    key_metric: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    artifacts: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    logs: Mapped[str] = mapped_column(Text, default="")
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

class ApprovalItem(Base):
    __tablename__ = "approval_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(64), default="GPU Compute")
    resource_cost: Mapped[str] = mapped_column(String(128), default="")
    status: Mapped[str] = mapped_column(String(32), default="Pending")  # Pending, Approved, Rejected
    requested_by: Mapped[str] = mapped_column(String(64), default="Research Copilot")
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    query: Mapped[str] = mapped_column(String(256), nullable=False)
    channel: Mapped[str] = mapped_column(String(64), default="In-app")
    hit_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
