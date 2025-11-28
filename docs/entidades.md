# Entidades - Life Ping

## Diagrama UML

Ver diagrama completo em: [entidades.mmd](./entidades.mmd)

---

## Descrição das Entidades

### 1. User
Representa o usuário/cliente cadastrado no sistema.

**Campos principais:**
- `id`: Identificador único
- `name`: Nome completo do usuário
- `whatsapp`: Número de WhatsApp (único no sistema)
- `customMessage`: Mensagem personalizada para emergências (opcional)
- `checkTime`: Horário da verificação diária (padrão: 14:00)
- `isActive`: Indica se a conta está ativa
- `paymentStatus`: Status do pagamento (pending/confirmed/failed)

**Relacionamentos:**
- Possui de 1 a 3 contatos de emergência
- Recebe múltiplas verificações diárias (histórico)
- Pode acionar múltiplos alertas

---

### 2. EmergencyContact
Contatos que serão notificados em caso de emergência.

**Campos principais:**
- `userId`: Referência ao usuário dono do contato
- `name`: Nome do contato
- `whatsapp`: Número de WhatsApp do contato
- `order`: Ordem do contato (1, 2 ou 3)

**Regras:**
- Cada usuário deve ter no mínimo 1 e no máximo 3 contatos
- O campo `order` identifica a posição do contato

**Relacionamentos:**
- Pertence a um usuário
- Recebe notificações de alertas

---

### 3. DailyCheck
Registro das verificações diárias enviadas aos usuários.

**Campos principais:**
- `userId`: Referência ao usuário
- `sentAt`: Data/hora do envio da verificação
- `response`: Resposta do usuário (ok/help/no_response)
- `respondedAt`: Data/hora da resposta

**Regras:**
- Um registro por dia por usuário
- `response` é null até o usuário responder
- Se usuário não responder, pode ser marcado como `no_response`

**Relacionamentos:**
- Pertence a um usuário

---

### 4. Alert
Registro de alertas de emergência acionados.

**Campos principais:**
- `userId`: Referência ao usuário que acionou
- `triggerType`: Como foi acionado (daily_check/manual)
- `messageSent`: Mensagem enviada aos contatos
- `triggeredAt`: Data/hora do acionamento

**Regras:**
- `triggerType = daily_check`: Acionado pela verificação diária
- `triggerType = manual`: Acionado por mensagem do usuário
- `messageSent`: Armazena a mensagem personalizada ou padrão

**Relacionamentos:**
- Pertence a um usuário
- Gera múltiplas notificações (uma para cada contato)

---

### 5. AlertNotification
Registro individual de cada notificação enviada aos contatos.

**Campos principais:**
- `alertId`: Referência ao alerta
- `emergencyContactId`: Referência ao contato que recebeu
- `status`: Status do envio (pending/sent/failed)
- `sentAt`: Data/hora do envio bem-sucedido
- `errorMessage`: Mensagem de erro (se falhou)
- `retryCount`: Número de tentativas de reenvio

**Regras:**
- Uma notificação por contato por alerta
- Permite rastreamento de falhas e retentativas
- Status `pending` → tentando enviar
- Status `sent` → enviado com sucesso
- Status `failed` → falhou após retentativas

**Relacionamentos:**
- Pertence a um alerta
- Referencia um contato de emergência

---

## Enumerações

### PaymentStatus
- `PENDING`: Pagamento pendente
- `CONFIRMED`: Pagamento confirmado
- `FAILED`: Pagamento falhou

### ResponseType
- `OK`: Usuário está bem
- `HELP`: Usuário precisa de ajuda
- `NO_RESPONSE`: Usuário não respondeu

### TriggerType
- `DAILY_CHECK`: Alerta acionado pela verificação diária
- `MANUAL`: Alerta acionado por mensagem manual do usuário

### NotificationStatus
- `PENDING`: Aguardando envio
- `SENT`: Enviado com sucesso
- `FAILED`: Falha no envio
