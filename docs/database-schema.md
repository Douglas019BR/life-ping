# Database Schema - Life Ping

## Banco de Dados

**SGBD sugerido**: PostgreSQL 14+

---

## Tabelas

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL UNIQUE,
  custom_message TEXT,
  check_time TIME NOT NULL DEFAULT '14:00:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'confirmed', 'failed'))
);

CREATE INDEX idx_users_whatsapp ON users(whatsapp);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_check_time ON users(check_time) WHERE is_active = true;
```

---

### emergency_contacts

```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  "order" INTEGER NOT NULL CHECK ("order" BETWEEN 1 AND 3),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, "order")
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
```

---

### daily_checks

```sql
CREATE TABLE daily_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMP NOT NULL,
  response VARCHAR(20),
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_response CHECK (response IN ('ok', 'help', 'no_response')),
  UNIQUE(user_id, DATE(sent_at))
);

CREATE INDEX idx_daily_checks_user_id ON daily_checks(user_id);
CREATE INDEX idx_daily_checks_sent_at ON daily_checks(sent_at);
```

---

### alerts

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_type VARCHAR(20) NOT NULL,
  message_sent TEXT NOT NULL,
  triggered_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_trigger_type CHECK (trigger_type IN ('daily_check', 'manual'))
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at);
```

---

### alert_notifications

```sql
CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  emergency_contact_id UUID NOT NULL REFERENCES emergency_contacts(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_status CHECK (status IN ('sent', 'failed', 'pending'))
);

CREATE INDEX idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_status ON alert_notifications(status);
```

---

## Script de Criação Completo

Ver: [schema.sql](./schema.sql)

---

## Índices

| Tabela | Índice | Propósito |
|--------|--------|-----------|
| users | idx_users_whatsapp | Busca rápida por número |
| users | idx_users_is_active | Filtro de usuários ativos |
| users | idx_users_check_time | Busca por horário de verificação |
| emergency_contacts | idx_emergency_contacts_user_id | Join com users |
| daily_checks | idx_daily_checks_user_id | Join com users |
| daily_checks | idx_daily_checks_sent_at | Busca por data |
| alerts | idx_alerts_user_id | Join com users |
| alerts | idx_alerts_triggered_at | Busca por data |
| alert_notifications | idx_alert_notifications_alert_id | Join com alerts |
| alert_notifications | idx_alert_notifications_status | Filtro por status |

---

## Constraints

### Chaves Primárias
- Todas as tabelas usam UUID como PK

### Chaves Estrangeiras
- `emergency_contacts.user_id` → `users.id` (CASCADE)
- `daily_checks.user_id` → `users.id` (CASCADE)
- `alerts.user_id` → `users.id` (CASCADE)
- `alert_notifications.alert_id` → `alerts.id` (CASCADE)
- `alert_notifications.emergency_contact_id` → `emergency_contacts.id` (CASCADE)

### Unique Constraints
- `users.whatsapp` - Número único por usuário
- `emergency_contacts(user_id, order)` - Ordem única por usuário
- `daily_checks(user_id, DATE(sent_at))` - Uma verificação por dia

### Check Constraints
- `users.payment_status` IN ('pending', 'confirmed', 'failed')
- `emergency_contacts.order` BETWEEN 1 AND 3
- `daily_checks.response` IN ('ok', 'help', 'no_response')
- `alerts.trigger_type` IN ('daily_check', 'manual')
- `alert_notifications.status` IN ('sent', 'failed', 'pending')

---

## Considerações

- **Timezone**: Armazenar timestamps em UTC
- **Soft Delete**: Não implementado (usar `is_active` em users)
- **Auditoria**: Campos `created_at` e `updated_at`
- **Cascata**: DELETE CASCADE para manter integridade
