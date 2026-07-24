import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const cases = [
  {
    name: "duplicate concept",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => data.concepts.push({ ...data.concepts[0] }),
    expected: "Duplicate concept slug",
  },
  {
    name: "broken concept edge",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => data.concepts[0].relatedConceptSlugs = ["missing-concept"],
    expected: "references unknown concept missing-concept",
  },
  {
    name: "broken module dependency",
    file: "records/concepts/service-modules.json",
    mutate: (data) => data.modules[0].dependencies = ["missing-module"],
    expected: "references unknown dependency missing-module",
  },
  {
    name: "invalid umbrella",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => data.concepts[0].narrowerConceptSlugs = [],
    expected: "has no narrower routes",
  },
  {
    name: "orphan quality modifier",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => {
      const quality = data.concepts.find((record) => record.kind === "quality");
      quality.modifierPolicy = { requiresTarget: true, canModifyKinds: [] };
    },
    expected: "requires a target but declares no compatible kinds",
  },
  {
    name: "uncontrolled phrase collision",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => data.concepts[1].phrases.push(data.concepts[0].phrases[0]),
    expected: "without a controlled ambiguity policy",
  },
  {
    name: "dependency cycle",
    file: "records/concepts/service-modules.json",
    mutate: (data) => {
      const first = data.modules[0];
      const second = data.modules[1];
      first.dependencies = [second.id];
      second.dependencies = [first.id];
    },
    expected: "Unsupported module dependency cycle:",
  },
  {
    name: "sense binding to module",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => {
      data.concepts.find((record) => record.slug === "operational-state").senseBindings[0].resolvedConceptSlugs = ["cloud-operations"];
    },
    expected: "resolves directly to delivery module cloud-operations",
  },
  {
    name: "sense binding to Hat",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => {
      data.concepts.find((record) => record.slug === "operational-state").senseBindings[0].resolvedConceptSlugs = ["systems-engineer"];
    },
    expected: "resolves directly to Hat systems-engineer",
  },
  {
    name: "sense binding to Work",
    file: "records/concepts/semantic-concept-extensions.json",
    mutate: (data) => {
      data.concepts.find((record) => record.slug === "operational-state").senseBindings[0].resolvedConceptSlugs = ["bamboograph-system-development"];
    },
    expected: "resolves directly to Work bamboograph-system-development",
  },
  {
    name: "alternate module source",
    file: "records/concepts/knowledge-manifest.json",
    mutate: (data) => data.moduleSource = "records/service-modules/service-modules.json",
    expected: "module source must be records/concepts/service-modules.json",
  },
  {
    name: "duplicate module dataset",
    file: "records/concepts/knowledge-manifest.json",
    mutate: () => {},
    prepare: (temporary) => {
      mkdirSync(join(temporary, "records/service-modules"), { recursive: true });
      cpSync(
        join(temporary, "records/concepts/service-modules.json"),
        join(temporary, "records/service-modules/service-modules.json"),
      );
    },
    expected: "Expected one canonical service-module dataset",
  },
];

for (const [fixtureIndex, fixture] of cases.entries()) {
  const startedAt = performance.now();
  const temporary = mkdtempSync(join(tmpdir(), "service-knowledge-invalid-"));
  try {
    cpSync(join(root, "records"), join(temporary, "records"), { recursive: true });
    mkdirSync(join(temporary, "scripts"), { recursive: true });
    cpSync(join(root, "scripts/validate-service-knowledge.mjs"), join(temporary, "scripts/validate-service-knowledge.mjs"));
    const target = join(temporary, fixture.file);
    const data = JSON.parse(readFileSync(target, "utf8"));
    fixture.mutate(data);
    writeFileSync(target, JSON.stringify(data, null, 2));
    fixture.prepare?.(temporary);
    let output = "";
    try {
      execFileSync("node", [join(temporary, "scripts/validate-service-knowledge.mjs")], { encoding: "utf8", stdio: "pipe" });
      assert.fail(`${fixture.name} was accepted`);
    } catch (error) {
      output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    }
    assert.match(output, new RegExp(fixture.expected.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${fixture.name} did not report the expected error`);
    console.log(`[${fixtureIndex + 1}/${cases.length}] ${fixture.name} — rejected — ${((performance.now() - startedAt) / 1000).toFixed(1)}s`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

console.log(JSON.stringify({ invalidFixturesRejected: cases.map(({ name }) => name) }, null, 2));
