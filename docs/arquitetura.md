# Arquitetura - Life Ping

## Visão Geral

Arquitetura monolítica modular com comunicação assíncrona via filas de mensagens.

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React + TypeScript)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                  (Express + Prisma)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │→ │Controller│→ │ Services │→ │Repository│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────┬────────────────────────────────────────┬───────────┘
         │                                         │
         │ Enqueue Jobs                            │ Database
         ▼                                         ▼
┌─────────────────────┐                  ┌─────────────────┐
│   Redis (BullMQ)    │                  │   PostgreSQL    │
│                     │                  │                 │
│  - send-daily-check │                  │  - users        │
│  - send-alert       │                  │  - contacts     │
│  - process-message  │                  │  - checks       │
└──────┬──────────────┘                  │  - alerts       │
       │                                  └─────────────────┘
       │ Consume Jobs
       ▼
┌─────────────────────────────────────────────────────────────┐
│                   WhatsApp Service                           │
│                      (Baileys)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Queue   │→ │ Services │→ │Connection│                  │
│  │ Consumer │  │          │  │ Manager  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Enqueue Responses
         ▼
┌─────────────────────┐
│   Redis (BullMQ)    │
└─────────────────────┘
         │
         │ Consume
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Scheduler                               │
│                     (Node-cron)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Daily Check Job (runs every minute)                 │   │
│  │  - Query users by check_time                         │   │
│  │  - Enqueue send-daily-check jobs                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos

### 1. Backend API

**Responsabilidades:**
- Autenticação e autorização
- CRUD de usuários e contatos
- Processamento de pagamentos
- Gerenciamento de verificações e alertas
- Enfileiramento de mensagens WhatsApp

**Camadas:**
- **Routes**: Definição de endpoints
- **Controllers**: Validação de entrada, resposta HTTP
- **Services**: Lógica de negócio
- **Repositories**: Acesso ao banco via Prisma
- **Middlewares**: Auth, validação, error handling

**Tecnologias:**
- Express
- Prisma ORM
- Zod (validação)
- JWT (autenticação)

---

### 2. WhatsApp Service

**Responsabilidades:**
- Manter conexão ativa com WhatsApp (Baileys)
- Consumir jobs da fila para enviar mensagens
- Receber mensagens e enfileirar para processamento
- Reconexão automática em caso de falha

**Componentes:**
- **Connection Manager**: Gerencia sessão Baileys
- **Queue Consumer**: Processa jobs de envio
- **Message Handler**: Processa mensagens recebidas
- **Services**: Lógica de envio de mensagens

**Tecnologias:**
- Baileys
- BullMQ (consumer)
- Socket.io (opcional, para status)

---

### 3. Scheduler

**Responsabilidades:**
- Executar cron job a cada minuto
- Buscar usuários com horário de verificação
- Enfileirar jobs de verificação diária

**Tecnologias:**
- Node-cron
- Prisma (query de usuários)
- BullMQ (producer)

---

### 4. Shared

**Responsabilidades:**
- Types e interfaces compartilhadas
- Definições de jobs da fila
- Utilitários comuns

**Conteúdo:**
- Types TypeScript
- Enums
- Constantes
- Helpers

---

## Comunicação via Filas

### Jobs Definidos

#### 1. send-daily-check
```typescript
{
  name: 'send-daily-check',
  data: {
    userId: string,
    checkTime: string
  }
}
```

#### 2. send-alert
```typescript
{
  name: 'send-alert',
  data: {
    alertId: string,
    userId: string,
    emergencyContactIds: string[],
    message: string
  }
}
```

#### 3. process-whatsapp-message
```typescript
{
  name: 'process-whatsapp-message',
  data: {
    from: string,
    message: string,
    timestamp: number
  }
}
```

---

## Fluxos Principais

### Fluxo 1: Verificação Diária

```
1. Scheduler (cron a cada minuto)
   ↓
2. Query users WHERE check_time = current_time
   ↓
3. Para cada user: Enqueue 'send-daily-check'
   ↓
4. WhatsApp Service consume job
   ↓
5. Envia mensagem via Baileys
   ↓
6. Registra daily_check no banco
```

### Fluxo 2: Resposta do Usuário

```
1. WhatsApp Service recebe mensagem
   ↓
2. Enqueue 'process-whatsapp-message'
   ↓
3. Backend consume job
   ↓
4. Identifica tipo (ok/help)
   ↓
5. Se HELP: Cria alert e enqueue 'send-alert'
   ↓
6. WhatsApp Service envia para contatos
```

### Fluxo 3: Alerta Manual

```
1. Usuário envia "AJUDA" a qualquer momento
   ↓
2. WhatsApp Service recebe
   ↓
3. Enqueue 'process-whatsapp-message'
   ↓
4. Backend identifica como alerta
   ↓
5. Cria alert e enqueue 'send-alert'
   ↓
6. WhatsApp Service envia para contatos
```

---

## Banco de Dados

**SGBD**: PostgreSQL 14+

**Conexão**: Via Prisma ORM

**Migrations**: Gerenciadas pelo Prisma

Ver: [Database Schema](./database-schema.md)

---

## Segurança

- Autenticação via JWT
- Validação de entrada com Zod
- Rate limiting nos endpoints
- Sanitização de dados
- HTTPS obrigatório em produção
- Variáveis de ambiente para secrets

---

## Escalabilidade

**Atual (MVP):**
- Monolito modular
- Single instance de cada serviço

**Futuro:**
- Múltiplas instâncias do Backend (load balancer)
- Múltiplas instâncias do WhatsApp Service (sharding por usuário)
- Redis Cluster para filas
- PostgreSQL read replicas

---

## Monitoramento

**Logs:**
- Winston ou Pino
- Structured logging

**Métricas:**
- Mensagens enviadas/recebidas
- Tempo de resposta de APIs
- Taxa de erro de envio

**Alertas:**
- Falha na conexão WhatsApp
- Fila com muitos jobs pendentes
- Erros críticos no backend
