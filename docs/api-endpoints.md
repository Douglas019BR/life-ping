# API Endpoints - Life Ping

## Base URL
```
http://localhost:3000
```

## Health Checks

### GET /health
Verifica se a API está funcionando.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T19:30:00.000Z"
}
```

### GET /health/db
Verifica conectividade com o banco de dados.

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Users

### POST /users
Cria um novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "whatsapp": "11999999999",
  "checkTime": "14:00",
  "customMessage": "Mensagem personalizada (opcional)"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "whatsapp": "11999999999",
  "checkTime": "14:00",
  "customMessage": "Mensagem personalizada",
  "isActive": true,
  "paymentStatus": "pending",
  "createdAt": "2025-12-10T19:30:00.000Z",
  "updatedAt": "2025-12-10T19:30:00.000Z"
}
```

### GET /users
Lista todos os usuários.

### GET /users/:id
Busca usuário por ID.

### PUT /users/:id
Atualiza usuário.

### DELETE /users/:id
Remove usuário.

## Emergency Contacts

### POST /emergency-contacts
Cria um novo contato de emergência.

**Request Body:**
```json
{
  "userId": "uuid",
  "name": "Maria Silva",
  "whatsapp": "11888888888",
  "order": 1
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Maria Silva",
  "whatsapp": "11888888888",
  "order": 1,
  "createdAt": "2025-12-10T19:30:00.000Z",
  "updatedAt": "2025-12-10T19:30:00.000Z"
}
```

### GET /emergency-contacts
Lista todos os contatos de emergência.

### GET /emergency-contacts/:id
Busca contato por ID.

### GET /emergency-contacts/user/:userId
Lista contatos de emergência de um usuário específico.

### PUT /emergency-contacts/:id
Atualiza um contato de emergência.

**Request Body:**
```json
{
  "name": "Maria Santos",
  "whatsapp": "11777777777",
  "order": 2
}
```

### PUT /emergency-contacts/bulk
Atualiza múltiplos contatos de emergência em uma operação.

**Request Body:**
```json
{
  "contacts": [
    {
      "id": "uuid-1",
      "name": "Contato 1",
      "whatsapp": "11111111111",
      "order": 1
    },
    {
      "id": "uuid-2",
      "order": 2
    },
    {
      "id": "uuid-3",
      "order": 3
    }
  ]
}
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "userId": "uuid",
    "name": "Contato 1",
    "whatsapp": "11111111111",
    "order": 1,
    "createdAt": "2025-12-10T19:30:00.000Z",
    "updatedAt": "2025-12-10T19:30:00.000Z"
  }
]
```

### DELETE /emergency-contacts/:id
Remove contato de emergência.

## Validações

### Users
- `name`: mínimo 3 caracteres, máximo 255
- `whatsapp`: 10-15 dígitos, único no sistema
- `checkTime`: formato HH:mm
- `customMessage`: máximo 500 caracteres (opcional)

### Emergency Contacts
- `name`: mínimo 3 caracteres, máximo 255
- `whatsapp`: 10-15 dígitos
- `order`: 1, 2 ou 3 (único por usuário)
- Máximo 3 contatos por usuário

## Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `404` - Not Found (recurso não encontrado)
- `409` - Conflict (WhatsApp duplicado, ordem duplicada)
- `500` - Internal Server Error

## Exemplos de Erro

```json
{
  "message": "WhatsApp number is already registered.",
  "statusCode": 409
}
```

```json
{
  "message": "Emergency contact with this order already exists.",
  "statusCode": 409
}
```
