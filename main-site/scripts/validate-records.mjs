#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const recordsRoot = join(projectRoot, "records");
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedVisibilities = new Set(["private", "unlisted", "public"]);
const allowedCapabilityGroups = new Set([
  "system-product-definition",
  "software-web-engineering",
  "infrastructure-operations",
  "brand-experience-systems",
  "media-asset-systems",
  "physical-technical-engineering",
]);
const allowedEvidenceRoles = new Set([
  "cover", "interface", "identity", "process", "application", "reference",
]);
const allowedEvidenceFacets = new Set(["project-overview", "website", "web-interface", "application-interface", "identity-system", "logo", "brand-application", "product-model", "system-architecture", "information-architecture", "process", "deployment", "infrastructure", "operations", "hardware", "electronics", "installation", "live-audio", "recording", "broadcast", "video", "photography", "editorial", "media-output"]);
const errors = [];
const warnings = [];

function jsonRecords(directory) {
  const path = join(recordsRoot, directory);
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file: join("records", directory, file),
      value: JSON.parse(readFileSync(join(path, file), "utf8")),
    }));
}

function duplicates(entries, select) {
  const seen = new Map();
  for (const entry of entries) {
    const value = select(entry.value);
    if (!value) continue;
    if (seen.has(value)) {
      errors.push(`${entry.file} duplicates ${value} from ${seen.get(value)}.`);
    } else {
      seen.set(value, entry.file);
    }
  }
}

function requireBaseRecord(entry, expectedType) {
  const record = entry.value;
  if (!uuidPattern.test(record.id ?? "")) errors.push(`${entry.file} has an invalid UUID.`);
  if (record.recordType !== expectedType) {
    errors.push(`${entry.file} must have recordType ${expectedType}.`);
  }
  if (!Number.isInteger(record.schemaVersion) || record.schemaVersion < 1) {
    errors.push(`${entry.file} has an invalid schemaVersion.`);
  }
  for (const field of ["createdAt", "updatedAt"]) {
    if (Number.isNaN(Date.parse(record[field] ?? ""))) {
      errors.push(`${entry.file} has an invalid ${field}.`);
    }
  }
  if (record.visibility && !allowedVisibilities.has(record.visibility)) {
    errors.push(`${entry.file} has invalid visibility ${record.visibility}.`);
  }
}

const collections = {
  hat: jsonRecords("hats"),
  project: jsonRecords("projects"),
  work: jsonRecords("work"),
  evidence: jsonRecords("evidence"),
  relationship: jsonRecords("relationships"),
};

for (const [type, entries] of Object.entries(collections)) {
  entries.forEach((entry) => requireBaseRecord(entry, type));
  duplicates(entries, (record) => record.id);
  duplicates(entries, (record) => record.slug);
}

duplicates(collections.hat, (record) => record.legacyKey);
duplicates(collections.hat, (record) => record.name);

const allById = new Map(
  Object.values(collections)
    .flat()
    .map((entry) => [entry.value.id, entry]),
);

for (const entry of collections.hat) {
  for (const relationship of entry.value.relationships ?? []) {
    const target = allById.get(relationship.targetId);
    if (!target || target.value.recordType !== "hat") {
      errors.push(`${entry.file} references missing Hat ${relationship.targetId}.`);
    }
  }
}

for (const entry of collections.work) {
  const project = allById.get(entry.value.projectId);
  if (!project || project.value.recordType !== "project") {
    errors.push(`${entry.file} references missing Project ${entry.value.projectId}.`);
  }
  if (!Array.isArray(entry.value.capabilityGroupIds) || !entry.value.capabilityGroupIds.length) {
    errors.push(`${entry.file} must have at least one capability group.`);
  } else {
    for (const group of entry.value.capabilityGroupIds) {
      if (!allowedCapabilityGroups.has(group)) {
        errors.push(`${entry.file} has unknown capability group ${group}.`);
      }
    }
  }
}

for (const entry of collections.project) {
  for (const preference of entry.value.lensPresentationPreferences ?? []) {
    if (!allowedCapabilityGroups.has(preference.lensId)) errors.push(`${entry.file} has unknown lens presentation preference ${preference.lensId}.`);
    if (preference.editorialBoost != null && (!Number.isFinite(preference.editorialBoost) || preference.editorialBoost < -10 || preference.editorialBoost > 10)) {
      errors.push(`${entry.file} editorialBoost must be between -10 and 10.`);
    }
    if (preference.editorialSequence != null && (!Number.isInteger(preference.editorialSequence) || preference.editorialSequence < 0)) {
      errors.push(`${entry.file} editorialSequence must be a non-negative integer.`);
    }
  }
}

