/// <reference types="node" />
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@db:5432/resto_saas?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
  client: {
    // Prisma 7: use the native Node engine (library = node-api)
    engineType: "library",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
