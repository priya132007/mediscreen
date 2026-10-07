import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  licenseNumber: String, department: String, hospital: String,
  specializations: [String], active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("Doctor", doctorSchema);
