import mongoose from "mongoose";
const symptomSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  description: { type: String, required: true }, severity: Number, duration: String,
  answers: mongoose.Schema.Types.Mixed, aiResult: { type: mongoose.Schema.Types.ObjectId, ref: "AIResult" },
}, { timestamps: true });
export default mongoose.model("Symptom", symptomSchema);
