#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const recordsRoot = join(projectRoot, "records");

function readCollection(directory) {
  const path = join(recordsRoot, directory);
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({ file: join("records", directory, file), value: JSON.parse(readFileSync(join(path, file), "utf8")) }));
}

const hats = readCollection("hats");
const work = readCollection("work");
const relationships = readCollection("relationships");
const claimsPath = join(recordsRoot, "claims", "service-engine-vertical-slice.json");
const claims = existsSync(claimsPath)
  ? JSON.parse(readFileSync(claimsPath, "utf8")).claims ?? []
  : [];

const publishedHatBySlug = new Map(
  hats
    .filter(({ value }) => value.status === "published")
    .map(({ value }) => [value.slug, value]),
);
const hatById = new Map(hats.map(({ value }) => [value.id, value]));
const appliedRelationshipHatsByWorkId = new Map();
for (const { value: relationship } of relationships) {
  if (relationship.relationshipType !== "applied-in" || relationship.targetType !== "work") continue;
  const hat = hatById.get(relationship.sourceId);
  if (!hat || hat.status !== "published") continue;
  const current = appliedRelationshipHatsByWorkId.get(relationship.targetId) ?? [];
  current.push(hat.slug);
  appliedRelationshipHatsByWorkId.set(relationship.targetId, current);
}

const confirmedClaimHatsByWorkSlug = new Map();
const authoredClaimHatsByWorkSlug = new Map();
for (const claim of claims) {
  const target = claim.status === "confirmed"
    ? confirmedClaimHatsByWorkSlug
    : claim.status === "authored"
      ? authoredClaimHatsByWorkSlug
      : null;
  if (!target) continue;
  const current = target.get(claim.workSlug) ?? [];
  target.set(
    claim.workSlug,
    [...new Set([...current, ...(claim.hatAssignments ?? []).map((assignment) => assignment.hatSlug)])],
  );
}

const errors = [];
const warnings = [];
const coverage = [];

for (const { file, value: workRecord } of work) {
  const declared = Array.isArray(workRecord.appliedHatSlugs)
    ? [...new Set(workRecord.appliedHatSlugs)]
    : [];
  const related = [...new Set(appliedRelationshipHatsByWorkId.get(workRecord.id) ?? [])];
  const confirmed = [...new Set(confirmedClaimHatsByWorkSlug.get(workRecord.slug) ?? [])];
  const authored = [...new Set(authoredClaimHatsByWorkSlug.get(workRecord.slug) ?? [])];

  for (const slug of declared) {
    if (!publishedHatBySlug.has(slug)) errors.push(`${file} declares unknown or unpublished Hat ${slug}.`);
  }
  if (declared.length !== (workRecord.appliedHatSlugs?.length ?? 0)) {
    errors.push(`${file} repeats a declared Hat.`);
  }

  const effective = [...new Set([...declared, ...related, ...confirmed])];
  if (workRecord.visibility === "public" && !effective.length) {
    errors.push(`${file} is public Work with no confirmed Hat capability.`);
  }
  if (workRecord.visibility === "public" && !declared.length && !related.length && authored.length) {
    warnings.push(`${file} relies only on authored service claims; materialise reviewed Hat assignments before the Hat audit is final.`);
  }

  coverage.push({
    workSlug: workRecord.slug,
    visibility: workRecord.visibility,
    declared,
    relationships: related,
    confirmedClaims: confirmed,
    authoredCandidates: authored,
    effective
  });
}

const publicCoverage = coverage.filter((item) => item.visibility === "public");
console.log(JSON.stringify({
  publicWork: publicCoverage.length,
  coveredPublicWork: publicCoverage.filter((item) => item.effective.length).length,
  uncoveredPublicWork: publicCoverage.filter((item) => !item.effective.length).map((item) => item.workSlug),
  assignmentSources: {
    declaredWorkRecords: publicCoverage.filter((item) => item.declared.length).length,
    relationshipRecords: publicCoverage.filter((item) => item.relationships.length).length,
    confirmedClaims: publicCoverage.filter((item) => item.confirmedClaims.length).length,
    authoredCandidatesOnly: publicCoverage.filter((item) => !item.declared.length && !item.relationships.length && item.authoredCandidates.length).length
  },
  errors,
  warnings
}, null, 2));

if (errors.length) process.exitCode = 1;
