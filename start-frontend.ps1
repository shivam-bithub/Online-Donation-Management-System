# Start Frontend Web Server
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🌐 Starting Frontend Web Server" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\Frontend"

# Check for Python
$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    Write-Host "✓ Python found" -ForegroundColor Green
    Write-Host "✓ Starting web server on port 5500..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Frontend will be available at: http://localhost:5500" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Open in browser: http://localhost:5500/index.html" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    python -m http.server 5500
} else {
    # Check for Node.js http-server
    $httpServer = Get-Command http-server -ErrorAction SilentlyContinue
    if ($httpServer) {
        Write-Host "✓ http-server found" -ForegroundColor Green
        Write-Host "✓ Starting web server on port 5500..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Frontend will be available at: http://localhost:5500" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Open in browser: http://localhost:5500/index.html" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        
        http-server -p 5500 -c-1
    } else {
        Write-Host "❌ Error: Neither Python nor http-server found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install one of the following:" -ForegroundColor Yellow
        Write-Host "  1. Python: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host "  2. Node.js http-server: npm install -g http-server" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use VS Code Live Server extension" -ForegroundColor Cyan
        pause
    }
}
