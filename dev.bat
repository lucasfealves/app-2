@echo off
REM Script de desenvolvimento para Windows (.bat) com variáveis de ambiente configuradas

REM Configurar variáveis de ambiente
set NODE_ENV=development
set PORT=5000

REM Verificar se DATABASE_URL está configurada
if not defined DATABASE_URL (
    echo ERRO: DATABASE_URL nao esta configurada!
    echo.
    echo Para desenvolvimento local, voce precisa configurar a DATABASE_URL:
    echo 1. PostgreSQL Local:
    echo    set DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
    echo.
    echo 2. Neon PostgreSQL ^(recomendado^):
    echo    set DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
    echo.
    echo Apos configurar, execute o script novamente.
    pause
    exit /b 1
)

echo Iniciando aplicacao em modo de desenvolvimento...
echo Porta: %PORT%
echo Ambiente: %NODE_ENV%
echo Banco de dados configurado: %DATABASE_URL:~0,20%...

echo.
echo Executando: npx tsx server/index.ts
npx tsx server/index.ts