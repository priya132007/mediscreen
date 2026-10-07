import mongoose from "mongoose";
const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true }, age: Number, gender: String,
  contact: { email: String, phone: String }, preferredLanguage: String,
  medicalHistory: [String], allergies: [String], currentMedications: [String], previousConditions: [String],
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.model("Patient", patientSchema);
