# Critérios de Aceite (BDD/Gherkin) - Life Ping

## US001 - Visualizar Landing Page

```gherkin
Feature: Visualizar Landing Page
  Como visitante
  Quero visualizar informações sobre o serviço
  Para entender como funciona

  Scenario: Acessar landing page com sucesso
    Given que sou um visitante
    When acesso a URL do Life Ping
    Then devo ver a landing page
    And devo ver informações sobre o serviço
    And devo ver um botão de cadastro

  Scenario: Visualizar benefícios do serviço
    Given que estou na landing page
    When rolo a página
    Then devo ver os benefícios do serviço
    And devo ver como funciona o sistema
    And devo ver informações de preço
```

---

## US002 - Realizar Cadastro

```gherkin
Feature: Realizar Cadastro
  Como cliente
  Quero preencher formulário com meus dados
  Para criar minha conta

  Scenario: Preencher formulário de cadastro com dados válidos
    Given que estou na página de cadastro
    When preencho o campo "nome" com "João Silva"
    And preencho o campo "whatsapp" com "5511999999999"
    And preencho o campo "contato emergência 1" com "Maria Silva - 5511988888888"
    And clico em "Continuar para pagamento"
    Then devo ser redirecionado para a página de pagamento

  Scenario: Cadastrar sem mensagem personalizada
    Given que estou na página de cadastro
    When preencho todos os campos obrigatórios
    And deixo o campo "mensagem personalizada" vazio
    And clico em "Continuar para pagamento"
    Then devo ser redirecionado para a página de pagamento
    And o sistema deve usar mensagem padrão

  Scenario: Cadastrar sem definir horário de verificação
    Given que estou na página de cadastro
    When preencho todos os campos obrigatórios
    And não seleciono horário de verificação
    And clico em "Continuar para pagamento"
    Then devo ser redirecionado para a página de pagamento
    And o sistema deve usar horário padrão "14:00"

  Scenario: Tentar cadastrar sem preencher campos obrigatórios
    Given que estou na página de cadastro
    When deixo o campo "nome" vazio
    And clico em "Continuar para pagamento"
    Then devo ver mensagem de erro "Nome é obrigatório"
    And não devo ser redirecionado

  Scenario: Cadastrar com número mínimo de contatos de emergência
    Given que estou na página de cadastro
    When preencho todos os campos obrigatórios
    And adiciono apenas 1 contato de emergência
    And clico em "Continuar para pagamento"
    Then devo ser redirecionado para a página de pagamento

  Scenario: Tentar cadastrar com mais de 3 contatos de emergência
    Given que estou na página de cadastro
    When preencho todos os campos obrigatórios
    And tento adicionar o 4º contato de emergência
    Then o botão "Adicionar contato" deve estar desabilitado
    And devo ver mensagem "Máximo de 3 contatos permitidos"

  Scenario: Validar formato de número de WhatsApp
    Given que estou na página de cadastro
    When preencho o campo "whatsapp" com "123"
    And saio do campo
    Then devo ver mensagem de erro "Número de WhatsApp inválido"
```

---

## US003 - Realizar Pagamento

```gherkin
Feature: Realizar Pagamento
  Como cliente
  Quero realizar pagamento do serviço
  Para ativar minha conta

  Scenario: Realizar pagamento com sucesso
    Given que preenchi o formulário de cadastro
    And estou na página de pagamento
    When preencho os dados de pagamento válidos
    And clico em "Confirmar pagamento"
    Then o pagamento deve ser processado
    And devo ver mensagem "Pagamento confirmado"
    And minha conta deve ser ativada
    And meus dados devem ser salvos no banco de dados

  Scenario: Pagamento recusado
    Given que estou na página de pagamento
    When preencho dados de pagamento inválidos
    And clico em "Confirmar pagamento"
    Then devo ver mensagem "Pagamento recusado"
    And minha conta não deve ser ativada
    And devo poder tentar novamente

  Scenario: Salvar dados após confirmação de pagamento
    Given que meu pagamento foi confirmado
    When o sistema processa a confirmação
    Then meus dados devem ser salvos no banco de dados
    And devo receber uma mensagem de boas-vindas no WhatsApp
    And o serviço de verificação diária deve ser ativado
```

