# WhatsApp Service

Serviço responsável por gerenciar conexões WhatsApp via Baileys e processar mensagens da fila.

## Arquitetura

### Visão Geral
```
Backend API → RabbitMQ → WhatsApp Service → Baileys → WhatsApp
                ↑                                        ↓
            Respostas ← WhatsApp Service ← Baileys ← WhatsApp
```

### Componentes

#### 1. Connection Manager
- Gerencia conexão Baileys
- Reconexão automática
- Persistência de sessão

#### 2. Message Handler
- Processa mensagens da fila
- Envia mensagens via Baileys
- Trata erros de envio

#### 3. Queue Consumer
- Consome fila RabbitMQ
- Processa jobs de mensagem
- Confirma processamento

#### 4. Event Handler
- Recebe mensagens do WhatsApp
- Envia para fila de respostas
- Processa eventos de conexão

## Ferramentas

### Core
- **Baileys**: Cliente WhatsApp não-oficial
- **RabbitMQ**: Fila de mensagens
- **TypeScript**: Linguagem principal

### Desenvolvimento
- **ESLint**: Linting
- **Prettier**: Formatação
- **Jest**: Testes unitários
- **tsx**: Execução dev

### Dependências
- `@whiskeysockets/baileys`: Cliente WhatsApp
- `amqplib`: Cliente RabbitMQ
- `zod`: Validação de schemas
- `dotenv`: Variáveis de ambiente

## Estrutura do Projeto

```
whatsapp-service/
├── src/
│   ├── connection/         # Gerenciamento Baileys
│   │   ├── manager.ts      # Connection Manager
│   │   └── events.ts       # Event Handlers
│   ├── queue/              # RabbitMQ
│   │   ├── consumer.ts     # Message Consumer
│   │   └── producer.ts     # Message Producer
│   ├── handlers/           # Message Handlers
│   │   ├── message.ts      # Message Handler
│   │   └── response.ts     # Response Handler
│   ├── types/              # Type Definitions
│   │   └── message.ts      # Message Types
│   └── index.ts            # Entry Point
├── tests/                  # Unit Tests
├── docs/                   # Documentation
└── auth_info_baileys/      # Baileys Session (gitignored)
```

## Fluxo de Mensagens

### Envio (Backend → WhatsApp)
1. Backend envia job para fila `whatsapp-send`
2. WhatsApp Service consome job
3. Valida dados da mensagem
4. Envia via Baileys
5. Confirma processamento

### Recebimento (WhatsApp → Backend)
1. Baileys recebe mensagem
2. WhatsApp Service processa evento
3. Envia para fila `whatsapp-received`
4. Backend consome e processa resposta

## Tipos de Mensagem

### Job de Envio
```typescript
interface SendMessageJob {
  phone: string;           // Número com DDI (5511999999999)
  message: string;         // Texto da mensagem
  userId?: string;         // ID do usuário (opcional)
  type: 'daily-check' | 'alert' | 'custom';
}
```

### Resposta Recebida
```typescript
interface ReceivedMessage {
  phone: string;           // Número remetente
  message: string;         // Texto recebido
  timestamp: Date;         // Data/hora
  messageId: string;       // ID da mensagem
}
```

## Configuração

### Variáveis de Ambiente
```env
RABBITMQ_URL=amqp://localhost:5672
WHATSAPP_SESSION_PATH=./auth_info_baileys
NODE_ENV=development
```

### Filas RabbitMQ
- `whatsapp-send`: Jobs de envio
- `whatsapp-received`: Mensagens recebidas
- `whatsapp-status`: Status de conexão

## Próximos Passos

1. ✅ Setup inicial do projeto
2. ⏳ Implementar Connection Manager
3. ⏳ Implementar Queue Consumer
4. ⏳ Implementar Message Handler
5. ⏳ Implementar Event Handler
6. ⏳ Testes unitários
7. ⏳ Integração com Backend
