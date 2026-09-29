param(
  [switch]$NoInstall
)

Write-Host "=== Auth Module Setup ===" -ForegroundColor Cyan

$backendEnv  = Join-Path $PSScriptRoot "backend\.env"
$backendExample = Join-Path $PSScriptRoot "backend\.env.example"
$frontendEnv = Join-Path $PSScriptRoot "frontend\.env"
$frontendExample = Join-Path $PSScriptRoot "frontend\.env.example"

if (-not (Test-Path $backendEnv)) {
  Copy-Item $backendExample $backendEnv
  Write-Host "Created backend\.env from example" -ForegroundColor Green
}
if (-not (Test-Path $frontendEnv)) {
  Copy-Item $frontendExample $frontendEnv
  Write-Host "Created frontend\.env from example" -ForegroundColor Green
}

if (-not $NoInstall) {
  Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
  Push-Location (Join-Path $PSScriptRoot "backend")
  npm install
  Pop-Location

  Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
  Push-Location (Join-Path $PSScriptRoot "frontend")
  npm install
  Pop-Location
}

Write-Host "`n=== Setup complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start PostgreSQL (docker-compose up -d postgres)"
Write-Host "  2. Run migrations : cd backend && npm run db:setup"
Write-Host "  3. Start backend   : cd backend && npm run start:dev"
Write-Host "  4. Start frontend  : cd frontend && npm run dev"