---

## US005 - Receber Verificação Diária

```gherkin
Feature: Receber Verificação Diária
  Como usuário cadastrado
  Quero receber mensagem diária no horário escolhido
  Para confirmar que estou bem

  Scenario: Receber verificação no horário configurado
    Given que sou um usuário cadastrado
    And configurei o horário de verificação para "09:00"
    When o relógio do sistema marca "09:00"
    Then devo receber uma mensagem no WhatsApp
    And a mensagem deve perguntar "Olá! Você está bem?"
    And a mensagem deve ter opções de resposta

  Scenario: Receber verificação no horário padrão
    Given que sou um usuário cadastrado
    And não configurei horário personalizado
    When o relógio do sistema marca "14:00"
    Then devo receber uma mensagem no WhatsApp
    And a mensagem deve perguntar "Olá! Você está bem?"

  Scenario: Sistema envia verificação todos os dias
    Given que sou um usuário cadastrado
    And recebi verificação hoje
    When chega o próximo dia no horário configurado
    Then devo receber nova mensagem de verificação

  Scenario: Não receber verificação se conta estiver inativa
    Given que sou um usuário cadastrado
    And minha conta está inativa
    When chega o horário de verificação
    Then não devo receber mensagem de verificação
```

---

## US006 - Responder que Estou Bem

```gherkin
Feature: Responder que Estou Bem
  Como usuário cadastrado
  Quero responder que estou bem
  Para que o sistema registre minha resposta

  Scenario: Responder positivamente à verificação
    Given que recebi a mensagem de verificação diária
    When clico na opção "Estou bem"
    Then devo receber confirmação "Ótimo! Até amanhã!"
    And minha resposta deve ser registrada no sistema
    And nenhum alerta deve ser enviado

  Scenario: Não responder à verificação
    Given que recebi a mensagem de verificação diária
    When não respondo em 2 horas
    Then o sistema deve registrar "sem resposta"
    And nenhum alerta deve ser enviado automaticamente
```

---

## US007 - Solicitar Ajuda na Verificação

```gherkin
Feature: Solicitar Ajuda na Verificação
  Como usuário cadastrado
  Quero responder que preciso de ajuda
  Para que meus contatos sejam notificados

  Scenario: Solicitar ajuda na verificação diária
    Given que recebi a mensagem de verificação diária
    When clico na opção "Preciso de ajuda"
    Then devo receber confirmação "Seus contatos estão sendo notificados"
    And o sistema deve acionar o alerta de emergência
    And meus contatos de emergência devem receber a mensagem personalizada ou padrão

  Scenario: Registrar alerta no sistema
    Given que solicitei ajuda na verificação
    When o sistema processa minha solicitação
    Then um registro de alerta deve ser criado no banco de dados
    And o registro deve conter data, hora e tipo "verificação diária"
```

---

## US008 - Enviar Alerta a Qualquer Momento

```gherkin
Feature: Enviar Alerta a Qualquer Momento
  Como usuário cadastrado
  Quero enviar mensagem de ajuda a qualquer momento
  Para acionar contatos de emergência quando precisar

  Scenario: Enviar palavra-chave de emergência
    Given que sou um usuário cadastrado
    When envio a mensagem "AJUDA" para o número do Life Ping
    Then o sistema deve reconhecer como alerta de emergência
    And devo receber confirmação imediata
    And meus contatos de emergência devem ser notificados

  Scenario: Enviar alerta fora do horário de verificação
    Given que sou um usuário cadastrado
    And não é horário de verificação diária
    When envio mensagem de emergência às "15:30"
    Then o sistema deve processar o alerta imediatamente
    And meus contatos devem receber a notificação em até 30 segundos

  Scenario: Validar que usuário está cadastrado
    Given que envio mensagem de emergência
    And meu número não está cadastrado no sistema
    When o sistema processa a mensagem
    Then não devo acionar nenhum alerta
    And devo receber mensagem "Número não cadastrado"
```

