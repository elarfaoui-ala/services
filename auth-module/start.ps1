param(
  [switch]$NoDb
)

$root = $PSScriptRoot

# Check if .env exists
if (-not (Test-Path (Join-Path $root "backend\.env"))) {
  Write-Host "Missing backend\.env — run .\setup.ps1 first" -ForegroundColor Red
  exit 1
}

# Start PostgreSQL via Docker if available and not already running
if (-not $NoDb) {
  $pgRunning = $null
  try { $pgRunning = docker ps --filter "name=auth-module-postgres" --format "{{.Names}}" 2>$null } catch {}
  if (-not $pgRunning) {
    Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
    docker compose -f (Join-Path $root "docker-compose.yml") up -d postgres
    Start-Sleep -Seconds 3
  } else {
    Write-Host "PostgreSQL already running" -ForegroundColor Green
  }
}

# Start backend
Write-Host "Starting backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
  param($dir)
  Set-Location $dir
  npm run start:dev
} -ArgumentList (Join-Path $root "backend")

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
  param($dir)
  Set-Location $dir
  npm run dev
} -ArgumentList (Join-Path $root "frontend")

Write-Host "`nBoth services starting in background jobs." -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:4000/api" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor Green
Write-Host "  API Docs : http://localhost:4000/api/docs (if Swagger installed)" -ForegroundColor Green
Write-Host "`nRun: Get-Job | Receive-Job (to see output)" -ForegroundColor Gray
Write-Host "Run: Get-Job | Stop-Job (to stop)" -ForegroundColor Gray
