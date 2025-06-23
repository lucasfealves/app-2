# Script de desenvolvimento PowerShell com variáveis de ambiente configuradas

# Configurar variáveis de ambiente
$env:NODE_ENV = "development"
$env:PORT = "5000"

# As variáveis do banco de dados já estão disponíveis no ambiente Replit
# DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST

Write-Host "Iniciando aplicação em modo de desenvolvimento..." -ForegroundColor Green
Write-Host "Porta: $($env:PORT)" -ForegroundColor Cyan
Write-Host "Ambiente: $($env:NODE_ENV)" -ForegroundColor Cyan

if ($env:DATABASE_URL) {
    $dbPreview = $env:DATABASE_URL.Substring(0, [Math]::Min(20, $env:DATABASE_URL.Length))
    Write-Host "Banco de dados configurado: $dbPreview..." -ForegroundColor Cyan
}

# Executar o servidor
Write-Host "Executando: npx tsx server/index.ts" -ForegroundColor Yellow
npx tsx server/index.ts