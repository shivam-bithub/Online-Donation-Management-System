# Start Both Backend and Frontend Servers
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Starting Full Stack Application" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\start-backend.ps1"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\start-frontend.ps1"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5500" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open in browser: http://localhost:5500/index.html" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

