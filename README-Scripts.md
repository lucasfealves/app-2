# Scripts de Desenvolvimento

Este projeto inclui scripts de desenvolvimento para diferentes sistemas operacionais:

## Linux/macOS
```bash
./dev.sh
```

## Windows PowerShell
```powershell
./dev.ps1
```

## Windows Command Prompt
```cmd
dev.bat
```

## Variáveis de Ambiente Configuradas

Todos os scripts configuram automaticamente:
- `NODE_ENV=development`
- `PORT=5000`

As variáveis do banco de dados PostgreSQL já estão disponíveis no ambiente Replit:
- `DATABASE_URL`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `PGHOST`

## Como usar no desenvolvimento local

1. **Linux/macOS**: Execute `chmod +x dev.sh` e depois `./dev.sh`
2. **Windows PowerShell**: Execute `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` (uma vez) e depois `./dev.ps1`
3. **Windows CMD**: Execute `dev.bat`

Todos os scripts fazem a mesma coisa: configuram as variáveis de ambiente e iniciam o servidor de desenvolvimento.