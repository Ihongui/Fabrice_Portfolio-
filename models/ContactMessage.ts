import { Schema, model, models } from "mongoose";
const schema = new Schema({ name: { type: String, required: true, trim: true, maxlength: 100 }, email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 }, subject: { type: String, required: true, trim: true, maxlength: 150 }, message: { type: String, required: true, trim: true, maxlength: 5000 }, read: { type: Boolean, default: false }, spamScore: { type: Number, default: 0 } }, { timestamps: true, strict: true });
schema.index({ createdAt: -1 });
export default models.ContactMessage || model("ContactMessage", schema);
