# Authentication API

## Endpoints

### POST /auth/login
Autentica usuário com email e senha.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### POST /auth/register
Registra novo usuário via email/senha.

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "whatsapp": "5511999999999"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "whatsapp": "5511999999999"
  }
}
```

### POST /auth/refresh
Renova access token usando refresh token válido.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Apenas o access token é renovado. O refresh token permanece o mesmo até expirar (1 dia).

### POST /auth/logout
Invalida refresh token do usuário.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** 204 No Content

### POST /auth/google
Inicia fluxo OAuth do Google.

**Request:**
```json
{
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?...",
  "state": "random-state-string"
}
```

### GET /auth/google/callback
Processa callback do OAuth Google.

**Query Parameters:**
- `code`: Authorization code do Google
- `state`: State parameter para proteção CSRF

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "whatsapp": null
  }
}
```

**Note:** Usuários do Google OAuth precisam completar onboarding adicionando WhatsApp via `/users/complete-onboarding`.

## User Onboarding

### POST /users/complete-onboarding
Completa onboarding adicionando WhatsApp (usuários Google OAuth).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "whatsapp": "5511999999999"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "whatsapp": "5511999999999"
}
```

## Token Configuration

### Access Token
- **Expiration:** 15 minutes
- **Usage:** Authorization header: `Bearer <token>`
- **Contains:** userId, email

### Refresh Token
- **Expiration:** 1 day
- **Usage:** Refresh endpoint only
- **Storage:** Hashed in database
- **Security:** One-time use validation with bcrypt

## Rate Limiting

### Login Endpoint
- **Limit:** 5 attempts per IP
- **Window:** 15 minutes
- **Response:** 429 Too Many Requests

## Error Responses

All endpoints return errors in the format:
```json
{
  "message": "Error description",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/tokens)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
