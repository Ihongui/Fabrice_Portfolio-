import argon2 from "argon2";
import { stdin, stdout } from "node:process";

async function main() {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") throw new Error("Run this command in an interactive terminal so the password can be hidden.");
  stdout.write("Admin password (hidden, at least 12 characters): ");
  stdin.setRawMode(true);
  stdin.resume();
  const password = await new Promise<string>((resolve, reject) => {
    let value = "";
    stdin.on("data", (buffer: Buffer) => {
      for (const char of buffer.toString()) {
        if (char === "\u0003") { stdin.setRawMode(false); reject(new Error("Cancelled.")); return; }
        if (char === "\r" || char === "\n") { stdin.setRawMode(false); stdout.write("\n"); resolve(value); return; }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    });
  });
  if (password.length < 12) throw new Error("Choose a password of at least 12 characters.");
  console.log(await argon2.hash(password, { type: argon2.argon2id }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Could not create password hash."); process.exitCode = 1; });
