import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  scheduledAt: { type: Date, required: true }, reason: String,
  status: { type: String, enum: ["SCHEDULED", "COMPLETED", "CANCELLED"], default: "SCHEDULED" },
  doctorSeen: { type: Boolean, default: false }, notes: String,
}, { timestamps: true });
export default mongoose.model("Appointment", appointmentSchema);
