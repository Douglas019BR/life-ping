# Life Ping Backend

API REST do Life Ping.

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas configurações (DATABASE_URL com sua senha do PostgreSQL)
```

### 3. Gerar Prisma Client
```bash
npm run prisma:generate
```

### 4. Executar migrations
```bash
npm run prisma:migrate
```

### 5. Iniciar servidor
```bash
npm run dev
```

## Scripts

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:studio` - Abre Prisma Studio

## Endpoints

### Health Check
- `GET /health` - Status do servidor
- `GET /health/db` - Status da conexão com banco

### Authentication
Ver [Authentication API Documentation](./docs/auth-api.md) para detalhes completos.

- `POST /auth/login` - Login com email/senha
- `POST /auth/register` - Registro de usuário
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout
- `POST /auth/google` - Iniciar OAuth Google
- `GET /auth/google/callback` - Callback OAuth Google

## Estrutura

```
src/
├── config/         # Configurações
├── routes/         # Rotas
├── controllers/    # Controllers
├── services/       # Lógica de negócio
├── repositories/   # Acesso a dados
├── models/         # Types
└── middlewares/    # Middlewares
```
