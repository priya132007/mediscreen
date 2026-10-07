import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  aiResult: { type: mongoose.Schema.Types.ObjectId, ref: "AIResult" }, priorityCorrect: Boolean, extractionCorrect: Boolean,
  missingInformation: String, incorrectInformation: String, suggestedCorrection: String,
}, { timestamps: true });
export default mongoose.model("DoctorFeedback", feedbackSchema);
