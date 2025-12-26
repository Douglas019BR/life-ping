# Formato das Mensagens

Documentação dos formatos de dados trafegados entre Backend e WhatsApp Service.

## Jobs de Envio (Backend → WhatsApp Service)

### Fila: `whatsapp-send`

#### Verificação Diária
```typescript
{
  type: 'daily-check',
  phone: '5511999999999',
  message: 'Olá! Como você está se sentindo hoje? Responda: BEM, MAL ou EMERGÊNCIA',
  userId: 'uuid-do-usuario',
  metadata: {
    checkId: 'uuid-da-verificacao',
    scheduledAt: '2024-01-15T14:00:00Z'
  }
}
```

#### Alerta de Emergência
```typescript
{
  type: 'alert',
  phone: '5511888888888',
  message: 'ALERTA: João Silva pode precisar de ajuda. Última resposta: MAL em 14/01 às 14:00. Contato: (11) 99999-9999',
  userId: 'uuid-do-usuario',
  metadata: {
    emergencyContactId: 'uuid-do-contato',
    originalUserId: 'uuid-usuario-original',
    alertLevel: 'high'
  }
}
```

#### Mensagem Personalizada
```typescript
{
  type: 'custom',
  phone: '5511777777777',
  message: 'Sua mensagem personalizada aqui',
  userId: 'uuid-do-usuario',
  metadata: {
    campaignId?: 'uuid-da-campanha',
    templateId?: 'uuid-do-template'
  }
}
```

## Mensagens Recebidas (WhatsApp Service → Backend)

### Fila: `whatsapp-received`

#### Resposta de Verificação
```typescript
{
  phone: '5511999999999',
  message: 'BEM',
  timestamp: '2024-01-15T14:05:30Z',
  messageId: 'whatsapp-message-id',
  type: 'response',
  metadata: {
    isFromUser: true,
    quotedMessageId?: 'id-mensagem-original'
  }
}
```

#### Mensagem Não Reconhecida
```typescript
{
  phone: '5511999999999',
  message: 'Oi, como faço para me cadastrar?',
  timestamp: '2024-01-15T15:30:00Z',
  messageId: 'whatsapp-message-id',
  type: 'unknown',
  metadata: {
    isFromUser: false,
    needsResponse: true
  }
}
```

## Status de Conexão

### Fila: `whatsapp-status`

#### Conexão Estabelecida
```typescript
{
  status: 'connected',
  timestamp: '2024-01-15T10:00:00Z',
  sessionId: 'baileys-session-id',
  phoneNumber: '5511999999999'
}
```

#### Desconectado
```typescript
{
  status: 'disconnected',
  timestamp: '2024-01-15T10:30:00Z',
  reason: 'connection_lost',
  willReconnect: true
}
```

#### QR Code (Primeira Conexão)
```typescript
{
  status: 'qr_code',
  timestamp: '2024-01-15T09:00:00Z',
  qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  expiresIn: 60000 // ms
}
```

## Schemas de Validação

### SendMessageJob Schema
```typescript
const SendMessageJobSchema = z.object({
  type: z.enum(['daily-check', 'alert', 'custom']),
  phone: z.string().regex(/^55\d{10,11}$/),
  message: z.string().min(1).max(4096),
  userId: z.string().uuid().optional(),
  metadata: z.object({
    checkId: z.string().uuid().optional(),
    emergencyContactId: z.string().uuid().optional(),
    originalUserId: z.string().uuid().optional(),
    alertLevel: z.enum(['low', 'medium', 'high']).optional(),
    scheduledAt: z.string().datetime().optional(),
    campaignId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional()
  }).optional()
});
```

### ReceivedMessage Schema
```typescript
const ReceivedMessageSchema = z.object({
  phone: z.string().regex(/^55\d{10,11}$/),
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  messageId: z.string().min(1),
  type: z.enum(['response', 'unknown']),
  metadata: z.object({
    isFromUser: z.boolean(),
    needsResponse: z.boolean().optional(),
    quotedMessageId: z.string().optional()
  }).optional()
});
```

## Tratamento de Erros

### Erro de Envio
```typescript
{
  type: 'send_error',
  originalJob: SendMessageJob,
  error: {
    code: 'PHONE_NOT_FOUND',
    message: 'Número não encontrado no WhatsApp',
    timestamp: '2024-01-15T14:00:00Z'
  },
  retryCount: 2,
  willRetry: false
}
```

### Códigos de Erro Comuns
- `PHONE_NOT_FOUND`: Número não existe no WhatsApp
- `MESSAGE_TOO_LONG`: Mensagem excede limite
- `RATE_LIMITED`: Muitas mensagens enviadas
- `CONNECTION_LOST`: Conexão perdida
- `INVALID_FORMAT`: Formato de número inválido
