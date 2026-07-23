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
  bamboo_graph: "bamboograph",
  best_indies: "best-indies",
  bonsaiTOL: "bonsai-tree-of-life",
  cannvent: "cannvent",
  community_supplies: "community-supplies",
  findthy: "findthy",
  gouldbourne: "gouldbourne-management",
  gouldbourne_group: "gouldbourne-registry",
  house_of_gold: "house-of-gold",
  imikegold: "imikegold",
  just_enterprises: "just-enterprises",
  metroplist: "metroplist",
  mickz: "mickz",
  mike_gold: "mikegold-engineer",
  multiplied_intelligence: "multiplied-intelligence",
  musical_intelligence: "musical-intelligence",
  ourgani: "ourgani",
  protosynthesis: "protosynthesis",
  saveours: "saveours",
  vendfm: "vendfm",
  viisiioiiv: "viisiioiiv",
  visionary_guide: "the-visionary-guide",
  waffll: "waffll",
  wibc: "wibc",
  wrappedfm: "wrappedfm",
  zenthapy: "zenthapy",
};

const preferredWork = {
  "mikegold-engineer": { default: "mikegold-engineer-system-development" },
  mickz: {
    branding_systems: "mickz-identity-development",
    mock_ups: "mickz-product-system",
    default: "mickz-digital-assets",
  },
  "musical-intelligence": {
    logo_restore: "musical-intelligence-identity-restoration",
    default: "musical-intelligence-web-experience",
  },
  saveours: {
    design_evolutions: "saveours-identity-language-development",
    default: "saveours-system-development",
  },
  wrappedfm: {
    logo_design: "wrappedfm-identity-development",
    default: "wrappedfm-system-development",
  },
  findthy: {
    logo_designs: "findthy-identity-language-development",
    default: "findthy-system-development",
  },
  ourgani: {
    logo_design: "ourgani-identity-development",
    default: "ourgani-system-development",
  },
  zenthapy: {
    logo_design: "zenthapy-identity-development",
    default: "zenthapy-system-development",
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
const evidenceFiles = readdirSync(join(root, "records", "evidence"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const path = join(root, "records", "evidence", name);
    return { path, record: readJson(path) };
  });

function workFor(projectSlug, relativeParts, filename) {
  const lowerFilename = filename.toLowerCase();
  const isWebFolder = relativeParts.some((part) => ["web_dev", "web_development", "web_developement"].includes(part));
  if (projectSlug === "cannvent" && lowerFilename.includes("app-website")) return work.get("cannvent-application-development");
  if (projectSlug === "cannvent" && lowerFilename.includes("space-website")) return work.get("cannvent-community-space-development");
  if (projectSlug === "protosynthesis" && isWebFolder) return work.get("protosynthesis-multiformat-web-development");
  if (projectSlug === "saveours" && isWebFolder) return work.get("saveours-platform-interface-development");
  const configured = preferredWork[projectSlug];
  if (configured) {
    const folderMatch = relativeParts.find((part) => configured[part]);
    return work.get(folderMatch ? configured[folderMatch] : configured.default);
  }
  return work.get(`${projectSlug}-system-development`);
}

function roleFor(parts, filename, projectFolder, project) {
  const path = parts.join("/").toLowerCase();
  const stem = slugify(filename.replace(extname(filename), ""));
  const mainWebsiteStems = new Set([
    slugify(`${projectFolder}-website`),
    slugify(`${projectFolder}-website-home`),
    slugify(`${project.slug}-website`),
    slugify(`${project.slug}-website-home`),
    slugify(`${project.name}-website`),
    slugify(`${project.name}-website-home`),
  ]);
  if (projectFolder === "ourgani" && stem === "ourgani") return "cover";
  if (["web_dev", "web_development", "web_developement"].some((folder) => path.includes(folder))) {
    return mainWebsiteStems.has(stem) ? "cover" : "interface";
  }
  if (filename.toLowerCase().includes("website")) return "cover";
  if (path.includes("hat_registry_system") || path.includes("spider_polygon")) return "interface";
  if (path.includes("runtime-user-save-state")) return "interface";
  if (path.includes("mock_ups")) return "application";
  if (path.includes("logo")) return "identity";
  if (path.includes("branding") || path.includes("design_evolutions")) return "process";
  return "reference";
}

function isNonStandardVariant(filename) {
  const stem = slugify(filename.replace(extname(filename), ""));
  return /(?:^|-)(?:switched|inverted|reversed|broken)(?:-|$)/.test(stem);
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
const roleCounters = new Map();

for (const asset of filesBelow(assetRoot).sort()) {
  const relativePath = relative(assetRoot, asset);
  const parts = relativePath.split(sep);
  const projectSlug = folderProjects[parts[0]];
  if (!projectSlug) throw new Error(`No Project mapping for asset folder ${parts[0]}.`);
  const project = projects.get(projectSlug);
  const filename = basename(asset);
  const contribution = workFor(projectSlug, parts.slice(1, -1), filename);
  if (!project || !contribution) throw new Error(`No Project/Work mapping for ${relativePath}.`);

  const role = roleFor(parts, filename, parts[0], project);
  const nonStandardVariant = isNonStandardVariant(filename);
  const counterKey = `${projectSlug}:${role}`;
  const roleIndex = (roleCounters.get(counterKey) ?? 0) + 1;
  roleCounters.set(counterKey, roleIndex);
  const evidenceSlug = slugify(`${projectSlug}-${relativePath.replace(extname(relativePath), "")}`);
  let evidencePath = join(root, "records", "evidence", `${evidenceSlug}.json`);
  let existing = existsSync(evidencePath) ? readJson(evidencePath) : null;
  if (!existing) {
    const assetStem = slugify(filename.replace(extname(filename), ""));
    const movedRecord = evidenceFiles.find(({ record }) =>
      record.sourceTitle === project.name &&
      record.assetPath &&
      slugify(basename(record.assetPath).replace(extname(record.assetPath), "")) === assetStem
    );
    if (movedRecord) {
      evidencePath = movedRecord.path;
      existing = movedRecord.record;
    }
  }
  const publicPath = `/images/projects/${relativePath.split(sep).join("/")}`;
  const titles = {
    cover: `${project.name} — website and digital experience`,
    interface: `${project.name} — interface study ${String(roleIndex).padStart(2, "0")}`,
    identity: `${project.name} — identity development ${String(roleIndex).padStart(2, "0")}`,
    process: `${project.name} — design-language study ${String(roleIndex).padStart(2, "0")}`,
    application: `${project.name} — applied identity ${String(roleIndex).padStart(2, "0")}`,
    reference: `${project.name} — supporting visual ${String(roleIndex).padStart(2, "0")}`,
  };
  const title = titles[role];

  writeJson(evidencePath, {
    id: existing?.id ?? randomUUID(),
    recordType: "evidence",
    schemaVersion: 1,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: existing?.updatedAt ?? timestamp,
    slug: existing?.slug ?? evidenceSlug,
    title: existing?.title ?? title,
    description: existing?.description ?? (nonStandardVariant
      ? `Non-standard web-direction variant retained as internal evidence for ${project.name}; excluded from public display by default.`
      : descriptionFor(project.name, role)),
    evidenceType: existing?.evidenceType ?? (role === "cover" ? "website" : "image"),
    role: existing?.role ?? role,
    sequence: existing?.sequence ?? roleIndex,
    visibility: nonStandardVariant ? "unlisted" : (existing?.visibility ?? "public"),
    assetPath: publicPath,
    sourceTitle: existing?.sourceTitle ?? project.name,
    ...(existing?.phase ? { phase: existing.phase } : {}),
    ...(existing?.period ? { period: existing.period } : {}),
    ...(existing?.previewSequence !== undefined ? { previewSequence: existing.previewSequence } : {}),
    ...(existing?.externalUrl ? { externalUrl: existing.externalUrl } : {}),
    ...(existing?.thumbnailUrl ? { thumbnailUrl: existing.thumbnailUrl } : {}),
    ...(existing?.presentation ? { presentation: existing.presentation } : {}),
    placeholder: false,
  });
  existing ? updated++ : created++;

  const evidence = readJson(evidencePath);
  const relationshipSlug = `${contribution.slug}-evidenced-by-${evidence.slug}`;
  const relationshipPath = join(root, "records", "relationships", `${relationshipSlug}.json`);
  const existingRelationship = existsSync(relationshipPath) ? readJson(relationshipPath) : null;
  writeJson(relationshipPath, {
    id: existingRelationship?.id ?? randomUUID(),
    recordType: "relationship",
    schemaVersion: 1,
    createdAt: existingRelationship?.createdAt ?? timestamp,
    updatedAt: existingRelationship?.updatedAt ?? timestamp,
    slug: relationshipSlug,
    sourceId: existingRelationship?.sourceId ?? contribution.id,
    sourceType: "work",
    relationshipType: "evidenced-by",
    targetId: evidence.id,
    targetType: "evidence",
    ...(existingRelationship?.role ? { role: existingRelationship.role } : {}),
    ...(existingRelationship?.supportedLensIds?.length ? { supportedLensIds: existingRelationship.supportedLensIds } : {}),
    ...(existingRelationship?.displayRoles?.length ? { displayRoles: existingRelationship.displayRoles } : {}),
    ...(Number.isFinite(existingRelationship?.priority) ? { priority: existingRelationship.priority } : {}),
  });
  if (!existingRelationship) linked++;
}

console.log(JSON.stringify({ assets: created + updated, created, updated, relationshipsCreated: linked }, null, 2));