for (const entry of collections.evidence) {
  if (entry.value.role && !allowedEvidenceRoles.has(entry.value.role)) {
    errors.push(`${entry.file} has unknown evidence role ${entry.value.role}.`);
  }
  if (entry.value.assetPath) {
    const asset = join(projectRoot, "public", entry.value.assetPath.replace(/^\//, ""));
    if (!existsSync(asset)) errors.push(`${entry.file} references missing asset ${entry.value.assetPath}.`);
  }
  for (const facet of entry.value.presentation?.facets ?? []) {
    if (!allowedEvidenceFacets.has(facet)) errors.push(`${entry.file} has unknown evidence facet ${facet}.`);
  }
  if (entry.value.visibility === "public" && !entry.value.title) errors.push(`${entry.file} has no accessible alternative title.`);
}

for (const entry of collections.relationship) {
  for (const field of ["sourceId", "targetId"]) {
    if (!allById.has(entry.value[field])) {
      errors.push(`${entry.file} has missing ${field} ${entry.value[field]}.`);
    }
  }
  for (const lensId of entry.value.supportedLensIds ?? []) {
    if (!allowedCapabilityGroups.has(lensId)) errors.push(`${entry.file} has unknown supported lens ${lensId}.`);
  }
}

const evidenceIdsLinkedFromWork = new Set(collections.relationship
  .filter((entry) => entry.value.relationshipType === "evidenced-by" && entry.value.sourceType === "work")
  .map((entry) => entry.value.targetId));
for (const entry of collections.evidence) {
  if (entry.value.visibility === "public" && !entry.value.placeholder && !evidenceIdsLinkedFromWork.has(entry.value.id)) {
    errors.push(`${entry.file} is public evidence attached to no Work Contribution.`);
  }
}

const generatedPublicPath = join(
  projectRoot,
  "src",
  "system",
  "generated",
  "public-hats.generated.ts",
);
if (existsSync(generatedPublicPath)) {
  const publicSource = readFileSync(generatedPublicPath, "utf8");
  for (const entry of collections.hat) {
    if (publicSource.includes(entry.value.id)) {
      errors.push(`Public Hat module leaks internal UUID for ${entry.value.slug}.`);
    }
  }
}

function outputFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? outputFiles(path) : [path];
  });
}

const outDirectory = join(projectRoot, "out");
if (existsSync(outDirectory)) {
  const publicOutput = outputFiles(outDirectory)
    .filter((path) => /\.(?:html|js|json|txt|xml)$/.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  for (const entry of collections.hat) {
    if (publicOutput.includes(entry.value.id)) {
      errors.push(`Static export leaks internal UUID for ${entry.value.slug}.`);
    }
  }
}

const registeredAssets = new Map(collections.evidence.flatMap((entry) => entry.value.assetPath ? [[entry.value.assetPath, entry.file]] : []));
const publicProjectAssetRoot = join(projectRoot, "public", "images", "projects");
const discoveredAssets = outputFiles(publicProjectAssetRoot)
  .filter((path) => !path.endsWith(".DS_Store"))
  .map((path) => `/${path.slice(join(projectRoot, "public").length + 1).replaceAll("\\\\", "/")}`);
const unregisteredAssets = discoveredAssets.filter((asset) => !registeredAssets.has(asset));
for (const asset of unregisteredAssets) warnings.push(`Unregistered public asset ${asset}.`);

for (const entry of collections.project) {
  if (!collections.work.some((work) => work.value.projectId === entry.value.id)) {
    warnings.push(`${entry.file} has no Work records.`);
  }
}

console.log(
  JSON.stringify(
    {
      counts: Object.fromEntries(
        Object.entries(collections).map(([type, entries]) => [type, entries.length]),
      ),
      errors,
      warnings,
      assets: { discovered: discoveredAssets.length, registered: discoveredAssets.length - unregisteredAssets.length, unregistered: unregisteredAssets },
    },
    null,
    2,
  ),
);

if (errors.length) process.exitCode = 1;
