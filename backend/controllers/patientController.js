import Patient from "../models/Patient.js";
import Symptom from "../models/Symptom.js";
import MedicalReport from "../models/MedicalReport.js";
import Appointment from "../models/Appointment.js";
import { patientForUser, required } from "../utils.js";
export async function getProfile(req, res) { const patient = await patientForUser(req.user._id); if (!patient) return res.status(404).json({ error: "Patient profile not found" }); res.json(patient); }
export async function updateProfile(req, res) { const patient = await patientForUser(req.user._id); if (!patient) return res.status(404).json({ error: "Patient profile not found" }); const allowed = ["name", "age", "gender", "contact", "preferredLanguage", "medicalHistory", "allergies", "currentMedications", "previousConditions"]; for (const key of allowed) if (req.body[key] !== undefined) patient[key] = req.body[key]; await patient.save(); res.json(patient); }
export async function history(req, res) { const patient = await patientForUser(req.user._id); if (!patient) return res.status(404).json({ error: "Patient profile not found" }); const [symptoms, reports, appointments] = await Promise.all([Symptom.find({ patient: patient._id }).sort({ createdAt: -1 }), MedicalReport.find({ patient: patient._id }).sort({ createdAt: -1 }), Appointment.find({ patient: patient._id }).populate("doctor").sort({ scheduledAt: -1 })]); res.json({ symptoms, reports, appointments }); }
export async function listPatients(req, res) { const query = req.user.role === "DOCTOR" ? { assignedDoctor: req.user._id } : {}; res.json(await Patient.find(query).populate("user", "name email phone")); }
export async function assignDoctor(req, res) { const patient = await Patient.findById(req.params.id); if (!patient) return res.status(404).json({ error: "Patient not found" }); patient.assignedDoctor = req.body.doctorId || null; await patient.save(); res.json(patient); }
export { required };
