import { Schema, model, models } from "mongoose";
const schema = new Schema({ key: { type: String, required: true, unique: true }, count: { type: Number, required: true }, expiresAt: { type: Date, required: true, expires: 0 } }, { strict: true, timestamps: true, sanitizeFilter: true });
export default models.RateLimit || model("RateLimit", schema);
