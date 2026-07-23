#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const workDirectory = join(root, "records", "work");
const relationshipDirectory = join(root, "records", "relationships");
const projectDirectory = join(root, "records", "projects");
const calibrationPath = join(root, "records", "editorial", "lens-priority-calibration.json");
const reportPath = join(root, "docs", "work-system", "work-lens-migration-report.md");

const P = "physical-systems-engineering";
const D = "system-product-definition";
const S = "software-web-engineering";
const I = "infrastructure-operations";
const B = "brand-experience-systems";
const M = "media-production-distribution";
const aliases = {
  "physical-technical-engineering": P,
  "media-asset-systems": M,
};

const primaryGroups = {
  [P]: [
    "2xu-wetsuit-testing-distribution-systems",
    "bluedot-festival-the-orb-live-sound-system-design-and-installation",
    "bristow-operational-excellence-electronics-systems-engineering",
    "croydon-womens-network-iwd-camera-systems-and-setup",
    "crystal-palace-overground-festival-distribution-systems-and-signal-flow",
    "delmatic-connected-lighting-sensor-test-and-manufacturing-engineering",
    "delta-elektronika-power-systems-embedded-firmware-and-deployment-engineering",
    "delta-elektronika-power-systems-firmware-build-and-installation-engineering",
    "houston-texans-london-game-field-communications-and-telecom-redundancy-systems",
    "living-control-media-servers-pcb-prototyping-and-design",
    "philadelphia-eagles-nfl-wembley-field-communications-and-resilient-signal-systems",
    "playstation-croatia-ps5-sound-tour-audio-system-implementation",
    "stanhope-seta-flash-point-testing-scientific-equipment-and-test-systems",
    "the-frisbys-you-are-camera-system-setup",
  ],
  [D]: [
    "bamboograph-system-development",
    "bjorr-system-development",
    "bonsai-tree-of-life-system-development",
    "cannvent-system-development",
    "community-supplies-system-development",
    "five9-customer-story-systems-research-and-systems-thinking",
    "house-of-gold-content-architecture",
    "malaria-hotspot-production-creative-production-management-systems",
    "metroplist-system-development",
    "mickz-product-system",
    "mikegold-engineer-system-development",
    "musical-intelligence-content-architecture",
    "protosynthesis-system-development",
    "saveours-system-development",
    "the-visionary-guide-system-development",
    "vendfm-system-development",
    "waffll-system-development",
    "wrappedfm-system-development",
    "zenthapy-system-development",
  ],
  [S]: [
    "118-sports-system-development",
    "cannvent-application-development",
    "cannvent-community-space-development",
    "findthy-system-development",
    "gouldbourne-management-system-development",
    "gouldbourne-registry-system-development",
    "house-of-gold-runtime-state-systems",
    "house-of-gold-system-development",
    "imikegold-system-development",
    "just-enterprises-system-development",
    "multiplied-intelligence-system-development",
    "musical-intelligence-web-experience",
    "ourgani-system-development",
    "protosynthesis-multiformat-web-development",
    "saveours-platform-interface-development",
  ],
  [I]: [
    "five9-customer-story-systems-server-systems-and-configuration",
    "musical-intelligence-deployment",
  ],
  [B]: [
    "best-indies-system-development",
    "findthy-identity-language-development",
    "house-of-gold-media-presentation",
    "mickz-identity-development",
    "musical-intelligence-identity-restoration",
    "ourgani-identity-development",
    "saveours-identity-language-development",
    "viisiioiiv-system-development",
    "wibc-system-development",
    "wrappedfm-identity-development",
    "zenthapy-identity-development",
  ],
  [M]: [
    "fbc-london-shopping-with-grant-playout-systems-setup",
    "living-control-media-servers-multimedia-distribution",
    "mars-delight-kung-fu-media-management-systems",
    "mickz-digital-assets",
    "philadelphia-eagles-nfl-wembley-broadcast-audio-delivery",
    "playstation-croatia-ps5-sound-tour-sound-design",
    "rockett-home-rentals-company-film-camera-operation-and-workflow",
    "the-frisbys-you-are-multicamera-operation",
  ],
};

const secondary = {
  "118-sports-system-development": [B, I],
  "bamboograph-system-development": [S],
  "best-indies-system-development": [S],
  "bjorr-system-development": [B],
  "bonsai-tree-of-life-system-development": [S, I],
  "cannvent-application-development": [D, B],
  "cannvent-community-space-development": [D, B],
  "cannvent-system-development": [S, B],
  "community-supplies-system-development": [S, B],
  "findthy-identity-language-development": [D],
  "findthy-system-development": [B],
  "gouldbourne-management-system-development": [D, I],
  "gouldbourne-registry-system-development": [D, I],
  "house-of-gold-content-architecture": [B, M],
  "house-of-gold-media-presentation": [M],
  "house-of-gold-runtime-state-systems": [D, I],
  "house-of-gold-system-development": [B],
  "imikegold-system-development": [B, M],
  "just-enterprises-system-development": [D, B],
  "living-control-media-servers-multimedia-distribution": [P],
  "mars-delight-kung-fu-media-management-systems": [D],
  "metroplist-system-development": [S, B],
  "mickz-digital-assets": [B],
  "mickz-product-system": [B, M],
  "mikegold-engineer-system-development": [S, B],
  "multiplied-intelligence-system-development": [D, I],
  "musical-intelligence-content-architecture": [S],
  "musical-intelligence-web-experience": [B],
  "ourgani-system-development": [B, I],
  "protosynthesis-multiformat-web-development": [B, M],
  "protosynthesis-system-development": [S, M],
  "saveours-identity-language-development": [D],
  "saveours-platform-interface-development": [D, B],
  "saveours-system-development": [B, M],
  "the-visionary-guide-system-development": [S],
  "vendfm-system-development": [S, M],
  "viisiioiiv-system-development": [S],
  "waffll-system-development": [B, M],
  "wibc-system-development": [S],
  "wrappedfm-system-development": [S, M],
  "zenthapy-system-development": [B],
};

