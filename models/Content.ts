import { Schema, model, models } from "mongoose";
const localized = { en: { type: String, default: "" }, fr: { type: String, default: "" } };
const contentSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  title: localized,
  body: localized,
  data: { type: Schema.Types.Mixed, default: {} },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true, strict: true, sanitizeFilter: true });
export default models.Content || model("Content", contentSchema);
