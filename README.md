# Conserta Fácil | Chatbot de Atendimento via WhatsApp

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Cloud API"/>
  <img src="https://img.shields.io/badge/OpenAI_API-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI API"/>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  <img src="https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=white" alt="Claude Code"/>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/área-atendimento_e_automação-blue?style=flat-square" alt="Área"/>
  <img src="https://img.shields.io/badge/tipo-chatbot-purple?style=flat-square" alt="Tipo"/>
  <img src="https://img.shields.io/badge/dados-100%25_fictícios-brightgreen?style=flat-square" alt="Dados"/>
  <img src="https://img.shields.io/badge/status-em_desenvolvimento-orange?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/idioma-pt--BR-green?style=flat-square" alt="Idioma"/>
</p>

<p align="center">
  Chatbot de atendimento para uma assistência técnica de celulares, com fluxos de orçamento, acompanhamento
  de reparo, agendamento de entrega, consulta de informações da loja e encaminhamento para a equipe.
  Opera pela API oficial do WhatsApp e pode interpretar mensagens em texto livre com IA.
</p>

<p align="center">
  <a href="#-visão-geral">Visão geral</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-fluxo-de-atendimento">Fluxo</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-decisões-técnicas">Decisões técnicas</a> •
  <a href="#-tecnologias">Tecnologias</a>
</p>

---

## 📌 Visão geral

O **Conserta Fácil** é um projeto de portfólio que simula o atendimento inicial de uma assistência técnica de celulares.
O cliente conversa pelo WhatsApp, solicita um orçamento, acompanha um reparo, reserva um horário para entrega e
é encaminhado à equipe quando necessário. Todos os dados da loja, dos aparelhos e dos clientes são fictícios.

| ❌ Problema | 💡 Solução | ✅ Resultado |
|---|---|---|
| Mensagens sobre orçamento chegam fora do horário e sem um padrão de informações. | Fluxo guiado que coleta modelo, tipo de defeito e descrição antes de registrar a solicitação. | Cada pedido chega à equipe completo, com protocolo. |
| O cliente precisa perguntar o andamento do reparo por mensagem. | Consulta de status pelo protocolo, restrita ao remetente que fez o pedido. | Informações do reparo disponíveis sem intervenção da equipe. |
| Agendar a entrega exige troca de mensagens até encontrar um horário livre. | Lista de horários disponíveis; o horário reservado deixa de ser oferecido. | Reserva confirmada com protocolo em poucas etapas. |
| Clientes escrevem o problema em texto livre, de forma variada. | IA extrai modelo, defeito e descrição; o bot pede apenas o que falta e exibe um resumo para confirmação. | Registro somente após confirmação explícita do cliente. |

## ⚙️ Funcionalidades

| Função | Comportamento |
|---|---|
| **Solicitar orçamento** | Coleta modelo, tipo de defeito e descrição, exibe um resumo e registra a solicitação após confirmação. O valor é definido pela equipe após avaliação do aparelho. |
| **Acompanhar reparo** | Consulta o status, o modelo e a descrição de um pedido a partir do protocolo, somente para o remetente que o criou. |
| **Agendar entrega** | Oferece até três horários livres nos próximos dias úteis. Cada horário é reservado uma única vez. |
| **Endereço e horário** | Apresenta a localização de referência e o horário de atendimento da loja. |
| **Falar com a equipe** | Registra uma solicitação de atendimento humano com o assunto informado pelo cliente. |
| **Interpretação com IA** | Quando habilitada, identifica a intenção de orçamento em uma mensagem livre e extrai os dados do aparelho. |

## 🔄 Fluxo de atendimento

```mermaid
flowchart TD
    A[Mensagem recebida] --> B{Tipo de mensagem}
    B -->|Não é texto| C[Solicita texto]
    B -->|Texto| D{Opção do menu}
    D -->|1 Orçamento| E[Coleta modelo, defeito e descrição]
    E --> F[Resumo para confirmação]
    F -->|Confirma| G[Registra solicitação com protocolo]
    D -->|2 Reparo| H[Consulta por protocolo]
    D -->|3 Agenda| I[Lista horários livres]
    I --> J[Reserva com protocolo]
    D -->|4 Loja| K[Endereço e horário]
    D -->|5 Equipe| L[Registra atendimento humano]
    D -->|Texto livre| M{IA habilitada?}
    M -->|Sim, é orçamento| E
    M -->|Não ou não é orçamento| N[Exibe o menu]
```

## 🏗️ Arquitetura

```mermaid
flowchart LR
    C[Cliente] -->|WhatsApp| M[Meta · Cloud API]
    M -->|Webhook HTTPS| W[whatsapp.mjs]
    W -->|Validação HMAC SHA-256| W
    W --> B[bot.mjs · máquina de estados]
    B -->|Interpretação opcional| T[triagem.mjs · OpenAI]
    B --> O[operacao.mjs · agenda]
    B --> P[(pedidos.jsonl)]
    B -->|Resposta| W
    W -->|Graph API| M
```

| Módulo | Responsabilidade |
|---|---|
| `bot.mjs` | Máquina de estados das conversas, regras de cada etapa e registro dos pedidos. |
| `whatsapp.mjs` | Recebimento de eventos do webhook, validação de assinatura, controle de entregas e envio de respostas. |
| `triagem.mjs` | Chamada à API da OpenAI com saída em JSON Schema, para extrair dados de texto livre. |
| `operacao.mjs` | Agenda de horários, com reserva atômica por arquivo. |

## 🧭 Decisões técnicas

- **Confirmação antes do registro.** A IA apenas sugere os dados. Nenhum pedido é gravado sem a confirmação do cliente.
- **Valor fora do bot.** O sistema não estima preço. A avaliação do aparelho é responsabilidade da equipe.
- **Validação da origem do webhook.** Cada evento é aceito somente com assinatura HMAC SHA-256 válida, comparada em tempo constante.
- **Idempotência por mensagem.** Entregas já enviadas não são repetidas se a Meta reenviar o mesmo evento.
- **Fila por cliente.** Mensagens de um mesmo remetente são processadas em ordem, sem respostas cruzadas.
- **Fallback sem IA.** Se a API estiver indisponível ou não configurada, o fluxo guiado continua funcionando.
- **Dependências mínimas.** O projeto usa somente os módulos nativos do Node.js.
- **Dados fora do repositório.** Pedidos, reservas e credenciais são mantidos localmente e excluídos do controle de versão.

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|---|---|
| Linguagem e runtime | JavaScript (ES Modules), Node.js |
| Integração | WhatsApp Cloud API (Meta), webhooks, Graph API |
| IA | OpenAI Responses API, saída estruturada com JSON Schema |
| Segurança | HMAC SHA-256, comparação em tempo constante |
| Armazenamento | Arquivos JSON Lines e agenda em arquivos |
| Versionamento | Git, GitHub |

