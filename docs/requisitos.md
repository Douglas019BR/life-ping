# Levantamento de Requisitos - Life Ping

## 1. Requisitos Funcionais

### 1.1 Landing Page e Cadastro
- RF001: Sistema deve apresentar uma landing page com informações sobre o serviço
- RF002: Sistema deve permitir cadastro de novos usuários
- RF003: Sistema deve processar pagamento do serviço
- RF004: Sistema deve validar pagamento antes de ativar conta

### 1.2 Dados do Usuário
- RF005: Sistema deve coletar nome do usuário
- RF006: Sistema deve coletar número de WhatsApp do usuário
- RF007: Sistema deve permitir cadastro de 1 a 3 contatos de emergência
- RF008: Sistema deve permitir cadastro de mensagem personalizada de emergência (opcional)
- RF009: Sistema deve permitir definição de horário para verificação diária (padrão: 14:00)

### 1.3 Verificação Diária
- RF010: Sistema deve enviar mensagem diária no horário definido perguntando sobre bem-estar
- RF011: Sistema deve apresentar opções de resposta (está bem / precisa de ajuda)
- RF012: Sistema deve processar resposta do usuário

### 1.4 Alerta de Emergência
- RF013: Sistema deve detectar solicitação de ajuda na verificação diária
- RF014: Sistema deve detectar mensagem de ajuda enviada a qualquer momento
- RF015: Sistema deve enviar mensagem personalizada (se cadastrada) ou mensagem padrão para todos os contatos de emergência
- RF016: Sistema deve registrar todos os alertas de emergência

## 2. Requisitos Não Funcionais

### 2.1 Performance
- RNF001: Sistema deve enviar mensagens de emergência em até 30 segundos
- RNF002: Sistema deve processar verificações diárias com precisão de ±5 minutos

### 2.2 Segurança
- RNF003: Dados de pagamento devem ser processados de forma segura
- RNF004: Dados pessoais devem ser armazenados com criptografia
- RNF005: Acesso ao sistema deve ser autenticado

### 2.3 Disponibilidade
- RNF006: Sistema deve ter disponibilidade de 99.5%
- RNF007: Serviço de WhatsApp deve reconectar automaticamente em caso de falha

### 2.4 Usabilidade
- RNF008: Interface deve ser responsiva e mobile-friendly
- RNF009: Processo de cadastro deve ser simples e intuitivo

## 3. Regras de Negócio

- RN001: Usuário só pode ativar conta após confirmação de pagamento
- RN002: Mínimo de 1 e máximo de 3 contatos de emergência
- RN003: Mensagem personalizada é opcional
- RN004: Horário de verificação padrão é 14:00 (usuário pode personalizar)
- RN005: Alertas de emergência têm prioridade máxima no sistema

## 4. Integrações

- WhatsApp via biblioteca Baileys
- Gateway de pagamento (a definir)
- Banco de dados para persistência

## 5. Fluxos Principais

### 5.1 Fluxo de Cadastro
1. Usuário acessa landing page
2. Usuário preenche formulário de cadastro
3. Usuário realiza pagamento
4. Sistema valida pagamento
5. Sistema salva dados no banco
6. Sistema ativa conta

### 5.2 Fluxo de Verificação Diária
1. Sistema envia mensagem no horário definido (padrão 14:00)
2. Usuário responde que está bem → Sistema registra resposta
3. Usuário responde que precisa de ajuda → Sistema aciona emergência

### 5.3 Fluxo de Emergência
1. Sistema detecta solicitação de ajuda
2. Sistema busca contatos de emergência e mensagem personalizada (ou usa padrão)
3. Sistema envia mensagem para todos os contatos
4. Sistema registra alerta no banco de dados
