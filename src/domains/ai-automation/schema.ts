import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  vector,
  index,
  boolean
} from "drizzle-orm/pg-core";
import { tenants } from "../identity-tenancy/schema";

/**
 * KNOWLEDGE BASE (RAG)
 * "Vectors stored in PostgreSQL using pgvector".
 * Query pgvector for text chunks.
 */
export const knowledgeBase = pgTable(
  "knowledge_base",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    // Document metadata
    title: text("title").notNull(),
    contentChunk: text("content_chunk").notNull(),

    // OpenAI text-embedding-3-small generates 1536 dimensions
    embedding: vector("embedding", { dimensions: 1536 }),

    metadata: jsonb("metadata"), // e.g., { "chapter": 4, "subject": "Physics" }

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_knowledge_tenant").on(table.tenantId),
    // HNSW Index for fast vector similarity search (requires pgvector extension)
    embeddingIdx: index("idx_knowledge_embedding").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

/**
 * TIMETABLES (Genetic Algorithm Output)
 */
export const timetables = pgTable(
  "timetables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    // "Chromosome" data structure
    allocationMatrix: jsonb("allocation_matrix").notNull(),

    isActive: boolean("is_active").default(false),
    version: text("version"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_timetables_tenant").on(table.tenantId),
  })
);
