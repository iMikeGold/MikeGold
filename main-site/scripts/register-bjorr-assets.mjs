#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = join(root, "public", "images", "projects", "bjorr");
const evidenceRoot = join(root, "records", "evidence");
const relationshipRoot = join(root, "records", "relationships");
const work = JSON.parse(
  readFileSync(join(root, "records", "work", "bjorr-system-development.json"), "utf8"),
);
const timestamp = "2026-07-24T00:00:00.000Z";

const details = {
  "bjorr-gold-silver-registers.png": [
    "Bjórr identity registers — School and Institution",
    "Permanent paired identity asset preserving the lowercase-b School mark in old gold and shadow beside the uppercase-B Institution mark in white, silver, steel and stone.",
  ],
  "dashboard.png": [
    "Learner account — current learning dashboard",
    "Account home showing the learner’s current field, pathway, active course, mastery state, progress and bounded adaptive-support observations.",
  ],
  "my-learning.png": [
    "Learner account — connected courses and progress",
    "My Learning view connecting each course to the learner’s current state, study mode, expected duration and recorded progress.",
  ],
  "online-course.png": [
    "Adaptive course — light learning state",
    "Course route showing reading, practice and connection-building activities within a visible sequence and progress model.",
  ],
  "online-course-dark.png": [
    "Adaptive course — dark learning state",
    "Dark-state course route demonstrating how the same adaptive learning structure persists across learner-controlled visual settings.",
  ],
  "user-interface-customisation.png": [
    "Learner environment — colour-state controls",
    "Settings interface allowing a learner to choose Dark Crimson, Soft Black, Cream or Soft White while retaining the same information hierarchy.",
  ],
  "interface-black.png": [
    "School interface state — Soft Black",
    "Reduced-glare School interface state using near-black surfaces, restrained blue depth and quiet crimson signals.",
  ],
  "interface-cream.png": [
    "School interface state — Cream",
    "Warm School interface state using institutional cream, ink-blue text and deliberate crimson accents.",
  ],
  "interface-crimson-blue.png": [
    "School interface state — Dark Crimson",
    "Deep School interface state combining midnight blue foundations with crimson action and warm cream typography.",
  ],
  "interface-white.png": [
    "School interface state — Soft White",
    "Bright School interface state using white-cream fields, soft blue structure and warm contrast.",
  ],
  "main-website.png": [
    "Bjórr connected-system website",
    "Primary Bjórr environment establishing routes between the School, learner experience and institutional knowledge.",
  ],
  "institution-website.png": [
    "Bjórr Institution website",
    "Institutional environment for academic authority, governance, standards, research and public record.",
  ],
  "school-website-black.png": [
    "School of Bjórr website — Soft Black",
    "Public School and learner-environment entry point shown in its reduced-glare Soft Black state.",
  ],
  "school-website-crimson-blue.png": [
    "School of Bjórr website — Dark Crimson",
    "Public School and learner-environment entry point shown in its Dark Crimson state.",
  ],
  "school-website-website.png": [
    "School of Bjórr website — Cream",
    "Public School and learner-environment entry point shown in its warm Cream state.",
  ],
  "school-website-white.png": [
    "School of Bjórr website — Soft White",
    "Public School and learner-environment entry point shown in its bright Soft White state.",
  ],
  "emblem-cream-gold-shadow.svg": [
    "School emblem — cream and gold shadow",
    "Lowercase-b School emblem treatment combining warm cream with the ceremonial gold-shadow register.",
  ],
  "yellow-stone-shadow300.webp": [
    "School emblem — yellow and stone shadow",
    "Compact School emblem application pairing a bright learning colour with the grounded stone-shadow register.",
  ],
  "crimson-blue-steel-01.svg": [
    "Institution emblem — crimson blue and steel",
    "Uppercase-B Institution emblem treatment combining the foundation blue with structural steel.",
  ],
  "crimson-blue-gold-01.svg": [
    "Institution emblem — crimson blue and gold",
    "Uppercase-B Institution emblem treatment connecting institutional blue to the shared gold identity.",
  ],
  "white-gold-01.svg": [
    "Institution emblem — white and gold",
    "Uppercase-B Institution emblem treatment for dark grounds, combining white clarity with shared gold.",
  ],
  "white-steel-01.svg": [
    "Institution emblem — white and steel",
    "Uppercase-B Institution emblem treatment using the core white and steel institutional palette.",
  ],
  "white-stone-01.svg": [
    "Institution emblem — white and stone",
    "Uppercase-B Institution emblem treatment using white and stone for grounded institutional applications.",
  ],
};

