# Life Ping

Sistema automatizado de verificação diária de bem-estar com notificação de emergência via WhatsApp.

## ⚠️ Pendências Técnicas

### OAuth State Cleanup
- **Problema**: Estados OAuth são criados na tabela `oAuthState` com expiração de 15 minutos, mas não há mecanismo de limpeza automática
- **Impacto**: Acúmulo de registros expirados causará bloat no banco de dados
- **Solução**: Implementar job agendado ou trigger para remover estados expirados periodicamente

## Visão Geral

Aplicação que permite aos usuários cadastrarem contatos de emergência e receberem mensagens diárias de verificação de bem-estar. Em caso de necessidade de ajuda, o sistema notifica automaticamente os contatos de emergência cadastrados.

## Stack Tecnológica

- **Backend API**: Node.js + TypeScript + Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 14+
- **Fila de Mensagens**: BullMQ (Redis)
- **Automação WhatsApp**: Baileys
- **Scheduler**: Node-cron
- **Frontend**: React + TypeScript

## Arquitetura

### Visão Geral
Monolito modular com comunicação assíncrona via filas.

### Módulos

#### 1. Backend (API REST)
- Gerenciamento de usuários e cadastros
- Processamento de pagamentos
- Endpoints para frontend
- Enfileiramento de mensagens

#### 2. WhatsApp Service
- Gerenciamento de conexão Baileys
- Envio de mensagens (consumer da fila)
- Recebimento de mensagens (producer para fila)
- Reconexão automática

#### 3. Scheduler
- Cron jobs para verificações diárias
- Enfileiramento de verificações no horário configurado

#### 4. Shared
- Types e interfaces compartilhadas
- Utilitários comuns
- Definições de filas

### Comunicação via Filas

**Jobs:**
- `send-daily-check` - Enviar verificação diária
- `send-alert` - Enviar alerta de emergência
- `process-whatsapp-message` - Processar mensagem recebida

**Fluxo:**
```
Backend → Fila → WhatsApp Service (enviar mensagens)
WhatsApp Service → Fila → Backend (mensagens recebidas)
Scheduler → Fila → WhatsApp Service (verificações diárias)
```

## Documentação

- [Levantamento de Requisitos](./docs/requisitos.md)
- [Histórias de Usuário](./docs/historias-usuario.md)
- [Critérios de Aceite (BDD)](./docs/criterios-aceite.md)
- [Entidades](./docs/entidades.md) | [Diagrama UML](./docs/entidades.mmd)
- [Database Schema](./docs/database-schema.md) | [SQL](./docs/schema.sql)

## Estrutura do Projeto

```
life-ping/
├── docs/                    # Documentação
├── backend/                 # API REST
│   ├── src/
│   │   ├── routes/         # Endpoints
│   │   ├── controllers/    # Request/Response
│   │   ├── services/       # Regras de negócio
│   │   ├── repositories/   # Acesso a dados
│   │   ├── models/         # Entidades/Types
│   │   ├── middlewares/    # Auth, validação
│   │   └── config/         # Configurações
│   ├── prisma/             # Schema e migrations
│   └── package.json
│
├── whatsapp-service/        # Serviço WhatsApp (Baileys)
│   ├── src/
│   │   ├── handlers/       # Mensagens recebidas
│   │   ├── services/       # Envio de mensagens
│   │   ├── queue/          # Consumer da fila
│   │   └── connection/     # Gerenciamento conexão
│   └── package.json
│
├── scheduler/               # Cron jobs
│   ├── src/
│   │   └── jobs/           # Verificações diárias
│   └── package.json
│
├── shared/                  # Código compartilhado
│   ├── types/              # Interfaces comuns
│   ├── utils/              # Funções utilitárias
│   └── queue/              # Definições de filas
│
└── frontend/                # React (futuro)
    └── src/
```

## Instalação e Setup

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### WhatsApp Service
```bash
cd whatsapp-service
npm install
npm run dev
```

### Scheduler
```bash
cd scheduler
npm install
npm run dev
```
