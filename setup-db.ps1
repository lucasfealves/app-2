# Script para configurar e testar conexão com banco de dados

param(
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUrl
)

Write-Host "=== Configuração do Banco de Dados ===" -ForegroundColor Cyan

if ($DatabaseUrl) {
    $env:DATABASE_URL = $DatabaseUrl
    Write-Host "DATABASE_URL configurada via parâmetro" -ForegroundColor Green
} elseif (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL não encontrada. Configuração necessária:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções de banco de dados:" -ForegroundColor White
    Write-Host "1. PostgreSQL Local" -ForegroundColor Cyan
    Write-Host "2. Neon PostgreSQL (recomendado para desenvolvimento)" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Escolha uma opção (1 ou 2)"
    
    if ($choice -eq "1") {
        Write-Host "Configure seu PostgreSQL local:" -ForegroundColor Yellow
        $host = Read-Host "Host (pressione Enter para localhost)"
        if (-not $host) { $host = "localhost" }
        
        $port = Read-Host "Porta (pressione Enter para 5432)"
        if (-not $port) { $port = "5432" }
        
        $database = Read-Host "Nome do banco de dados"
        $username = Read-Host "Usuário"
        $password = Read-Host "Senha" -AsSecureString
        $passwordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        $env:DATABASE_URL = "postgresql://${username}:${passwordText}@${host}:${port}/${database}"
        
    } elseif ($choice -eq "2") {
        Write-Host "Para usar Neon PostgreSQL:" -ForegroundColor Yellow
        Write-Host "1. Vá para https://neon.tech" -ForegroundColor White
        Write-Host "2. Crie uma conta gratuita" -ForegroundColor White
        Write-Host "3. Crie um novo projeto" -ForegroundColor White
        Write-Host "4. Copie a connection string fornecida" -ForegroundColor White
        Write-Host ""
        
        $neonUrl = Read-Host "Cole aqui sua connection string do Neon"
        $env:DATABASE_URL = $neonUrl
        
    } else {
        Write-Host "Opção inválida!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Testando conexão com banco de dados..." -ForegroundColor Yellow

# Testar conexão executando db:push
try {
    Write-Host "Aplicando schema do banco..." -ForegroundColor Cyan
    & npm run db:push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Banco de dados configurado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para persistir a configuração nesta sessão:" -ForegroundColor Yellow
        Write-Host "Execute: `$env:DATABASE_URL = `"$($env:DATABASE_URL)`"" -ForegroundColor White
        Write-Host ""
        Write-Host "Para configuração permanente, adicione ao seu perfil do PowerShell:" -ForegroundColor Yellow
        Write-Host "`$PROFILE" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erro ao configurar banco de dados" -ForegroundColor Red
        Write-Host "Verifique se a URL está correta e o banco está acessível" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erro ao testar conexão: $($_.Exception.Message)" -ForegroundColor Red
}