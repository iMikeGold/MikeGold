import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const requiredFiles = [
  "open-next.config.ts",
  "wrangler.jsonc",
  "src/app/api/engine/analyse/route.ts",
  "src/server/service-engine/analyse-public-service.ts",
];
const errors = requiredFiles
  .filter((file) => !existsSync(join(root, file)))
  .map((file) => `Missing Service Engine runtime file: ${file}`);
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (/output\s*:\s*["']export["']/.test(nextConfig)) {
  errors.push('Static export cannot be enabled while the private Service Engine route exists.');
}
const route = readFileSync(join(root, "src/app/api/engine/analyse/route.ts"), "utf8");
if (!route.includes("export async function POST")) errors.push("Service Engine route must expose POST.");
if (!route.includes("private, no-store")) errors.push("Service Engine route must return private, no-store responses.");
if (errors.length) {
  console.error(JSON.stringify({ errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  runtime: "OpenNext Cloudflare Worker",
  staticExport: false,
  privateAnalyserRoute: true,
  errors: [],
}, null, 2));
