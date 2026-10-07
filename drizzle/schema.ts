import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  passwordHash: text("passwordHash"),
  resetToken: varchar("resetToken", { length: 128 }),
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const patientVisits = mysqlTable("patient_visits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  visitDate: timestamp("visitDate").defaultNow().notNull(),
  doctorName: varchar("doctorName", { length: 160 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  doctorSeen: mysqlEnum("doctorSeen", ["yes", "no"]).default("no").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PatientVisit = typeof patientVisits.$inferSelect;
export type InsertPatientVisit = typeof patientVisits.$inferInsert;

export const mediscreenSnapshots = mysqlTable("mediscreen_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  snapshotKey: varchar("snapshotKey", { length: 64 }).notNull().unique(),
  payload: text("payload").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediscreenSnapshot = typeof mediscreenSnapshots.$inferSelect;
export type InsertMediscreenSnapshot = typeof mediscreenSnapshots.$inferInsert;
