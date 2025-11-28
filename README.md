# Life Ping

Sistema automatizado de verificação diária de bem-estar com notificação de emergência via WhatsApp.

## Visão Geral

Aplicação que permite aos usuários cadastrarem contatos de emergência e receberem mensagens diárias de verificação de bem-estar. Em caso de necessidade de ajuda, o sistema notifica automaticamente os contatos de emergência cadastrados.

## Tecnologias

- **Frontend**: React + TypeScript
- **Backend**: Node.js + TypeScript
- **Automação WhatsApp**: Baileys
- **Banco de Dados**: A definir

## Documentação

- [Levantamento de Requisitos](./docs/requisitos.md)
- [Histórias de Usuário](./docs/historias-usuario.md)
- [Critérios de Aceite (BDD)](./docs/criterios-aceite.md)

## Estrutura do Projeto

```
/
├── docs/              # Documentação
├── frontend/          # Aplicação React
├── backend/           # API e serviços
└── whatsapp-service/  # Serviço de automação WhatsApp
```
