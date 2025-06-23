@echo off
REM Script de desenvolvimento para Windows (.bat) com variáveis de ambiente configuradas

REM Configurar variáveis de ambiente
set NODE_ENV=development
set PORT=5000

REM As variáveis do banco de dados já estão disponíveis no ambiente Replit
REM DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST

echo Iniciando aplicação em modo de desenvolvimento...
echo Porta: %PORT%
echo Ambiente: %NODE_ENV%

if defined DATABASE_URL (
    echo Banco de dados configurado: %DATABASE_URL:~0,20%...
)

echo.
echo Executando: npx tsx server/index.ts
npx tsx server/index.ts