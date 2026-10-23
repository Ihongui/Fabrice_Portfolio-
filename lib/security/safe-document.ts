export function hasUnsafeDocumentKey(value: unknown, depth = 0): boolean {
  if (depth > 10) return true;
  if (Array.isArray(value)) return value.some((item) => hasUnsafeDocumentKey(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, child]) => key.startsWith("$") || key.includes(".") || ["__proto__", "prototype", "constructor"].includes(key) || hasUnsafeDocumentKey(child, depth + 1));
  }
  return typeof value === "function" || typeof value === "symbol";
}
