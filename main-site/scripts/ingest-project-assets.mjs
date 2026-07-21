#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = join(root, "public", "images", "projects");
const timestamp = new Date().toISOString();

const folderProjects = {
  "118sports": "118-sports",
  best_indies: "best-indies",
  bonsaiTOL: "bonsai-tree-of-life",
  cannvent: "cannvent",
  community_supplies: "community-supplies",
  findthy: "findthy",
  house_of_gold: "house-of-gold",
  imikegold: "imikegold",
  just_enterprises: "just-enterprises",
  metroplist: "metroplist",
  mickz: "mickz",
  multiplied_intelligence: "multiplied-intelligence",
  musical_intelligence: "musical-intelligence",
  ourgani: "ourgani",
  protosynthesis: "protosynthesis",
  saveours: "saveours",
  vendfm: "vendfm",
  visionary_guide: "the-visionary-guide",
  waffll: "waffll",
  wibc: "wibc",
  wrappedfm: "wrappedfm",
};

const preferredWork = {
  mickz: {
    branding_systems: "mickz-identity-development",
    mock_ups: "mickz-product-system",
    default: "mickz-digital-assets",
  },
  "musical-intelligence": {
    logo_restore: "musical-intelligence-content-architecture",
    default: "musical-intelligence-web-experience",
  },
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const titleCase = (value) => value
  .replace(/\.[^.]+$/, "")
  .replace(/[-_+]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function filesBelow(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === ".DS_Store") return [];
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

const projects = new Map(
  readdirSync(join(root, "records", "projects"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const record = readJson(join(root, "records", "projects", name));
      return [record.slug, record];
    }),
);
const work = new Map(
  readdirSync(join(root, "records", "work"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const record = readJson(join(root, "records", "work", name));
      return [record.slug, record];
    }),
);

function workFor(projectSlug, relativeParts) {
  const configured = preferredWork[projectSlug];
  if (configured) {
    const folderMatch = relativeParts.find((part) => configured[part]);
    return work.get(folderMatch ? configured[folderMatch] : configured.default);
  }
  return work.get(`${projectSlug}-system-development`);
}

function roleFor(parts, filename) {
  const path = parts.join("/").toLowerCase();
  if (filename.toLowerCase().includes("website")) return "cover";
  if (path.includes("mock_ups")) return "application";
  if (path.includes("logo")) return "identity";
  if (path.includes("branding") || path.includes("design_evolutions")) return "process";
  return "reference";
}

function descriptionFor(projectName, role) {
  const descriptions = {
    cover: `Homepage interface showing the public-facing digital system developed for ${projectName}.`,
    interface: `Interface evidence from the ${projectName} digital experience.`,
    identity: `Identity-system evidence showing a logo or mark developed for ${projectName}.`,
    process: `Development evidence showing the visual language, exploration or design evolution behind ${projectName}.`,
    application: `Applied brand and product-system evidence for ${projectName}.`,
    reference: `Supporting visual material recorded for ${projectName}.`,
  };
  return descriptions[role];
}

let created = 0;
let updated = 0;
let linked = 0;

for (const asset of filesBelow(assetRoot).sort()) {
  const relativePath = relative(assetRoot, asset);
  const parts = relativePath.split(sep);
  const projectSlug = folderProjects[parts[0]];
  if (!projectSlug) throw new Error(`No Project mapping for asset folder ${parts[0]}.`);
  const project = projects.get(projectSlug);
  const contribution = workFor(projectSlug, parts.slice(1, -1));
  if (!project || !contribution) throw new Error(`No Project/Work mapping for ${relativePath}.`);

  const filename = basename(asset);
  const role = roleFor(parts, filename);
  const evidenceSlug = slugify(`${projectSlug}-${relativePath.replace(extname(relativePath), "")}`);
  const evidencePath = join(root, "records", "evidence", `${evidenceSlug}.json`);
  const existing = existsSync(evidencePath) ? readJson(evidencePath) : null;
  const publicPath = `/images/projects/${relativePath.split(sep).join("/")}`;
  const title = role === "cover"
    ? `${project.name} website interface`
    : titleCase(filename);

  writeJson(evidencePath, {
    id: existing?.id ?? randomUUID(),
    recordType: "evidence",
    schemaVersion: 1,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    slug: evidenceSlug,
    title,
    description: descriptionFor(project.name, role),
    evidenceType: role === "cover" ? "website" : "image",
    role,
    sequence: parts.sort ? filesBelow(join(assetRoot, parts[0])).sort().indexOf(asset) : 0,
    visibility: "public",
    assetPath: publicPath,
    sourceTitle: project.name,
    placeholder: false,
  });
  existing ? updated++ : created++;

  const evidence = readJson(evidencePath);
  const relationshipSlug = `${contribution.slug}-evidenced-by-${evidenceSlug}`;
  const relationshipPath = join(root, "records", "relationships", `${relationshipSlug}.json`);
  const existingRelationship = existsSync(relationshipPath) ? readJson(relationshipPath) : null;
  writeJson(relationshipPath, {
    id: existingRelationship?.id ?? randomUUID(),
    recordType: "relationship",
    schemaVersion: 1,
    createdAt: existingRelationship?.createdAt ?? timestamp,
    updatedAt: timestamp,
    slug: relationshipSlug,
    sourceId: contribution.id,
    sourceType: "work",
    relationshipType: "evidenced-by",
    targetId: evidence.id,
    targetType: "evidence",
  });
  if (!existingRelationship) linked++;
}

console.log(JSON.stringify({ assets: created + updated, created, updated, relationshipsCreated: linked }, null, 2));
