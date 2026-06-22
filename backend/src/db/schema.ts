import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  token: varchar("token", { length: 255 }).notNull(),
  userId: int("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const scores = mysqlTable("scores", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id).notNull(),
  score: int("score").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

