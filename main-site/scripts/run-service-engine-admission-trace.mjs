import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const temporary = mkdtempSync(join(tmpdir(), "service-engine-admission-trace-"));
try {
  const emptyServerOnly = join(temporary, "server-only.js");
  const compiled = join(temporary, "service-engine-admission-trace.cjs");
  writeFileSync(emptyServerOnly, "");
  execFileSync(join(root, "node_modules/.bin/esbuild"), [
    join(root, "scripts/service-engine-admission-trace.ts"),
    "--bundle",
    "--platform=node",
    "--format=cjs",
    `--outfile=${compiled}`,
    `--tsconfig=${join(root, "tsconfig.json")}`,
    `--alias:server-only=${emptyServerOnly}`,
  ], { cwd: root, stdio: "pipe" });
  const output = execFileSync("node", [compiled, ...process.argv.slice(2)], { cwd: root, encoding: "utf8" });
  process.stdout.write(output);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
