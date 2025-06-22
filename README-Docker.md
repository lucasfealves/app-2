# Docker Setup

Este projeto pode ser executado usando Docker e Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Como executar

### 1. Usando Docker Compose (Recomendado)

```bash
# Construir e executar os containers
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Parar os containers
docker-compose down

# Limpar volumes (reset do banco de dados)
docker-compose down -v
```

### 2. Usando Docker apenas

```bash
# Construir a imagem
docker build -t ecommerce-app .

# Executar com banco PostgreSQL externo
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e JWT_SECRET="your-jwt-secret" \
  -e SESSION_SECRET="your-session-secret" \
  ecommerce-app
```

## Variáveis de Ambiente

### Obrigatórias

- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para tokens JWT
- `SESSION_SECRET`: Chave secreta para sessões

### Opcionais

- `NODE_ENV`: Ambiente (production/development)
- `PORT`: Porta do servidor (padrão: 5000)
- `HOST`: Host do servidor (padrão: 0.0.0.0)

## Estrutura dos Containers

### App Container
- **Porta**: 5000
- **Usuário**: nodejs (non-root)
- **Volumes**: uploads para arquivos estáticos

### Database Container
- **Imagem**: postgres:15-alpine
- **Porta**: 5432
- **Volume**: dados persistentes em `postgres_data`

## Desenvolvimento

Para desenvolvimento com hot-reload:

```bash
# Executar apenas o banco
docker-compose up db -d

# Configurar DATABASE_URL para localhost:5432
export DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce"

# Executar a aplicação localmente
npm run dev
```

## Logs

```bash
# Ver logs dos containers
docker-compose logs

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs app
docker-compose logs db
```

## Problemas Comuns

### Database Connection Failed
- Verifique se o container do banco está rodando
- Confirme as credenciais no docker-compose.yml
- Aguarde alguns segundos para o banco inicializar

### Port Already in Use
```bash
# Verificar processos usando a porta 5000
lsof -i :5000

# Parar containers existentes
docker-compose down
```

### Reset Complete
```bash
# Remover tudo e começar do zero
docker-compose down -v
docker system prune -f
docker-compose up --build
```