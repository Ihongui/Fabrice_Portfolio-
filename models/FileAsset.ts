import { Schema, model, models } from "mongoose";
const schema = new Schema({ title: { type: String, required: true, trim: true, maxlength: 160 }, type: { type: String, enum: ["cv", "transcript", "certificate", "diploma", "award", "reference", "other"], required: true }, visibility: { type: String, enum: ["public", "on_request", "private"], default: "private" }, fileKey: { type: String, required: true, unique: true }, fileName: { type: String, required: true }, mimeType: { type: String, required: true }, size: { type: Number, required: true }, altText: { type: String, default: "", maxlength: 300 }, includeInCv: { type: Boolean, default: false } }, { timestamps: true, strict: true });
schema.index({ type: 1, visibility: 1 });
export default models.FileAsset || model("FileAsset", schema);
