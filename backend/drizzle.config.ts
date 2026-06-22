import { defineConfig } from "drizzle-kit";

const dbCredentials: any = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "project",
};

if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== "") {
  dbCredentials.password = process.env.DB_PASSWORD;
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials,
});
