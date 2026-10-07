import { eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertMediscreenSnapshot, InsertPatientVisit, InsertUser, mediscreenSnapshots, patientVisits, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod", "passwordHash", "resetToken"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.resetTokenExpiresAt !== undefined) {
      values.resetTokenExpiresAt = user.resetTokenExpiresAt;
      updateSet.resetTokenExpiresAt = user.resetTokenExpiresAt;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  const user = result[0];
  return user?.resetTokenExpiresAt && user.resetTokenExpiresAt > new Date() ? user : undefined;
}

export async function getVisitsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patientVisits).where(eq(patientVisits.userId, userId));
}

export async function createPatientVisit(visit: InsertPatientVisit) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(patientVisits).values(visit);
  return true;
}

export async function getMediscreenSnapshot(snapshotKey = "demo") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mediscreenSnapshots).where(eq(mediscreenSnapshots.snapshotKey, snapshotKey)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMediscreenSnapshot(payload: string, snapshotKey = "demo") {
  const db = await getDb();
  if (!db) return false;
  const values: InsertMediscreenSnapshot = { snapshotKey, payload };
  await db.insert(mediscreenSnapshots).values(values).onDuplicateKeyUpdate({
    set: { payload, updatedAt: new Date() },
  });
  return true;
}
