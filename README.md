<p align="center">
  <b>🌐 Choose your language · Escolha o idioma</b><br/><br/>
  <img src="https://img.shields.io/badge/✓_English-current-1F6FEB?style=for-the-badge" alt="English (current)"/>
  <a href="README.pt-BR.md">
    <img src="https://img.shields.io/badge/Português-clique_para_ler_→-2EA043?style=for-the-badge" alt="Ler em português"/>
  </a>
</p>

---

# EasyFix | WhatsApp Customer Service Chatbot

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
  <img src="https://img.shields.io/badge/area-customer_service_and_automation-blue?style=flat-square" alt="Area"/>
  <img src="https://img.shields.io/badge/type-chatbot-purple?style=flat-square" alt="Type"/>
  <img src="https://img.shields.io/badge/data-100%25_fictitious-brightgreen?style=flat-square" alt="Data"/>
  <img src="https://img.shields.io/badge/status-in_development-orange?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/bot_language-Portuguese-green?style=flat-square" alt="Bot language"/>
</p>

<p align="center">
  Customer service chatbot for a phone repair shop, with flows for quotes, repair tracking, delivery scheduling,
  store information and handoff to the team. It runs on the official WhatsApp API and can interpret free-text
  messages with AI.
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-project-map">Map</a> •
  <a href="#️-features">Features</a> •
  <a href="#-service-flow">Flow</a> •
  <a href="#️-architecture">Architecture</a> •
  <a href="#-technical-decisions">Technical decisions</a> •
  <a href="#-simulated-conversation">Simulated conversation</a> •
  <a href="#️-technologies">Technologies</a>
</p>

---

## 📌 Overview

**EasyFix** (originally *Conserta Fácil*) is a portfolio project that simulates the first-line customer service of a
phone repair shop. The customer chats on WhatsApp, requests a quote, tracks a repair, books a delivery slot and is
handed off to the team when needed. All store, device and customer data is fictitious.

> [!NOTE]
> The bot talks to customers in Portuguese, since it targets a Brazilian shop. The code, flows and decisions are
> described here in English.

| ❌ Problem | 💡 Solution | ✅ Result |
|---|---|---|
| Quote requests arrive outside business hours and without a standard set of information. | Guided flow that collects model, defect type and description before registering the request. | Every request reaches the team complete, with a protocol number. |
| The customer has to message the shop to ask about repair progress. | Status lookup by protocol number, restricted to the sender who made the request. | Repair information available without team intervention. |
| Scheduling a delivery takes several messages until a free slot is found. | List of available slots; a booked slot is no longer offered. | Booking confirmed with a protocol number in a few steps. |
| Customers describe the problem in free text, in many different ways. | AI extracts model, defect and description; the bot asks only for what is missing and shows a summary for confirmation. | Registration only after the customer's explicit confirmation. |

## 🧠 Project map

```mermaid
mindmap
  root((EasyFix))
    🛒 Customer service
      Menu with five options
      Quote with summary and confirmation
      Repair lookup by protocol
      Schedule with reserved slot
      Talk to the team
    🔌 Integration
      HTTPS webhook
      HMAC SHA-256 signature
      Sending via Graph API
      Per-customer queue
    🤖 Artificial intelligence
      Quote intent
      Model and defect extraction
      JSON Schema output
      Fallback to the guided flow
    🗂️ Data
      Requests with protocol
      Schedule with atomic booking
      Fictitious data
      Credentials outside Git
    ✅ Verification
      Full flow simulation
      Invalid signature rejected
      Repeated messages not resent
    🧭 Decisions
      Confirmation before registration
      Price set by the team
      Lookup only for the requester
```

## ⚙️ Features

| Feature | Behavior |
|---|---|
| **Request a quote** | Collects model, defect type and description, shows a summary and registers the request after confirmation. The price is set by the team after evaluating the device. |
| **Track a repair** | Looks up the status, model and description of a request from its protocol number, only for the sender who created it. |
| **Schedule a delivery** | Offers up to three free slots on the next business days. Each slot can be booked only once. |
| **Address and hours** | Shows the store's reference location and business hours. |
| **Talk to the team** | Registers a request for human service with the subject given by the customer. |
| **AI interpretation** | When enabled, identifies quote intent in a free-text message and extracts the device data. |

## 🔄 Service flow

