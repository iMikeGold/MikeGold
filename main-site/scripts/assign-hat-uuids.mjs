#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const registryPath = join(projectRoot, "src", "system", "registry.ts");
const recordsDirectory = join(projectRoot, "records", "hats");
const migrationsDirectory = join(projectRoot, "records", "migrations");
const migrationPath = join(migrationsDirectory, "hat-id-map.v1.json");
const enteredArchiveAt = "2026-07-20T00:00:00.000Z";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loadCurrentHats() {
  const source = readFileSync(registryPath, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: registryPath,
  }).outputText;
  const module = { exports: {} };
  const execute = new Function("exports", "module", javascript);
  execute(module.exports, module);
  return module.exports.hats;
}

function loadPersistedHats() {
  if (!existsSync(recordsDirectory)) return null;
  const files = readdirSync(recordsDirectory).filter((file) => file.endsWith(".json"));
  if (!files.length) return null;
  return files.sort().map((file) => {
    const record = JSON.parse(readFileSync(join(recordsDirectory, file), "utf8"));
    return {
      id: record.legacyKey,
      slug: record.slug,
      name: record.name,
      category: record.category,
      type: record.type,
      description: record.description,
      tags: record.tags,
      weight: record.weight,
      relationships: (record.relationships ?? []).map((relationship) => ({
        ...relationship,
        targetId: relationship.targetId,
      })),
      details: record.details,
      persistedId: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.status,
    };
  });
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

const persistedHats = loadPersistedHats();
const hats = persistedHats ?? loadCurrentHats();
if (!Array.isArray(hats) || hats.length === 0) {
  throw new Error("The current Hat registry could not be loaded.");
}

const duplicateKeys = duplicates(hats.map((hat) => hat.id));
const duplicateNames = duplicates(hats.map((hat) => hat.name));
if (duplicateKeys.length || duplicateNames.length) {
  throw new Error(
    `Hat migration refused duplicates: keys=${duplicateKeys.join(",")}; names=${duplicateNames.join(",")}`,
  );
}

mkdirSync(recordsDirectory, { recursive: true });
mkdirSync(migrationsDirectory, { recursive: true });

const existingMap = existsSync(migrationPath)
  ? JSON.parse(readFileSync(migrationPath, "utf8"))
  : {};
const migrationMap = { ...existingMap };
let assigned = 0;

for (const hat of hats) {
  if (!migrationMap[hat.id]) {
    migrationMap[hat.id] = hat.persistedId ?? randomUUID();
    assigned += 1;
  }
  if (hat.persistedId && migrationMap[hat.id] !== hat.persistedId) {
    throw new Error(`Migration map disagrees with persisted UUID for ${hat.id}.`);
  }
}

const mappedIds = Object.values(migrationMap);
const duplicateUuids = duplicates(mappedIds);
const invalidUuids = mappedIds.filter((id) => !uuidPattern.test(id));
if (duplicateUuids.length || invalidUuids.length) {
  throw new Error("Hat migration map contains duplicate or invalid UUIDs.");
}

const knownKeys = new Set(hats.map((hat) => hat.id));
for (const key of Object.keys(migrationMap)) {
  if (!knownKeys.has(key)) {
    throw new Error(`Migration map contains unknown Hat key: ${key}`);
  }
}

for (const hat of hats) {
  const path = join(recordsDirectory, `${hat.id}.json`);
  const existingRecord = existsSync(path)
    ? JSON.parse(readFileSync(path, "utf8"))
    : null;
  const id = migrationMap[hat.id];

  if (existingRecord && existingRecord.id !== id) {
    throw new Error(`Refusing to replace the persisted UUID for ${hat.id}.`);
  }

  const relationships = (hat.relationships ?? []).map((relationship) => {
    const targetId = persistedHats
      ? relationship.targetId
      : migrationMap[relationship.targetId];
    if (!targetId) {
      throw new Error(
        `Hat ${hat.id} references missing relationship target ${relationship.targetId}.`,
      );
    }
    return { ...relationship, targetId };
  });

  const record = {
    id,
    recordType: "hat",
    schemaVersion: 1,
    createdAt: existingRecord?.createdAt ?? hat.createdAt ?? enteredArchiveAt,
    updatedAt: existingRecord?.updatedAt ?? hat.updatedAt ?? enteredArchiveAt,
    legacyKey: hat.id,
    slug: hat.slug ?? hat.id,
    name: hat.name,
    status: existingRecord?.status ?? hat.status ?? "published",
    category: hat.category,
    type: hat.type,
    ...(hat.description ? { description: hat.description } : {}),
    tags: hat.tags,
    ...(hat.weight ? { weight: hat.weight } : {}),
    ...(relationships.length ? { relationships } : {}),
    ...(hat.details ? { details: hat.details } : {}),
  };

  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

const expectedFiles = new Set(hats.map((hat) => `${hat.id}.json`));
const unexpectedFiles = readdirSync(recordsDirectory).filter(
  (file) => file.endsWith(".json") && !expectedFiles.has(file),
);
if (unexpectedFiles.length) {
  throw new Error(`Unexpected Hat record files: ${unexpectedFiles.join(", ")}`);
}

const orderedMap = Object.fromEntries(
  Object.entries(migrationMap).sort(([left], [right]) => left.localeCompare(right)),
);
writeFileSync(migrationPath, `${JSON.stringify(orderedMap, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      hats: hats.length,
      assigned,
      preserved: hats.length - assigned,
      relationshipTargetsMigrated: hats.reduce(
        (count, hat) => count + (hat.relationships?.length ?? 0),
        0,
      ),
      migrationMap: "records/migrations/hat-id-map.v1.json",
    },
    null,
    2,
  ),
);
