import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const requiredFiles = [
  "open-next.config.ts",
  "wrangler.jsonc",
  "src/app/api/engine/analyse/route.ts",
  "src/server/service-engine/analyse-public-service.ts",
  "src/app/projects/page.tsx",
  "src/app/projects/[slug]/page.tsx",
  "src/app/registry/page.tsx",
];
const errors = requiredFiles
  .filter((file) => !existsSync(join(root, file)))
  .map((file) => `Missing Service Engine runtime file: ${file}`);

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (/output\s*:\s*["']export["']/.test(nextConfig)) {
  errors.push("Static export cannot be enabled while the private Service Engine route exists.");
}

const route = readFileSync(join(root, "src/app/api/engine/analyse/route.ts"), "utf8");
if (!route.includes("export async function POST")) errors.push("Service Engine route must expose POST.");
if (!route.includes("private, no-store")) errors.push("Service Engine route must return private, no-store responses.");

const openNextConfig = readFileSync(join(root, "open-next.config.ts"), "utf8");
if (!openNextConfig.includes("staticAssetsIncrementalCache")) {
  errors.push("OpenNext must use the static-assets incremental cache for prerendered routes.");
}
if (!openNextConfig.includes("enableCacheInterception: true")) {
  errors.push("OpenNext cache interception must remain enabled for prerendered routes.");
}

for (const file of ["src/app/projects/page.tsx", "src/app/registry/page.tsx"]) {
  const source = readFileSync(join(root, file), "utf8");
  if (!source.includes('export const dynamic = "force-static"')) {
    errors.push(`${file} must remain force-static.`);
  }
  if (source.includes("searchParams")) {
    errors.push(`${file} must read URL filters in its client component, not at Worker runtime.`);
  }
}

const projectRoute = readFileSync(join(root, "src/app/projects/[slug]/page.tsx"), "utf8");
if (!projectRoute.includes("generateStaticParams")) {
  errors.push("Project records must enumerate known slugs at build time.");
}
if (!projectRoute.includes('export const dynamic = "force-static"')) {
  errors.push("Known project records must remain force-static.");
}

if (errors.length) {
  console.error(JSON.stringify({ errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  runtime: "OpenNext Cloudflare Worker",
  staticExport: false,
  privateAnalyserRoute: true,
  prerenderedRouteCache: "Workers Static Assets",
  staticArchiveRoutes: ["/projects", "/registry", "/projects/[slug]"],
  errors: [],
}, null, 2));
