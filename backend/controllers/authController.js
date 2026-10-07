import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { publicUser, required, tokenFor } from "../utils.js";

async function login(req, res, allowedRoles) {
  const email = required(req.body.email, "email").toLowerCase();
  const password = required(req.body.password, "password");
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash)) || (allowedRoles && !allowedRoles.includes(user.role))) return res.status(401).json({ error: "Invalid credentials" });
  return res.json({ token: tokenFor(user), user: publicUser(user) });
}
export async function registerPatient(req, res) {
  const { name, email, password, phone, preferredLanguage, age, gender } = req.body;
  required(name, "name"); required(email, "email"); required(password, "password");
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
  const user = await User.create({ name, email: email.toLowerCase(), phone, preferredLanguage, passwordHash: await bcrypt.hash(password, 12), role: "PATIENT" });
  const patient = await Patient.create({ user: user._id, name, age, gender, contact: { email: user.email, phone }, preferredLanguage });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user), patient });
}
export const patientLogin = (req, res) => login(req, res, ["PATIENT"]);
export const staffLogin = (req, res) => login(req, res, ["DOCTOR", "ADMIN"]);
export function logout(_req, res) { res.json({ message: "Logged out. Discard the bearer token on the client." }); }
