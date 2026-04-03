# AI Ethics Simulator - Quick Start (Windows PowerShell)
# This script sets up and launches both frontend and backend

Write-Host "AI Ethics Simulator - Quick Start" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Yellow

# Detect common venv locations inside backend
$venvPaths = @("backend\.venv", "backend\venv", "backend\.env", "backend\venv\Scripts", "backend\.venv\Scripts")
$venvPath = $null
foreach ($p in $venvPaths) {
    if (Test-Path $p) { $venvPath = $p; break }
}

if (-not $venvPath) {
    Write-Host "Creating Python virtual environment at backend\.venv..."
    python -m venv backend\.venv
    $venvPath = "backend\.venv"
}

# Normalize path to Scripts folder
if ($venvPath -notmatch "Scripts$") {
    if (Test-Path (Join-Path $venvPath 'Scripts')) { $venvPath = Join-Path $venvPath 'Scripts' }
    elseif (Test-Path (Join-Path $venvPath 'bin')) { $venvPath = Join-Path $venvPath 'bin' }
}

Write-Host "Using virtual environment:" $venvPath

Write-Host "Installing dependencies (may take a moment)..."
& (Join-Path (Split-Path $venvPath -Parent) 'Scripts\Activate.ps1')
pip install -r backend\requirements.txt

# Step 2: Environment Check
Write-Host ""
Write-Host "Configuration Check" -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "WARNING: .env file not found in backend/" -ForegroundColor Red
    Write-Host "   Creating from template..."
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "   Created. Please edit backend\.env with your credentials:" -ForegroundColor Green
    Write-Host "      - MONGO_URI: Your MongoDB Atlas connection string"
    Write-Host "      - GROQ_API_KEY: Your Groq API key"
    Write-Host ""
    Write-Host "   Press Enter to continue (or edit .env first)..."
    Read-Host
} else {
    Write-Host ".env file found" -ForegroundColor Green
}

# Step 3: Start Backend
Write-Host ""
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Green
Write-Host "   Running on: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

Write-Host "Launching backend in a new PowerShell window..." -ForegroundColor Green
$backendVenv = (Join-Path $PSScriptRoot 'backend')
if (Test-Path (Join-Path $PSScriptRoot 'backend\.venv')) { $backendVenv = Join-Path $PSScriptRoot 'backend\.venv' }
elseif (Test-Path (Join-Path $PSScriptRoot 'backend\venv')) { $backendVenv = Join-Path $PSScriptRoot 'backend\venv' }

$backendActivate = (Join-Path $backendVenv 'Scripts\Activate.ps1')
$backendCmd = "& '$backendActivate'; uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList '-NoExit','-Command', ("Set-Location '{0}\backend'; {1}" -f $PSScriptRoot, $backendCmd)

Start-Sleep -Seconds 2

# Step 4: Start Frontend
Write-Host "Starting Frontend (HTTP Server)..." -ForegroundColor Green
Write-Host "   Running on: http://localhost:8080 (or see below)" -ForegroundColor Cyan
Write-Host ""

# Try to open in browser
$frontendUrl = "http://localhost:8080"
Write-Host "Launching frontend in a new PowerShell window..." -ForegroundColor Green
if (Get-Command python -ErrorAction SilentlyContinue) {
    $frontendCmd = "python -m http.server 8080"
    Start-Process powershell -ArgumentList '-NoExit','-Command', ("Set-Location '{0}'; {1}" -f $PSScriptRoot, $frontendCmd)
    Start-Sleep -Seconds 1
    Start-Process $frontendUrl
} else {
    Write-Host "WARNING: Python not in PATH. Cannot start frontend server." -ForegroundColor Yellow
    Write-Host "   Run manually:" -ForegroundColor Yellow
    Write-Host "   cd $PSScriptRoot; python -m http.server 8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Startup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "To stop: Press Ctrl+C and type 'exit'" -ForegroundColor Yellow
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 1
}
