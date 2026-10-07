import DoctorFeedback from "../models/DoctorFeedback.js";
import Doctor from "../models/Doctor.js";
import { patientForUser, required } from "../utils.js";
export async function createFeedback(req, res) { const patient = await patientForUser(req.user._id); if (!patient) return res.status(404).json({ error: "Patient profile not found" }); const doctor = await Doctor.findById(req.body.doctorId || patient.assignedDoctor); if (!doctor) return res.status(404).json({ error: "Doctor not found" }); const feedback = await DoctorFeedback.create({ ...req.body, doctor: doctor._id, patient: patient._id }); res.status(201).json(feedback); }
export async function listFeedback(req, res) { const doctor = await Doctor.findOne({ user: req.user._id }); res.json(await DoctorFeedback.find(doctor ? { doctor: doctor._id } : {}).sort({ createdAt: -1 })); }