const rationale = {
  [P]: "The responsibility centres on equipment, installed technical systems or physical signal paths operating in a physical environment.",
  [D]: "The responsibility centres on defining the system model, boundaries, structure, workflows or intended operation.",
  [S]: "The responsibility centres on executable digital behaviour implemented in a website, application, interface or connected software system.",
  [I]: "The responsibility centres on deployment, runtime configuration, sustained delivery or the operating environment.",
  [B]: "The responsibility centres on meaning, recognition, identity, visual language or the designed human experience.",
  [M]: "The responsibility centres on creating, managing, transforming or delivering media to an audience.",
};
const lensSummaryLead = {
  [P]: "Physical-system responsibility:",
  [D]: "System and product-definition responsibility:",
  [S]: "Software and web-engineering responsibility:",
  [I]: "Infrastructure and operations responsibility:",
  [B]: "Brand and experience-system responsibility:",
  [M]: "Media production and distribution responsibility:",
};

const primaryBySlug = new Map();
for (const [lensId, slugs] of Object.entries(primaryGroups)) {
  for (const slug of slugs) {
    if (primaryBySlug.has(slug)) throw new Error(`${slug} has more than one primary lens.`);
    primaryBySlug.set(slug, lensId);
  }
}

const reportRows = [];
for (const file of readdirSync(workDirectory).filter((name) => name.endsWith(".json")).sort()) {
  const path = join(workDirectory, file);
  const record = JSON.parse(readFileSync(path, "utf8"));
  const primary = primaryBySlug.get(record.slug);
  if (!primary) throw new Error(`No primary lens decision for ${record.slug}.`);
  const oldGroups = record.capabilityGroupIds ?? record.lensAssignments?.map((item) => item.lensId) ?? [];
  const assignments = [
    {
      lensId: primary,
      role: "primary",
      rationale: rationale[primary],
      ...(record.lensSummaries?.[primary] ? { lensSummary: record.lensSummaries[primary] } : {}),
    },
    ...(secondary[record.slug] ?? []).map((lensId) => ({
      lensId,
      role: "secondary",
      rationale: `This is a distinct supporting responsibility: ${rationale[lensId]}`,
      lensSummary: record.lensSummaries?.[lensId] ?? `${lensSummaryLead[lensId]} ${record.summary}`,
    })),
  ];
  delete record.capabilityGroupIds;
  delete record.lensSummaries;
  record.lensAssignments = assignments;
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
  reportRows.push(`| ${record.slug} | ${oldGroups.join(", ") || "—"} | ${primary} | ${(secondary[record.slug] ?? []).join(", ") || "—"} | ${rationale[primary]} |`);
}

for (const file of readdirSync(relationshipDirectory).filter((name) => name.endsWith(".json"))) {
  const path = join(relationshipDirectory, file);
  const record = JSON.parse(readFileSync(path, "utf8"));
  if (!record.supportedLensIds) continue;
  record.supportedLensIds = [...new Set(record.supportedLensIds.map((id) => aliases[id] ?? id))];
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

for (const file of readdirSync(projectDirectory).filter((name) => name.endsWith(".json"))) {
  const path = join(projectDirectory, file);
  const record = JSON.parse(readFileSync(path, "utf8"));
  if (!record.lensPresentationPreferences) continue;
  record.lensPresentationPreferences = record.lensPresentationPreferences.map((preference) => ({
    ...preference,
    lensId: aliases[preference.lensId] ?? preference.lensId,
  }));
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

const calibration = JSON.parse(readFileSync(calibrationPath, "utf8"));
const migratedCalibration = Object.fromEntries(
  Object.entries(calibration).map(([id, slugs]) => [aliases[id] ?? id, slugs]),
);
writeFileSync(calibrationPath, `${JSON.stringify(migratedCalibration, null, 2)}\n`);

writeFileSync(
  reportPath,
  `# Work Lens migration report\n\nGenerated by \`scripts/migrate-work-lenses.mjs\` before legacy group fields are removed.\n\n` +
    `| Work Contribution | Old groups | New primary lens | Secondary lenses | Primary rationale |\n` +
    `| --- | --- | --- | --- | --- |\n${reportRows.join("\n")}\n`,
);

console.log(`Migrated ${reportRows.length} Work Contributions and wrote ${reportPath}.`);