---

## US009 - Notificar Contatos de Emergência

```gherkin
Feature: Notificar Contatos de Emergência
  Como usuário cadastrado
  Quero que meus contatos recebam mensagem personalizada ou padrão
  Para que saibam que preciso de ajuda

  Scenario: Enviar mensagem personalizada para todos os contatos
    Given que acionei um alerta de emergência
    And tenho 3 contatos de emergência cadastrados
    And tenho mensagem personalizada cadastrada
    When o sistema processa o alerta
    Then todos os 3 contatos devem receber minha mensagem personalizada
    And a mensagem deve incluir meu nome
    And a mensagem deve incluir data e hora do alerta

  Scenario: Enviar mensagem padrão quando não há personalizada
    Given que acionei um alerta de emergência
    And não cadastrei mensagem personalizada
    When o sistema processa o alerta
    Then meus contatos devem receber mensagem padrão
    And a mensagem deve incluir meu nome
    And a mensagem deve indicar que preciso de ajuda

  Scenario: Formato da mensagem de emergência personalizada
    Given que acionei um alerta de emergência
    And minha mensagem personalizada é "Preciso de ajuda urgente!"
    And meu nome é "João Silva"
    When o sistema envia para os contatos
    Then a mensagem deve ser:
      """
      🚨 ALERTA DE EMERGÊNCIA - Life Ping
      
      João Silva precisa de ajuda!
      
      Mensagem: Preciso de ajuda urgente!
      
      Data/Hora: [timestamp]
      """

  Scenario: Formato da mensagem de emergência padrão
    Given que acionei um alerta de emergência
    And não tenho mensagem personalizada
    And meu nome é "João Silva"
    When o sistema envia para os contatos
    Then a mensagem deve ser:
      """
      🚨 ALERTA DE EMERGÊNCIA - Life Ping
      
      João Silva precisa de ajuda!
      
      Por favor, entre em contato o mais rápido possível.
      
      Data/Hora: [timestamp]
      """

  Scenario: Falha ao enviar para um contato
    Given que acionei um alerta de emergência
    And tenho 2 contatos de emergência
    When o envio falha para 1 contato
    Then o sistema deve continuar enviando para os outros contatos
    And deve registrar a falha no log
    And deve tentar reenviar após 1 minuto
```

---

## US010 - Receber Alerta de Emergência

```gherkin
Feature: Receber Alerta de Emergência
  Como contato de emergência
  Quero receber mensagem quando alguém precisar de ajuda
  Para poder auxiliar rapidamente

  Scenario: Receber alerta como contato de emergência
    Given que sou contato de emergência de "João Silva"
    When João aciona um alerta de emergência
    Then devo receber uma mensagem no WhatsApp
    And a mensagem deve indicar que é um alerta de emergência
    And a mensagem deve conter a mensagem personalizada ou padrão de João
    And a mensagem deve conter data e hora do alerta

  Scenario: Receber múltiplos alertas do mesmo usuário
    Given que sou contato de emergência de "João Silva"
    And já recebi um alerta hoje
    When João aciona outro alerta
    Then devo receber a nova mensagem de alerta
    And ambos os alertas devem ser registrados separadamente
```

---

## US011 - Editar Dados Cadastrais

```gherkin
Feature: Editar Dados Cadastrais
  Como usuário cadastrado
  Quero editar meus dados
  Para manter informações atualizadas

  Scenario: Acessar página de edição
    Given que sou um usuário autenticado
    When acesso a página "Minha Conta"
    Then devo ver meus dados cadastrais atuais
    And devo poder editar cada campo

  Scenario: Atualizar nome com sucesso
    Given que estou na página de edição
    When altero o campo "nome" para "João Pedro Silva"
    And clico em "Salvar alterações"
    Then devo ver mensagem "Dados atualizados com sucesso"
    And meu nome deve ser atualizado no banco de dados

  Scenario: Validar dados ao editar
    Given que estou na página de edição
    When tento salvar o campo "whatsapp" vazio
    Then devo ver mensagem de erro "WhatsApp é obrigatório"
    And as alterações não devem ser salvas
```

