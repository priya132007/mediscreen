import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  originalName: String, fileName: String, mimeType: String, path: String, extractedText: String,
  aiResult: { type: mongoose.Schema.Types.ObjectId, ref: "AIResult" },
  status: { type: String, enum: ["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"], default: "UPLOADED" },
}, { timestamps: true });
export default mongoose.model("MedicalReport", reportSchema);
