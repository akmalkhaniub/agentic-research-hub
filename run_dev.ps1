# Script to run both FastAPI backend and Next.js 16 frontend concurrently
Write-Host "Starting Agentic AI Research Hub (Backend on :8000, Frontend on :3000)..." -ForegroundColor Cyan

# Start FastAPI backend
$backend = Start-Process -FilePath "uv" -ArgumentList "run", "python", "-m", "uvicorn", "services.api.main:app", "--port", "8000", "--reload" -PassThru -NoNewWindow

# Start Next.js 16 frontend
Set-Location "apps\web"
npm run dev
