import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ice: "#7dd3fc", ink: "#0b1220" } } }, plugins: [] } satisfies Config;
