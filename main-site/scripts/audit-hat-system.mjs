#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

const sourceRoot = statExists(join(projectRoot, "src", "system", "registry.ts"))
  ? join(projectRoot, "src")
  : projectRoot;
const registryPath = join(sourceRoot, "system", "registry.ts");
const hatsDirectory = join(projectRoot, "records", "hats");

function statExists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

function sourceFiles(directory) {
  if (!statExists(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...sourceFiles(path));
    if (stats.isFile() && /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry)) files.push(path);
  }
  return files;
}

const hats = readdirSync(hatsDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(hatsDirectory, file), "utf8")));

const hatIds = hats.map((hat) => hat.id);
const hatKeys = hats.map((hat) => hat.legacyKey);
const hatNames = hats.map((hat) => hat.name).filter(Boolean);
const slugs = hats.map((hat) => hat.slug).filter(Boolean);
const relationshipTargets = hats.flatMap((hat) =>
  (hat.relationships ?? []).map((relationship) => relationship.targetId),
);
const knownIds = new Set(hatIds);
const brokenTargets = [
  ...new Set(relationshipTargets.filter((id) => !knownIds.has(id))),
].sort();

const scanRoots = ["app", "components", "system"]
  .map((directory) => join(sourceRoot, directory))
  .filter(statExists);
const files = scanRoots.flatMap(sourceFiles);
const consumers = [];
const idUses = [];
const hardCodedCounts = [];
const arrayIdentityAssumptions = [];

for (const path of files) {
  const content = readFileSync(path, "utf8");
  const displayPath = relative(projectRoot, path);

  if (
    path !== registryPath &&
    /system\/registry|system\/profile\/hat-profile|system\/services\/(?:service-engine|polygon-engine|weights)/.test(content)
  ) {
    consumers.push(displayPath);
  }

  content.split("\n").forEach((line, index) => {
    const location = `${displayPath}:${index + 1}`;
    if (/\bhat\.id\b|\bh\.id\b|\bactiveHat\?\.id\b/.test(line)) {
      idUses.push(`${location} ${line.trim()}`);
    }
    if (/\b(?:105|133)\b/.test(line)) {
      hardCodedCounts.push(`${location} ${line.trim()}`);
    }
    if (/key=\{(?:i|index)\}|hats\s*\[\s*(?:i|index|\d+)\s*\]/.test(line)) {
      arrayIdentityAssumptions.push(`${location} ${line.trim()}`);
    }
  });
}

const categories = Object.fromEntries(
  [...new Set(hats.map((hat) => hat.category))]
    .sort()
    .map((category) => [category, hats.filter((hat) => hat.category === category).length]),
);

const report = {
  canonicalSource: "records/hats/*.json",
  hatCount: hats.length,
  categoryCounts: categories,
  relationshipCount: relationshipTargets.length,
  duplicateKeys: duplicates(hatKeys),
  duplicateIds: duplicates(hatIds),
  duplicateNames: duplicates(hatNames),
  duplicateSlugs: duplicates(slugs),
  hatsWithoutSlugs: hats.filter((hat) => !hat.slug).length,
  brokenRelationshipTargets: brokenTargets,
  registryConsumers: [...new Set(consumers)].sort(),
  hardCodedCounts,
  hatIdUses: idUses,
  possibleArrayIdentityAssumptions: arrayIdentityAssumptions,
};

console.log(JSON.stringify(report, null, 2));

const errors = [
  report.duplicateKeys.length && "duplicate Hat keys",
  report.duplicateIds.length && "duplicate Hat UUIDs",
  report.duplicateNames.length && "duplicate Hat names",
  report.duplicateSlugs.length && "duplicate Hat slugs",
  report.brokenRelationshipTargets.length && "broken relationship targets",
].filter(Boolean);

if (errors.length) {
  console.error(`\nHat audit failed: ${errors.join(", ")}.`);
  process.exitCode = 1;
}
