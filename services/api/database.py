import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from services.api.models import Base

# Ensure data directory exists
DATA_DIR = Path("data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DATA_DIR / 'hub.db'}")

engine = create_async_engine(DB_PATH, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