function filesBelow(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === ".DS_Store") return [];
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const existingEvidence = readdirSync(evidenceRoot)
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const path = join(evidenceRoot, name);
    return { path, record: JSON.parse(readFileSync(path, "utf8")) };
  });
const existingRelationships = readdirSync(relationshipRoot)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(join(relationshipRoot, name), "utf8")));

let created = 0;
let updated = 0;
let linked = 0;
let sequence = 10;

for (const asset of filesBelow(assetRoot).sort()) {
  const filename = basename(asset);
  if (filename === "identity-design.webp") continue;

  const relativePath = relative(join(root, "public"), asset).split(sep).join("/");
  const assetPath = `/${relativePath}`;
  const isLogo = relativePath.includes("/logo_design/");
  const isIdentityAsset = isLogo || filename === "bjorr-gold-silver-registers.png";
  const isAdaptive = relativePath.includes("/adaptive_learning/");
  const isWebsite = relativePath.includes("/web_build/");
  const isCuratedColourState = /^interface-(?:black|cream|crimson-blue|white)\.png$/.test(filename);
  const [title, description] = details[filename] ?? [
    `Bjórr asset — ${filename.replace(extname(filename), "").replaceAll(/[-_]/g, " ")}`,
    "Supporting production asset from the Bjórr identity and adaptive-learning system.",
  ];

  const matched = existingEvidence.find(
    ({ record }) =>
      record.sourceTitle === "Bjórr" &&
      record.assetPath &&
      basename(record.assetPath) === filename,
  );
  const slug =
    matched?.record.slug ??
    `bjorr-${slugify(relative(assetRoot, asset).replace(extname(asset), ""))}`;
  const evidencePath = matched?.path ?? join(evidenceRoot, `${slug}.json`);
  const role = isIdentityAsset ? "identity" : isAdaptive ? "interface" : isWebsite ? "interface" : "reference";
  const presentation = isIdentityAsset
    ? {
        facets: ["identity-system", "logo"],
        displayRoles: ["archive"],
        visualQuality: "supporting",
        aspectPreference: "square",
      }
    : isCuratedColourState
      ? {
          facets: ["application-interface", "web-interface"],
          displayRoles: ["archive"],
          visualQuality: "standard",
          aspectPreference: "landscape",
        }
    : {
        facets: isWebsite ? ["website", "web-interface"] : ["application-interface", "web-interface"],
        displayRoles: ["supporting", "gallery"],
        visualQuality: filename === "dashboard.png" || filename === "main-website.png" ? "hero" : "standard",
        aspectPreference: "landscape",
      };
  const record = {
    id: matched?.record.id ?? randomUUID(),
    recordType: "evidence",
    schemaVersion: 1,
    createdAt: matched?.record.createdAt ?? timestamp,
    updatedAt: timestamp,
    slug,
    title: matched?.record.title?.startsWith("Bjórr emblem —") ? matched.record.title : title,
    description: matched?.record.description ?? description,
    evidenceType: isWebsite ? "website" : "image",
    role,
    sequence: matched?.record.sequence ?? sequence++,
    visibility: "public",
    assetPath,
    sourceTitle: "Bjórr",
    phase: isIdentityAsset ? "Identity system" : isAdaptive ? "Adaptive learning experience" : "Digital platform",
    placeholder: false,
    presentation,
  };
  writeFileSync(evidencePath, `${JSON.stringify(record, null, 2)}\n`);
  matched ? updated++ : created++;

  const relationshipSlug = `${work.slug}-evidenced-by-${record.slug}`;
  const relationshipPath = join(relationshipRoot, `${relationshipSlug}.json`);
  const relationshipAlreadyExists = existingRelationships.some(
    (relationship) =>
      relationship.relationshipType === "evidenced-by" &&
      relationship.sourceId === work.id &&
      relationship.targetId === record.id,
  );
  if (!existsSync(relationshipPath) && !relationshipAlreadyExists) {
    const stableSeed = createHash("sha256").update(relationshipSlug).digest("hex");
    const relationshipId = `${stableSeed.slice(0, 8)}-${stableSeed.slice(8, 12)}-4${stableSeed.slice(13, 16)}-a${stableSeed.slice(17, 20)}-${stableSeed.slice(20, 32)}`;
    writeFileSync(
      relationshipPath,
      `${JSON.stringify(
        {
          id: relationshipId,
          recordType: "relationship",
          schemaVersion: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
          slug: relationshipSlug,
          sourceId: work.id,
          sourceType: "work",
          relationshipType: "evidenced-by",
          targetId: record.id,
          targetType: "evidence",
        },
        null,
        2,
      )}\n`,
    );
    linked++;
  }
}

console.log(JSON.stringify({ created, updated, relationshipsCreated: linked }, null, 2));
