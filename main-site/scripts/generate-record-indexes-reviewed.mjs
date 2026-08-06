#!/usr/bin/env node

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const canonicalGeneratorPath = join(scriptDirectory, "generate-record-indexes.mjs");
const runtimeGeneratorPath = join(scriptDirectory, ".generate-record-indexes.reviewed.runtime.mjs");
const canonicalSource = readFileSync(canonicalGeneratorPath, "utf8");

const previousBlock = `    const claimHatSlugs = serviceEngineClaims
      .filter((claim) => claim.workSlug === record.slug && ["authored", "confirmed"].includes(claim.status))
      .flatMap((claim) => claim.hatAssignments ?? [])
      .map((assignment) => assignment.hatSlug)
      .filter((slug) => publicHats.some((hat) => hat.slug === slug));
    const appliedHatSlugs = [...new Set([...relationshipHatSlugs, ...claimHatSlugs])];`;

const reviewedBlock = `    const declaredHatSlugs = (record.appliedHatSlugs ?? [])
      .filter((slug) => publicHats.some((hat) => hat.slug === slug));
    const claimHatSlugs = serviceEngineClaims
      .filter((claim) => claim.workSlug === record.slug && claim.status === "confirmed")
      .flatMap((claim) => claim.hatAssignments ?? [])
      .map((assignment) => assignment.hatSlug)
      .filter((slug) => publicHats.some((hat) => hat.slug === slug));
    const appliedHatSlugs = [...new Set([...declaredHatSlugs, ...relationshipHatSlugs, ...claimHatSlugs])];`;

if (!canonicalSource.includes(previousBlock)) {
  throw new Error("The canonical generator no longer matches the reviewed Hat-assignment patch target.");
}

const runtimeSource = canonicalSource.replace(previousBlock, reviewedBlock);
writeFileSync(runtimeGeneratorPath, runtimeSource);

try {
  const result = spawnSync(process.execPath, [runtimeGeneratorPath], {
    cwd: join(scriptDirectory, ".."),
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
} finally {
  try {
    unlinkSync(runtimeGeneratorPath);
  } catch {
    // The runtime file may already be absent after an interrupted process.
  }
}