---

## US012 - Alterar Horário de Verificação

```gherkin
Feature: Alterar Horário de Verificação
  Como usuário cadastrado
  Quero alterar horário da verificação diária
  Para adequar à minha rotina

  Scenario: Alterar horário com sucesso
    Given que meu horário atual é "14:00"
    When altero para "09:00"
    And clico em "Salvar"
    Then devo ver mensagem "Horário atualizado"
    And a partir de amanhã devo receber verificação às "09:00"

  Scenario: Restaurar horário padrão
    Given que meu horário atual é "09:00"
    When clico em "Usar horário padrão"
    And confirmo a ação
    Then meu horário deve ser alterado para "14:00"
    And devo ver mensagem "Horário restaurado para padrão (14:00)"

  Scenario: Validar formato de horário
    Given que estou alterando o horário
    When seleciono um horário inválido
    Then devo ver mensagem de erro
    And o horário não deve ser alterado
```

---

## US013 - Gerenciar Contatos de Emergência

```gherkin
Feature: Gerenciar Contatos de Emergência
  Como usuário cadastrado
  Quero gerenciar meus contatos de emergência
  Para manter rede de apoio atualizada

  Scenario: Adicionar novo contato de emergência
    Given que tenho 1 contato de emergência cadastrado
    When clico em "Adicionar contato"
    And preencho "Maria Santos - 5511977777777"
    And clico em "Salvar"
    Then devo ter 2 contatos de emergência
    And o novo contato deve ser salvo no banco de dados

  Scenario: Editar contato existente
    Given que tenho contatos cadastrados
    When clico em "Editar" no contato "Maria Silva"
    And altero o número para "5511966666666"
    And clico em "Salvar"
    Then o contato deve ser atualizado
    And devo ver mensagem "Contato atualizado"

  Scenario: Remover contato de emergência
    Given que tenho 2 contatos de emergência
    When clico em "Remover" no segundo contato
    And confirmo a remoção
    Then devo ter apenas 1 contato
    And o contato deve ser removido do banco de dados

  Scenario: Impedir remoção do último contato
    Given que tenho apenas 1 contato de emergência
    When tento remover o contato
    Then devo ver mensagem "É necessário ter pelo menos 1 contato de emergência"
    And o contato não deve ser removido

  Scenario: Impedir adicionar mais de 3 contatos
    Given que tenho 3 contatos de emergência
    When tento adicionar um 4º contato
    Then o botão "Adicionar contato" deve estar desabilitado
    And devo ver mensagem "Máximo de 3 contatos permitidos"
```

---

## US014 - Editar Mensagem Personalizada

```gherkin
Feature: Editar Mensagem Personalizada
  Como usuário cadastrado
  Quero editar mensagem personalizada
  Para mantê-la relevante

  Scenario: Editar mensagem com sucesso
    Given que minha mensagem atual é "Preciso de ajuda!"
    When altero para "Estou em situação de emergência, por favor me liguem!"
    And clico em "Salvar"
    Then devo ver mensagem "Mensagem atualizada"
    And a nova mensagem deve ser usada nos próximos alertas

  Scenario: Remover mensagem personalizada
    Given que tenho mensagem personalizada cadastrada
    When limpo o campo de mensagem
    And clico em "Salvar"
    Then devo ver mensagem "Mensagem removida, será usada mensagem padrão"
    And o sistema deve usar mensagem padrão nos alertas

  Scenario: Adicionar mensagem personalizada
    Given que não tenho mensagem personalizada
    When preencho o campo com "Preciso de ajuda urgente!"
    And clico em "Salvar"
    Then devo ver mensagem "Mensagem personalizada salva"
    And a mensagem deve ser usada nos próximos alertas

  Scenario: Limitar tamanho da mensagem
    Given que estou editando a mensagem personalizada
    When digito uma mensagem com mais de 500 caracteres
    Then devo ver aviso "Máximo de 500 caracteres"
    And não devo poder salvar
```
