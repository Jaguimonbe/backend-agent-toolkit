# Backend Agent Toolkit — Model Context Protocol (MCP) Server

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![MCP SDK](https://img.shields.io/badge/Model_Context_Protocol-SDK_1.6-8B5CF6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

A production-ready **Model Context Protocol (MCP)** server built in **Node.js & TypeScript**. It securely exposes backend diagnostics, transaction ledger audits, database schema introspection, and idempotency locks as callable tools for autonomous AI agents (Claude Desktop, Cursor, Copilot, Antigravity).

---

## 🏛️ Architecture & Interaction Flow

```
┌─────────────────────────────────┐
│     Autonomous AI Agent         │ (Claude Desktop, Cursor, Custom Agent)
└────────────────┬────────────────┘
                 │ stdio / JSON-RPC
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND AGENT TOOLKIT (MCP SERVER)                   │
│                                                                        │
│   ┌─────────────────────────┐        ┌──────────────────────────────┐  │
│   │  audit_transaction_     │        │  inspect_database_           │  │
│   │  ledger                 │        │  schema                      │  │
│   └─────────────────────────┘        └──────────────────────────────┘  │
│   ┌─────────────────────────┐        ┌──────────────────────────────┐  │
│   │  system_health_         │        │  verify_idempotency_         │  │
│   │  telemetry              │        │  key                         │  │
│   └─────────────────────────┘        └──────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┬───────────────┘
                 │                                       │
                 ▼                                       ▼
       [ Distributed DBs ]                      [ Message Queues / SQS ]
```

---

## 🛠️ Exposed Tools for AI Agents

1. **`audit_transaction_ledger`**:
   - Evaluates batches of debit/credit journal transactions to detect discrepancies, unbalances, and duplicate idempotency tokens.
   - Input: `batchId`, `currency`, `tolerance`.
2. **`inspect_database_schema`**:
   - Introspects relational tables, primary keys, and index configurations without exposing sensitive table records to LLM contexts.
   - Input: `entityName`, `includeIndexes`.
3. **`system_health_telemetry`**:
   - Queries runtime diagnostics: Heap usage, active connection pool capacity, and dead-letter queue backpressure.
   - Input: `serviceScope` (`all`, `api-gateway`, `worker-queue`, `database`).
4. **`verify_idempotency_key`**:
   - Prevents distributed double-spend / double-write by evaluating distributed locks before transactional mutations.
   - Input: `idempotencyKey`, `operationType`.

---

## ⚙️ Configuration with AI Clients

### Adding to Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "backend-agent-toolkit": {
      "command": "node",
      "args": ["/absolute/path/to/backend-agent-toolkit/dist/index.js"]
    }
  }
}
```

---

## 🚀 Installation & Local Execution

```bash
# Clone the repository
git clone https://github.com/Jaguimonbe/backend-agent-toolkit.git
cd backend-agent-toolkit

# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Start MCP server (communicates via stdio)
npm start
```

---

## 👤 Author
**James Moncada** — [GitHub](https://github.com/Jaguimonbe) • [LinkedIn](https://linkedin.com)
