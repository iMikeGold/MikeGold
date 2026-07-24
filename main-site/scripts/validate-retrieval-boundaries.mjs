import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  join(root, "src", "system", "services", "intent-engine.ts"),
  join(root, "src", "server", "service-engine"),
  join(root, "records", "generated", "service-engine"),
];
const forbidden = [
  "editorialBoost",
  "editorialSequence",
  "displayPriority",
  "homepagePriority",
  "leadMediaPriority",
  "projectDisplayOrder",
  "featuredStatus",
];
const files = [];
const visit = (path) => {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) visit(join(path, name));
  } else if (/\.(json|ts|tsx|js|mjs)$/.test(path)) files.push(path);
};
targets.forEach(visit);
const failures = [];
for (const path of files) {
  const source = readFileSync(path, "utf8");
  for (const field of forbidden) {
    if (source.includes(field)) failures.push(`${path.replace(`${root}/`, "")}: forbidden retrieval input ${field}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Retrieval boundary: PASS — ${files.length} Service/Work retrieval files contain no editorial or display-priority inputs.`);
}
