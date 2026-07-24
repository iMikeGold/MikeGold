import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const temporary = mkdtempSync(join(tmpdir(), "service-engine-test-"));
try {
  cpSync(join(root, "src"), join(temporary, "src"), { recursive: true });
  cpSync(join(root, "records"), join(temporary, "records"), { recursive: true });
  mkdirSync(join(temporary, "scripts"), { recursive: true });
  cpSync(
    join(root, "scripts/service-engine-query-matrix.ts"),
    join(temporary, "scripts/service-engine-query-matrix.ts"),
  );
  const testConfig = join(temporary, "tsconfig.json");
  writeFileSync(testConfig, JSON.stringify({
    compilerOptions: {
      target: "es2022",
      resolveJsonModule: true,
      baseUrl: root,
      paths: { "@/*": [join(temporary, "src/*")] },
    },
  }));
  if (process.env.SHUFFLE_SERVICE_RECORDS === "reverse") {
    for (const file of ["semantic-concepts-core.json", "semantic-concept-extensions.json"]) {
      const target = join(temporary, "records/concepts", file);
      const data = JSON.parse(readFileSync(target, "utf8"));
      data.concepts.reverse();
      writeFileSync(target, JSON.stringify(data));
    }
    const modulesTarget = join(temporary, "records/concepts/service-modules.json");
    const modules = JSON.parse(readFileSync(modulesTarget, "utf8"));
    modules.modules.reverse();
    writeFileSync(modulesTarget, JSON.stringify(modules));
  }
  const emptyServerOnly = join(temporary, "server-only.js");
  const compiled = join(temporary, "service-engine-query-matrix.cjs");
  writeFileSync(emptyServerOnly, "");
  execFileSync(join(root, "node_modules/.bin/esbuild"), [
    join(temporary, "scripts/service-engine-query-matrix.ts"),
    "--bundle",
    "--platform=node",
    "--format=cjs",
    `--outfile=${compiled}`,
    `--tsconfig=${testConfig}`,
    `--alias:server-only=${emptyServerOnly}`,
  ], { cwd: root, stdio: "pipe" });
  const semanticStartedAt = performance.now();
  const execution = spawnSync("node", [compiled], {
    cwd: temporary,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (execution.status !== 0) throw new Error(`Service Engine query matrix exited with status ${execution.status}`);
  process.stderr.write(`Semantic execution: ${((performance.now() - semanticStartedAt) / 1000).toFixed(2)}s\n`);
  const result = execution.stdout;
  if (!result.trim()) throw new Error("Service Engine query matrix produced no acceptance report");
  const report = JSON.parse(result);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
