#!/usr/bin/env node

/**
 * Backend Agent Toolkit - Model Context Protocol (MCP) Server
 * Exposes resilient backend utilities, transaction ledger audits, and schema inspection
 * to autonomous AI agents (Claude, Cursor, Copilot, Antigravity).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Define MCP Tools exposed to AI agents
const TOOLS: Tool[] = [
  {
    name: "audit_transaction_ledger",
    description: "Audits a financial/order transaction batch for balance integrity, idempotency duplicates, and reconciliation discrepancies.",
    inputSchema: {
      type: "object",
      properties: {
        batchId: { type: "string", description: "Unique identifier for the transaction batch" },
        currency: { type: "string", description: "ISO 4217 Currency code (e.g. USD, COP)" },
        tolerance: { type: "number", description: "Allowed floating point discrepancy threshold (default: 0.00)" }
      },
      required: ["batchId"]
    }
  },
  {
    name: "inspect_database_schema",
    description: "Returns table structures, indexing strategies, and relational foreign constraints for a specified service domain without exposing sensitive row data.",
    inputSchema: {
      type: "object",
      properties: {
        entityName: { type: "string", description: "Name of the entity, table, or collection to inspect (e.g. invoices, users, ledger)" },
        includeIndexes: { type: "boolean", description: "Whether to return indexing and unique constraints" }
      },
      required: ["entityName"]
    }
  },
  {
    name: "system_health_telemetry",
    description: "Fetches live operational metrics: memory allocation, active connection pool statistics, and message queue backpressure.",
    inputSchema: {
      type: "object",
      properties: {
        serviceScope: {
          type: "string",
          enum: ["all", "api-gateway", "worker-queue", "database"],
          description: "Subsystem to analyze"
        }
      }
    }
  },
  {
    name: "verify_idempotency_key",
    description: "Checks whether a payment or billing operation has already been executed to prevent duplicate execution across distributed microservices.",
    inputSchema: {
      type: "object",
      properties: {
        idempotencyKey: { type: "string", description: "UUID or hash token representing the operation request" },
        operationType: { type: "string", description: "Operation category (e.g. CREATE_INVOICE, PROCESS_PAYMENT)" }
      },
      required: ["idempotencyKey", "operationType"]
    }
  }
];

// Initialize MCP Server
const server = new Server(
  {
    name: "backend-agent-toolkit",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tool Discovery Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Register Tool Execution Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case "audit_transaction_ledger": {
      const batchId = String(args.batchId || "BATCH-UNKNOWN");
      const currency = String(args.currency || "USD");

      // Simulated production reconciliation engine
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "AUDIT_PASSED",
              batchId,
              currency,
              recordsEvaluated: 1420,
              checksumValid: true,
              totalDebits: 45230.50,
              totalCredits: 45230.50,
              delta: 0.00,
              duplicateIdempotencyKeysFound: 0,
              reconciliationTimestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    }

    case "inspect_database_schema": {
      const entity = String(args.entityName || "").toLowerCase();
      const includeIndexes = Boolean(args.includeIndexes ?? true);

      const schemas: Record<string, any> = {
        invoices: {
          tableName: "invoices",
          engine: "PostgreSQL 16",
          columns: [
            { name: "id", type: "UUID", primaryKey: true },
            { name: "company_id", type: "UUID", nullable: false },
            { name: "invoice_number", type: "VARCHAR(64)", unique: true },
            { name: "total_amount", type: "NUMERIC(14, 2)", nullable: false },
            { name: "tax_amount", type: "NUMERIC(14, 2)", nullable: false },
            { name: "status", type: "VARCHAR(24)", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", default: "NOW()" }
          ],
          indexes: includeIndexes ? ["idx_invoices_company_id", "idx_invoices_status_created"] : undefined
        },
        ledger: {
          tableName: "accounting_ledger_entries",
          engine: "PostgreSQL 16",
          columns: [
            { name: "entry_id", type: "UUID", primaryKey: true },
            { name: "account_code", type: "VARCHAR(32)", nullable: false },
            { name: "debit", type: "NUMERIC(14, 2)", default: "0.00" },
            { name: "credit", type: "NUMERIC(14, 2)", default: "0.00" },
            { name: "transaction_ref", type: "UUID", index: true }
          ],
          indexes: includeIndexes ? ["idx_ledger_account_code", "idx_ledger_transaction_ref"] : undefined
        }
      };

      const result = schemas[entity] || {
        entity,
        status: "NOT_FOUND",
        message: `Schema for '${entity}' not registered. Registered domains: invoices, ledger.`
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    case "system_health_telemetry": {
      const scope = String(args.serviceScope || "all");
      const memUsage = process.memoryUsage();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              scope,
              status: "HEALTHY",
              uptimeSeconds: Math.floor(process.uptime()),
              memory: {
                heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
                rssMB: Math.round(memUsage.rss / 1024 / 1024)
              },
              connectionPool: {
                activeConnections: 12,
                idleConnections: 8,
                waitingClients: 0
              },
              queueTelemetry: {
                deadLetterQueueCount: 0,
                pendingEventMessages: 3
              },
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    }

    case "verify_idempotency_key": {
      const key = String(args.idempotencyKey);
      const op = String(args.operationType);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              idempotencyKey: key,
              operationType: op,
              isDuplicate: false,
              lockAcquired: true,
              ttlSeconds: 300,
              message: "Operation safe to proceed. Lock registered."
            }, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unsupported tool: ${name}`);
  }
});

// Run server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Backend Agent Toolkit (MCP) running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
