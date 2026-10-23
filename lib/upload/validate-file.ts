export type SafeFileType = { extension: "pdf" | "png" | "jpg" | "webp"; mimeType: "application/pdf" | "image/png" | "image/jpeg" | "image/webp" };
export function detectSafeFile(bytes: Uint8Array): SafeFileType | null {
  if (bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-") return { extension: "pdf", mimeType: "application/pdf" };
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return { extension: "png", mimeType: "image/png" };
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { extension: "jpg", mimeType: "image/jpeg" };
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return { extension: "webp", mimeType: "image/webp" };
  return null;
}
export function fileSizeAllowed(type: SafeFileType, size: number) { return size > 0 && size <= (type.extension === "pdf" ? 5 : 3) * 1024 * 1024; }
