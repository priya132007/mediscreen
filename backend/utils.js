import axios from "axios";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Patient from "./models/Patient.js";

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const required = (value, name) => { if (value === undefined || value === null || value === "") { const error = new Error(`${name} is required`); error.status = 400; throw error; } return value; };
export const tokenFor = (user) => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
export const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, preferredLanguage: user.preferredLanguage });
export async function patientForUser(userId) { return Patient.findOne({ user: userId }); }
export async function notify(event, data) {
  if (!process.env.NOTIFICATION_WEBHOOK_URL) return { delivered: false, reason: "webhook_not_configured" };
  try { await axios.post(process.env.NOTIFICATION_WEBHOOK_URL, { event, data }, { timeout: 5000 }); return { delivered: true }; }
  catch { return { delivered: false, reason: "webhook_failed" }; }
}
export function assertObjectId(value, name = "id") { if (!/^[a-f\d]{24}$/i.test(String(value))) { const error = new Error(`Invalid ${name}`); error.status = 400; throw error; } }
