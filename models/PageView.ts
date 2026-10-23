import { Schema, model, models } from "mongoose";
const schema = new Schema({ path: { type: String, required: true, maxlength: 300 }, locale: { type: String, enum: ["en", "fr"], required: true }, kind: { type: String, enum: ["page", "cv_download"], default: "page" }, visitorHash: { type: String, required: true, select: false }, referrerHost: { type: String, default: "", maxlength: 253 }, country: { type: String, default: "", maxlength: 3 }, createdAt: { type: Date, default: Date.now } }, { strict: true });
schema.index({ createdAt: -1 }); schema.index({ path: 1, createdAt: -1 });
export default models.PageView || model("PageView", schema);
