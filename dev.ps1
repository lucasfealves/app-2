# Script de desenvolvimento PowerShell com variáveis de ambiente configuradas

# Configurar variáveis de ambiente
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Verificar se DATABASE_URL está configurada
if (-not $env:DATABASE_URL) {
    Write-Host "ERRO: DATABASE_URL não está configurada!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para desenvolvimento local, você precisa configurar a DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL Local:" -ForegroundColor Cyan
    Write-Host '   $env:DATABASE_URL = "postgresql://usuario:senha@localhost:5432/nome_do_banco"' -ForegroundColor White
    Write-Host ""
    Write-Host "2. Neon PostgreSQL (recomendado):" -ForegroundColor Cyan
    Write-Host '   $env:DATABASE_URL = "postgresql://usuario:senha@host.neon.tech/database?sslmode=require"' -ForegroundColor White
    Write-Host ""
    Write-Host "Após configurar, execute o script novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "Iniciando aplicação em modo de desenvolvimento..." -ForegroundColor Green
Write-Host "Porta: $($env:PORT)" -ForegroundColor Cyan
Write-Host "Ambiente: $($env:NODE_ENV)" -ForegroundColor Cyan

$dbPreview = $env:DATABASE_URL.Substring(0, [Math]::Min(20, $env:DATABASE_URL.Length))
Write-Host "Banco de dados configurado: $dbPreview..." -ForegroundColor Cyan

# Executar o servidor
Write-Host "Executando: npx tsx server/index.ts" -ForegroundColor Yellow
npx tsx server/index.ts