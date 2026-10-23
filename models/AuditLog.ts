import { Schema, model, models } from "mongoose";
const schema = new Schema({ actor: { type: String, required: true }, action: { type: String, required: true }, target: { type: String, required: true }, createdAt: { type: Date, default: Date.now, expires: "365d" } }, { strict: true, timestamps: false, sanitizeFilter: true });
export default models.AuditLog || model("AuditLog", schema);
