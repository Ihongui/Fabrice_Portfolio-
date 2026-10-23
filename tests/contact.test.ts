import { describe, expect, it } from "vitest";
import { contactSchema } from "../lib/validation/contact";
import { hasUnsafeDocumentKey } from "../lib/security/safe-document";
const valid = { name: "Fabrice", email: "ihonguifabrice1@gmail.com", subject: "Portfolio", message: "I would like to discuss your work.", website: "", startedAt: Date.now() };
describe("contactSchema", () => {
  it("accepts a well-formed message", () => { expect(contactSchema.safeParse(valid).success).toBe(true); });
  it("rejects malformed email and unexpected operator fields", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, "$where": "true" }).success).toBe(false);
  });
  it("rejects a populated honeypot and short message", () => {
    expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "short" }).success).toBe(false);
  });
  it("detects unsafe MongoDB operator and dotted keys in nested data", () => {
    expect(hasUnsafeDocumentKey({ profile: { "$where": "x" } })).toBe(true);
    expect(hasUnsafeDocumentKey({ "profile.name": "x" })).toBe(true);
    expect(hasUnsafeDocumentKey({ profile: { name: "Fabrice" } })).toBe(false);
  });
});
