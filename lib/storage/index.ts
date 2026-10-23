import { getStore } from "@netlify/blobs";
export type FileScope = "public" | "private";
export interface FileStorage {
  put(scope: FileScope, key: string, bytes: ArrayBuffer, metadata: Record<string, string>): Promise<void>;
  get(scope: FileScope, key: string): Promise<ArrayBuffer | null>;
  delete(scope: FileScope, key: string): Promise<void>;
}
const stores = { public: "portfolio-public", private: "portfolio-private" } as const;
export const fileStorage: FileStorage = {
  async put(scope, key, bytes, metadata) { await getStore(stores[scope]).set(key, bytes, { metadata }); },
  async get(scope, key) { try { return await getStore(stores[scope]).get(key, { type: "arrayBuffer" }); } catch { return null; } },
  async delete(scope, key) { await getStore(stores[scope]).delete(key); },
};
