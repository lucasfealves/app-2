# Guia de Desenvolvimento Local

Este guia resolve os problemas mais comuns ao executar a aplicação localmente.

## Configuração Rápida

### 1. Clone e instale dependências
```bash
git clone <url-do-repositorio>
cd rest-express
npm install
```

### 2. Configure o banco de dados

#### Opção Recomendada: Neon PostgreSQL
1. Crie conta gratuita em [neon.tech](https://neon.tech)
2. Crie novo projeto
3. Copie a connection string
4. Configure a variável:

**Windows PowerShell:**
```powershell
$env:DATABASE_URL = "postgresql://usuario:senha@host.neon.tech/database?sslmode=require"
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
```

**Linux/macOS:**
```bash
export DATABASE_URL="postgresql://usuario:senha@host.neon.tech/database?sslmode=require"
```

### 3. Aplique o schema do banco
```bash
npm run db:push
```

### 4. Execute a aplicação

**Windows:**
```powershell
# PowerShell
./dev.ps1

# CMD
dev.bat
```

**Linux/macOS:**
```bash
./dev.sh
```

**Ou usando npm diretamente:**
```bash
npm run dev
```

### 5. Acesse a aplicação
- URL: `http://localhost:5000`
- Admin: `admin@example.com` / `admin123`

## Soluções para Problemas Comuns

### ❌ Erro: "getaddrinfo ENOTFOUND base"
**Causa:** DATABASE_URL não configurada

**Solução:**
1. Verifique se a variável está definida
2. Configure conforme o passo 2 acima
3. Use o script automatizado: `./setup-db.ps1` (Windows)

### ❌ Erro: "ENOTSUP: operation not supported on socket"
**Causa:** Sistema não suporta binding em 0.0.0.0

**Solução:** Já corrigida automaticamente - aplicação usa localhost para desenvolvimento local

### ❌ Erro: "tsx: command not found"
**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
```

### ❌ Erro de conexão com banco
**Causa:** Credenciais incorretas ou banco inacessível

**Solução:**
1. Verifique se o PostgreSQL está rodando (se local)
2. Teste a connection string manualmente
3. Para Neon: verifique se o banco não está em sleep

## Scripts Disponíveis

- `./dev.sh` - Linux/macOS com verificações
- `./dev.ps1` - Windows PowerShell com verificações  
- `dev.bat` - Windows CMD com verificações
- `./setup-db.ps1` - Configuração automatizada do banco (Windows)
- `npm run dev` - Comando direto
- `npm run db:push` - Aplicar schema do banco

## Configuração Permanente (Windows)

Para não precisar configurar DATABASE_URL toda vez:

**PowerShell:**
```powershell
# Editar perfil
notepad $PROFILE

# Adicionar linha:
$env:DATABASE_URL = "sua-connection-string"
```

**CMD:**
```cmd
# Criar arquivo batch
echo set DATABASE_URL=sua-connection-string > setenv.bat

# Executar antes de usar a aplicação
setenv.bat
```

## Estrutura de Desenvolvimento

```
localhost:5000/          # Aplicação principal
localhost:5000/api/      # API endpoints
```

O servidor serve tanto o frontend quanto a API na mesma porta para evitar problemas de CORS durante desenvolvimento.