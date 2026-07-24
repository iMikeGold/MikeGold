import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const runner = new URL("./run-service-engine-query-matrix.mjs", import.meta.url).pathname;
const run = (shuffle = false) => execFileSync("node", [runner], {
  encoding: "utf8",
  env: {
    ...process.env,
    SERVICE_INCLUDE_DETERMINISM_SNAPSHOTS: "1",
    ...(shuffle ? { SHUFFLE_SERVICE_RECORDS: "reverse" } : {}),
  },
});

const firstProcess = run();
const secondProcess = run();
const reversedRecordProcess = run(true);

assert.equal(secondProcess, firstProcess, "Separate Node processes produced different canonical analyses.");
assert.equal(reversedRecordProcess, firstProcess, "Reversing raw concept/module record arrays changed the canonical analysis.");

const original = JSON.parse(firstProcess);
const reversed = JSON.parse(reversedRecordProcess);
const originalSnapshots = original.determinismSnapshots;
const reversedSnapshots = reversed.determinismSnapshots;
const knowledgeHashes = originalSnapshots.map(({ result }) => result.diagnostics.knowledgeHash);
const reversedKnowledgeHashes = reversedSnapshots.map(({ result }) => result.diagnostics.knowledgeHash);
assert.deepEqual(reversedKnowledgeHashes, knowledgeHashes);
const analysisHashes = originalSnapshots.map(({ query, result }) => ({ query, hash: result.diagnostics.analysisHash }));
const reversedAnalysisHashes = reversedSnapshots.map(({ query, result }) => ({ query, hash: result.diagnostics.analysisHash }));
assert.deepEqual(reversedAnalysisHashes, analysisHashes);
assert.deepEqual(reversedSnapshots, originalSnapshots);

const publicStrings = (value, path = "") => {
  if (path.includes(".diagnostics")) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item, index) => publicStrings(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => publicStrings(item, `${path}.${key}`));
  return [];
};
assert.deepEqual(publicStrings(reversedSnapshots), publicStrings(originalSnapshots));
assert.deepEqual(
  reversedSnapshots.map(({ result }) => result.modules.map(({ id, status }) => `${status}:${id}`)),
  originalSnapshots.map(({ result }) => result.modules.map(({ id, status }) => `${status}:${id}`)),
);
const playback = originalSnapshots.find(({ query }) => query === "physical media playback installation");
assert.ok(playback?.result.modules.some(({ id }) => id === "media-system-definition"), "Hierarchy traversal did not inherit the media-system route.");

console.log(JSON.stringify({
  rawOrderProbe: "concept and module arrays reversed in isolated copied records",
  canonicalKnowledgeHash: { original: knowledgeHashes[0], reversed: reversedKnowledgeHashes[0], equal: "PASS" },
  analysisHashes,
  fullSemanticResultEquality: "PASS",
  publicLanguageEquality: "PASS",
  hierarchyTraversalEquality: "PASS",
  dependencyOrderingEquality: "PASS",
  crossProcessDeterminism: "PASS",
}, null, 2));
