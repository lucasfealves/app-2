# Aplicação REST Express

Uma aplicação web completa construída com Express.js, React, TypeScript e PostgreSQL.

## 🚀 Execução Local - Passo a Passo

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **Git**

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd rest-express
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

#### Opção A: PostgreSQL Local
1. Instale e inicie o PostgreSQL
2. Crie um banco de dados:
```sql
CREATE DATABASE rest_express_db;
```

3. Configure a variável de ambiente:
```bash
# Linux/macOS
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/rest_express_db"

# Windows PowerShell
$env:DATABASE_URL = "postgresql://usuario:senha@localhost:5432/rest_express_db"

# Windows CMD
set DATABASE_URL=postgresql://usuario:senha@localhost:5432/rest_express_db
```

#### Opção B: Neon (PostgreSQL na nuvem) - **Recomendado**
1. Crie uma conta no [Neon](https://neon.tech)
2. Crie um novo projeto
3. Copie a string de conexão fornecida
4. Configure a variável:
```bash
# Linux/macOS
export DATABASE_URL="postgresql://usuario:senha@host.neon.tech/database?sslmode=require"

# Windows PowerShell
$env:DATABASE_URL = "postgresql://usuario:senha@host.neon.tech/database?sslmode=require"

# Windows CMD
set DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
```

#### Script Automatizado para Windows
Para facilitar a configuração no Windows, use:
```powershell
./setup-db.ps1
```

### 4. Execute as Migrações do Banco

```bash
npm run db:push
```

### 5. Inicie a Aplicação

#### Linux/macOS:
```bash
./dev.sh
```

#### Windows PowerShell:
```powershell
# Execute uma vez para permitir scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Depois execute:
./dev.ps1
```

#### Windows Command Prompt:
```cmd
dev.bat
```

#### Ou usando npm diretamente:
```bash
npm run dev
```

### 6. Acesse a Aplicação

Abra seu navegador e acesse: `http://localhost:5000`

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/               # Código fonte do frontend
│   └── index.html         # Template HTML
├── server/                # Backend Express
│   ├── auth.ts           # Autenticação
│   ├── db.ts             # Configuração do banco
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   └── storage.ts        # Armazenamento
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema do banco (Drizzle)
├── dev.sh               # Script de desenvolvimento (Linux/macOS)
├── dev.ps1              # Script de desenvolvimento (Windows PS)
├── dev.bat              # Script de desenvolvimento (Windows CMD)
└── package.json         # Dependências e scripts
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run check` - Verifica tipos TypeScript

## 🔧 Variáveis de Ambiente

### Obrigatórias
- `DATABASE_URL` - String de conexão com PostgreSQL

### Configuradas automaticamente pelos scripts
- `NODE_ENV=development` - Ambiente de execução  
- `PORT=5000` - Porta do servidor

### Solucionando Erros Comuns

#### Erro "getaddrinfo ENOTFOUND base"
Este erro ocorre quando a `DATABASE_URL` não está configurada ou está inválida. Para resolver:

1. **Verifique se a DATABASE_URL está definida:**
```bash
# Windows PowerShell
echo $env:DATABASE_URL

# Windows CMD  
echo %DATABASE_URL%

# Linux/macOS
echo $DATABASE_URL
```

2. **Configure corretamente a DATABASE_URL:**
   - Para PostgreSQL local: `postgresql://usuario:senha@localhost:5432/database`
   - Para Neon: `postgresql://usuario:senha@host.neon.tech/database?sslmode=require`

#### Erro "ENOTSUP: operation not supported on socket"
Este erro ocorre em alguns sistemas que não suportam binding em todas as interfaces. Foi corrigido automaticamente - o servidor agora usa `localhost` para desenvolvimento local e `0.0.0.0` apenas no Replit.

#### Script de configuração automatizada (Windows):
```powershell
./setup-db.ps1
```

## 🐳 Docker (Opcional)

Para executar com Docker:

```bash
docker-compose up
```

## 📝 Desenvolvimento

### Banco de Dados
- Utiliza **Drizzle ORM** para gerenciamento do schema
- Schema definido em `shared/schema.ts`
- Migrações aplicadas com `npm run db:push`

### Frontend
- **React 18** com TypeScript
- **Vite** para desenvolvimento e build
- **Tailwind CSS** para estilização
- **Radix UI** para componentes

### Backend
- **Express.js** com TypeScript
- **Passport.js** para autenticação
- **Zod** para validação
- Servido na porta 5000

## 🔒 Segurança

- Separação clara entre cliente e servidor
- Validação de dados com Zod
- Autenticação segura com Passport.js
- Senhas hasheadas com bcrypt

## 📱 Funcionalidades

- Sistema de autenticação completo
- API REST robusta
- Interface responsiva
- Integração com banco PostgreSQL
- Suporte a sessões
- Validação de dados
- Tratamento de erros

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## ⚡ Dicas de Desenvolvimento

- Use os scripts de desenvolvimento apropriados para seu sistema operacional
- As mudanças no código são aplicadas automaticamente (hot reload)
- Logs da API aparecem no terminal durante desenvolvimento
- O frontend é servido juntamente com a API na porta 5000

## 📞 Suporte

Se encontrar problemas:

1. Consulte o [Guia de Desenvolvimento Local](DESENVOLVIMENTO-LOCAL.md)
2. Verifique se todas as dependências estão instaladas
3. Confirme se o PostgreSQL está rodando
4. Verifique se a variável `DATABASE_URL` está configurada
5. Execute `npm run db:push` se houver problemas com o banco

Para mais ajuda, abra uma issue no repositório.

## 📋 Links Úteis

- [Guia Completo de Desenvolvimento Local](DESENVOLVIMENTO-LOCAL.md)
- [Scripts de Desenvolvimento](README-Scripts.md)
- [Neon PostgreSQL](https://neon.tech) (recomendado para desenvolvimento)