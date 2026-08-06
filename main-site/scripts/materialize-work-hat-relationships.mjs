#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const recordsRoot = join(projectRoot, "records");
const relationshipsRoot = join(recordsRoot, "relationships");
mkdirSync(relationshipsRoot, { recursive: true });

function readCollection(directory) {
  const path = join(recordsRoot, directory);
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({ file, value: JSON.parse(readFileSync(join(path, file), "utf8")) }));
}

function deterministicUuid(value) {
  const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const hats = readCollection("hats");
const work = readCollection("work");
const relationships = readCollection("relationships");
const publishedHatBySlug = new Map(
  hats
    .filter(({ value }) => value.status === "published")
    .map(({ value }) => [value.slug, value]),
);
const existingAppliedIn = new Set(
  relationships
    .filter(({ value }) => value.relationshipType === "applied-in")
    .map(({ value }) => `${value.sourceId}:${value.targetId}`),
);

const created = [];
const invalid = [];

for (const { value: workRecord } of work) {
  const declaredHatSlugs = workRecord.appliedHatSlugs;
  if (declaredHatSlugs == null) continue;
  if (!Array.isArray(declaredHatSlugs)) {
    invalid.push(`${workRecord.slug}: appliedHatSlugs must be an array.`);
    continue;
  }

  for (const hatSlug of [...new Set(declaredHatSlugs)]) {
    const hat = publishedHatBySlug.get(hatSlug);
    if (!hat) {
      invalid.push(`${workRecord.slug}: unknown or unpublished Hat ${hatSlug}.`);
      continue;
    }

    const relationshipKey = `${hat.id}:${workRecord.id}`;
    if (existingAppliedIn.has(relationshipKey)) continue;

    const slug = `${hat.slug}-applied-in-${workRecord.slug}`;
    const timestamp = workRecord.updatedAt ?? workRecord.createdAt;
    const relationship = {
      id: deterministicUuid(`work-hat:${hat.id}:${workRecord.id}`),
      recordType: "relationship",
      schemaVersion: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      slug,
      sourceId: hat.id,
      sourceType: "hat",
      relationshipType: "applied-in",
      targetId: workRecord.id,
      targetType: "work",
      role: "primary",
      provenance: {
        source: "work.appliedHatSlugs",
        reviewState: "declared"
      }
    };

    const filename = `declared-${slug}.json`;
    writeFileSync(join(relationshipsRoot, filename), `${JSON.stringify(relationship, null, 2)}\n`);
    existingAppliedIn.add(relationshipKey);
    created.push(filename);
  }
}

console.log(JSON.stringify({ created: created.length, files: created, invalid }, null, 2));
if (invalid.length) process.exitCode = 1;
