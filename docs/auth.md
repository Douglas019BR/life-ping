# Autenticação

Sistema de autenticação com suporte a login tradicional (email/senha) e OAuth via Google OpenID Connect.

## Referências
- [Entidades](./entidades.md) - Modelo User
- [Database Schema](./database-schema.md) - Tabela users
- [Critérios de Aceite](./criterios-aceite.md) - Cenários de autenticação

## Métodos de Autenticação

### 1. Login Tradicional
- Email + senha
- Hash bcrypt para senhas
- Access Token (JWT, 15min) + Refresh Token (1 dia)

### 2. OAuth Google (OpenID Connect)
- Fluxo Authorization Code
- Validação e parsing de ID Token
- Criação automática de usuário

## Endpoints

### POST /auth/login
Login com email e senha.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome"
  }
}
```

### POST /auth/refresh
Renovar access token usando refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

### POST /auth/register
Registro de novo usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome Completo"
}
```

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome"
  }
}
```

### POST /auth/google
Inicia fluxo OAuth Google.

**Request:**
```json
{
  "redirectUri": "http://localhost:3001/auth/callback"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?client_id=...",
  "state": "csrf_token"
}
```

### GET /auth/google/callback
Callback do Google OAuth.

**Query Params:**
- `code`: Authorization code
- `state`: CSRF protection

**Processo:**
1. Trocar code por tokens (access_token, id_token)
2. Validar ID Token (assinatura, claims)
3. Extrair dados do usuário (sub, email, name, picture)
4. Criar/atualizar usuário no banco
5. Gerar tokens da aplicação

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome",
    "avatarUrl": "https://..."
  }
}
```

### POST /auth/logout
Logout (invalidar refresh token).

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### GET /auth/me
Dados do usuário autenticado.

**Headers:** `Authorization: Bearer {accessToken}`

## Tokens

### Access Token
- JWT com expiração de 15 minutos
- Contém: userId, email, iat, exp
- Usado em todas as requisições autenticadas

### Refresh Token
- JWT com expiração de 1 dia
- Contém: userId, tokenId, iat, exp
- Armazenado no banco para controle de revogação

## Validação ID Token Google

### Processo de Validação
1. **Verificar assinatura** usando chaves públicas do Google
2. **Validar claims obrigatórios:**
   - `iss`: "https://accounts.google.com"
   - `aud`: CLIENT_ID da aplicação
   - `exp`: Token não expirado
   - `iat`: Issued at válido

### Extração de Dados
```json
{
  "sub": "google_user_id",
  "email": "user@gmail.com",
  "name": "Nome Completo",
  "picture": "https://avatar_url",
  "email_verified": true
}
```

## Modificações no Banco

### Nova Tabela: refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP NULL
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

### Alterações na Tabela users
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

## Configuração OAuth

### Variáveis de Ambiente
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## Middleware de Autenticação

### authMiddleware
Valida access token em rotas protegidas.

```typescript
// Uso em rotas protegidas
app.get('/protected', authMiddleware, handler);
```

## Fluxo OpenID Connect

Ver [diagrama detalhado](./auth-flow.mmd) do fluxo de autenticação OAuth.
