# Script para arrancar FutbolClub en local
# Backend en puerto 3001, Frontend en puerto 5173

Write-Host "🚀 Arrancando FutbolClub..." -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "📦 Iniciando Backend (puerto 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Frontend
Write-Host "🎨 Iniciando Frontend (puerto 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Abrir navegador
Write-Host ""
Write-Host "✅ Aplicación lista!" -ForegroundColor Green
Write-Host "🌐 Abriendo navegador en http://localhost:5173" -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "💡 Tip: Ambos servidores están corriendo en ventanas separadas." -ForegroundColor Gray
Write-Host "   Cierra las ventanas o presiona Ctrl+C para detenerlos." -ForegroundColor Gray