```mermaid
flowchart TD
    A[Message received] --> B{Message type}
    B -->|Not text| C[Asks for text]
    B -->|Text| D{Menu option}
    D -->|1 Quote| E[Collects model, defect and description]
    E --> F[Summary for confirmation]
    F -->|Confirms| G[Registers request with protocol]
    D -->|2 Repair| H[Lookup by protocol]
    D -->|3 Schedule| I[Lists free slots]
    I --> J[Booking with protocol]
    D -->|4 Store| K[Address and hours]
    D -->|5 Team| L[Registers human service request]
    D -->|Free text| M{AI enabled?}
    M -->|Yes, it is a quote| E
    M -->|No, or not a quote| N[Shows the menu]

    classDef orcamento fill:#DCFCE7,stroke:#16A34A,color:#14532D
    classDef reparo fill:#EDE9FE,stroke:#7C3AED,color:#4C1D95
    classDef agenda fill:#E0F2FE,stroke:#0284C7,color:#0C4A6E
    classDef loja fill:#F1F5F9,stroke:#64748B,color:#1E293B
    classDef equipe fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D
    classDef ia fill:#FEF3C7,stroke:#D97706,color:#78350F
    class E,F,G orcamento
    class H reparo
    class I,J agenda
    class K loja
    class L equipe
    class M,N ia
```

## 🏗️ Architecture

Sequence of a message, from the customer's phone to the bot's reply:

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant M as Meta (Cloud API)
    participant W as whatsapp.mjs
    participant B as bot.mjs
    C->>M: Sends a text message
    M->>W: POST /webhook with x-hub-signature-256
    W->>W: Validates HMAC SHA-256 signature
    W->>B: processarMensagem(estado, texto)
    B-->>W: Reply and new state
    W->>M: Graph API sends the reply
    M->>C: Bot reply
```

Planned status cycle for each registered request:

```mermaid
stateDiagram-v2
    [*] --> aguardando_avaliacao: Request registered
    state "Awaiting evaluation" as aguardando_avaliacao
    state "Under diagnosis" as em_diagnostico
    state "Awaiting part" as aguardando_peca
    state "Ready for pickup" as pronto
    aguardando_avaliacao --> em_diagnostico
    em_diagnostico --> aguardando_peca
    aguardando_peca --> pronto
    pronto --> [*]
```

Components:

| Module | Responsibility |
|---|---|
| `bot.mjs` | Conversation state machine, rules for each step and request registration. |
| `whatsapp.mjs` | Receiving webhook events, signature validation, delivery control and sending replies. |
| `triagem.mjs` | Call to the OpenAI API with JSON Schema output, to extract data from free text. |
| `operacao.mjs` | Slot schedule, with atomic file-based booking. |

## 🧭 Technical decisions

- **Confirmation before registration.** The AI only suggests the data. No request is saved without the customer's confirmation.
- **Pricing outside the bot.** The system does not estimate prices. Evaluating the device is the team's responsibility.
- **Webhook origin validation.** Each event is accepted only with a valid HMAC SHA-256 signature, compared in constant time.
- **Idempotency per message.** Deliveries already sent are not repeated if Meta resends the same event.
- **Per-customer queue.** Messages from the same sender are processed in order, with no crossed replies.
- **Fallback without AI.** If the API is unavailable or not configured, the guided flow keeps working.
- **Minimal dependencies.** The project uses only Node.js built-in modules.
- **Data outside the repository.** Requests, bookings and credentials are kept locally and excluded from version control.

## 💬 Simulated conversation

The conversation below includes a quote request, confirmation, protocol number and lookup (in Portuguese, as the
customer would see it). It goes through the same signed webhook Meta would use, without calling the API.

<p align="center">
  <img src="docs/conversa-whatsapp.svg" alt="Simulated WhatsApp-style conversation" width="460"/>
</p>

Simulation details in [SIMULACAO.md](SIMULACAO.md) (in Portuguese).

## 🛠️ Technologies

| Category | Technologies |
|---|---|
| Language and runtime | JavaScript (ES Modules), Node.js |
| Integration | WhatsApp Cloud API (Meta), webhooks, Graph API |
| AI | OpenAI Responses API, structured output with JSON Schema |
| Security | HMAC SHA-256, constant-time comparison |
| Storage | JSON Lines files and file-based schedule |
| Diagrams | Mermaid |
| Version control | Git, GitHub |

<p align="center">
  🌐 <a href="README.pt-BR.md">Ler esta página em português</a>
</p>
