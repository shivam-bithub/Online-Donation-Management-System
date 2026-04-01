# Start Backend Server
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Starting Backend Server" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\backend"

if (Test-Path "server.js") {
    Write-Host "✓ Found server.js" -ForegroundColor Green
    Write-Host "✓ Starting server on port 3000..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "API endpoints: http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    node server.js
} else {
    Write-Host "❌ Error: server.js not found in backend directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    pause
}

