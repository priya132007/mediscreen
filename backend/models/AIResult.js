import mongoose from "mongoose";
const aiResultSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  sourceType: { type: String, enum: ["REPORT", "SYMPTOM", "COMBINED"], required: true },
  summary: String, entities: [mongoose.Schema.Types.Mixed], priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
  priorityScore: Number, redFlags: [String], modelVersion: String, raw: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
export default mongoose.model("AIResult", aiResultSchema);
