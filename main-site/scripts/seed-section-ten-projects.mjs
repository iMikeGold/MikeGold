#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
const records = join(root, "records");
const now = "2026-07-20T00:00:00.000Z";
const readDir = (name) => {
  const dir = join(records, name);
  return existsSync(dir)
    ? readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")))
    : [];
};
const write = (collection, slug, value) => {
  const dir = join(records, collection);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
};
const existing = {
  projects: readDir("projects"), work: readDir("work"), evidence: readDir("evidence"), relationships: readDir("relationships"),
};
const bySlug = (collection, slug) => existing[collection].find((item) => item.slug === slug);
const idFor = (collection, slug) => bySlug(collection, slug)?.id ?? randomUUID();
const hatIds = JSON.parse(readFileSync(join(records, "migrations", "hat-id-map.v1.json"), "utf8"));

const groups = {
  system: "system-product-definition", software: "software-web-engineering", infra: "infrastructure-operations",
  brand: "brand-experience-systems", media: "media-asset-systems", physical: "physical-technical-engineering",
};

const catalogue = [
  ["ourgani", "Ourgani", "A service identity and live web presence, establishing its visual identity and delivering its public digital experience.", "live", true, 2025, [groups.brand, groups.software, groups.infra], ["brand-systems-engineer", "web-design-engineer", "deployment-engineer"]],
  ["multiplied-intelligence", "Multiplied Intelligence", "Web experience, content structure and multi-domain cloud delivery for a music and creative brand.", "live", false, 2015, [groups.system, groups.software, groups.infra, groups.brand], ["web-design-engineer", "data-modeler", "deployment-engineer"]],
  ["bamboograph", "BambooGraph", "Early software research exploring a graph-based product model and the systems needed to make it useful.", "prototype", false, 2024, [groups.system, groups.software], ["concept-engineer", "data-modeler", "systems-engineer"]],
  ["bonsai-tree-of-life", "Bonsai Tree of Life", "Product and data architecture for a structured web-system project, with its delivery model in development.", "active-development", false, 2024, [groups.system, groups.software, groups.infra], ["systems-engineer", "data-modeler", "web-design-engineer"]],
  ["just-enterprises", "Just Enterprises", "A company identity and corporate web presence with a structured organisational story and domain foundation.", "design-development", false, 2009, [groups.system, groups.software, groups.infra, groups.brand], ["brand-systems-engineer", "web-design-engineer", "environment-architect"]],
  ["gouldbourne-registry", "Gouldbourne Registry", "Architecture and engineering of a structured institutional registry with typed records, validation, queries and public projections.", "live", true, 2007, [groups.system, groups.software, groups.infra], ["systems-engineer", "schema-architect", "data-modeler"]],
  ["gouldbourne-management", "Gouldbourne Management", "An organisational website combining management-focused content architecture, responsive delivery and domain operations.", "live", false, 1987, [groups.system, groups.software, groups.infra], ["web-design-engineer", "data-modeler", "deployment-engineer"]],
  ["community-supplies", "Community Supplies", "Brand, commerce and digital-service architecture for a product catalogue and storefront experience.", "live", false, 2017, [groups.system, groups.software, groups.infra, groups.brand], ["brand-systems-engineer", "web-design-engineer", "deployment-engineer"]],
  ["best-indies", "Best Indies", "Identity, content structure and web-experience direction for an independent-products project.", "design-development", false, 2023, [groups.brand, groups.software], ["identity-architect", "logo-systems-designer", "web-design-engineer"]],
  ["wibc", "WIBC", "A company identity and digital-presence project covering brand direction and corporate content structure.", "design-development", false, 2024, [groups.brand, groups.software], ["brand-systems-engineer", "logo-systems-designer", "web-design-engineer"]],
  ["118-sports", "118 Sports", "Brand identity, responsive web development and cloud deployment for a live sports service.", "live", false, 2013, [groups.brand, groups.software, groups.infra], ["identity-architect", "web-design-engineer", "deployment-engineer"]],
  ["vendfm", "VendFM", "Product and system architecture for a multi-format media vending platform spanning identities, services and interface contexts.", "active-development", true, 2010, [groups.system, groups.software, groups.brand, groups.media], ["systems-engineer", "data-modeler", "interactive-media-engineer"]],
  ["waffll", "Waffll", "Brand and service architecture connecting radio, publishing, production, food content and commercial surfaces.", "design-development", false, 2023, [groups.system, groups.brand, groups.media], ["brand-systems-engineer", "concept-engineer", "media-engineer"]],
  ["wrappedfm", "WrappedFM", "Identity and web-application development for an online radio station designed around live metadata and future platform integration.", "active-development", true, 2022, [groups.system, groups.software, groups.infra, groups.brand, groups.media], ["media-engineer", "web-design-engineer", "deployment-engineer"]],
  ["imikegold", "iMikeGold.com", "An artist identity and digital application for presenting music, releases, media and archive material.", "live", false, 2010, [groups.system, groups.software, groups.infra, groups.brand, groups.media], ["identity-architect", "media-engineer", "web-design-engineer"]],
  ["mikegold-engineer", "MikeGold.co.uk", "A professional operating system mapping multidisciplinary engineering capabilities to services, projects and applied evidence.", "live", true, 2006, [groups.system, groups.software, groups.infra, groups.brand], ["systems-engineer", "data-modeler", "web-design-engineer"]],
  ["house-of-gold", "House of Gold", "A music, media and intellectual-property platform connecting content architecture, presentation and digital assets.", "live", false, 2012, [groups.software, groups.infra, groups.brand, groups.media], ["media-engineer", "data-modeler", "web-design-engineer"]],
  ["the-visionary-guide", "The Visionary Guide", "An application product in development around product definition, user experience and structured content.", "active-development", false, 2024, [groups.system, groups.software], ["concept-engineer", "data-modeler", "web-design-engineer"]],
  ["viisiioiiv", "Viisiioiiv", "A reserved brand concept with early naming and identity exploration.", "reserved-concept", false, 2014, [groups.brand], ["identity-architect", "visual-language-engineer"]],
  ["zenthapy", "Zenthapy", "A wellness-service concept awaiting further product definition and implementation.", "reserved-concept", false, 2020, [groups.system, groups.brand], ["concept-engineer", "brand-systems-engineer"]],
  ["findthy", "FindThy", "Brand and experience architecture for a selective discovery agency, including positioning, language and cultural case structures.", "awaiting-implementation", true, 2014, [groups.system, groups.software, groups.brand], ["brand-systems-engineer", "meaning-architect", "data-modeler"]],
  ["saveours", "SaveOurs", "Product and platform architecture for a living museum built around what people create, collect and remember.", "awaiting-implementation", true, 2014, [groups.system, groups.software, groups.brand, groups.media], ["systems-engineer", "data-modeler", "symbol-systems-designer"]],
  ["metroplist", "Metroplist", "Product, identity and interface-system development for a structured metropolitan or media-listing platform.", "active-development", true, 2024, [groups.system, groups.software, groups.brand], ["concept-engineer", "data-modeler", "visual-language-engineer"]],
  ["cannvent", "Cannvent", "Brand, language and digital-experience development for a wellness product with planned community, content and commerce surfaces.", "awaiting-implementation", true, 2025, [groups.system, groups.software, groups.brand], ["brand-systems-engineer", "meaning-architect", "environment-architect"]],
  ["protosynthesis", "ProtoSynthesis", "Architecture and development of a connected research ecosystem spanning inquiry, documentary media and long-form knowledge.", "live", true, 2026, [groups.system, groups.software, groups.infra, groups.brand, groups.media], ["systems-engineer", "narrative-systems-thinker", "media-engineer"]],
  ["bjorr", "Bjórr", "A reserved product and brand concept with early naming and domain strategy.", "reserved-concept", false, 2025, [groups.system, groups.brand], ["concept-engineer", "identity-architect"]],
];

let seeded = 0;
for (const [slug, name, summary, status, featured, year, capabilityGroupIds, hats] of catalogue) {
  const priorProject = bySlug("projects", slug);
  const projectId = priorProject?.id ?? randomUUID();
  write("projects", slug, {
    id: projectId, recordType: "project", schemaVersion: 1, createdAt: priorProject?.createdAt ?? now, updatedAt: now,
    slug, name, summary, status, visibility: "public", featured, establishedYear: year,
  });
  const workSlug = `${slug}-system-development`;
  const priorWork = bySlug("work", workSlug);
  const workId = priorWork?.id ?? randomUUID();
  write("work", workSlug, {
    id: workId, recordType: "work", schemaVersion: 1, createdAt: priorWork?.createdAt ?? now, updatedAt: now,
    projectId, slug: workSlug, title: `${name} system development`, summary, status: ["live", "maintained"].includes(status) ? "documented" : status === "reserved-concept" ? "historical" : "in-progress",
    visibility: "public", capabilityGroupIds,
  });
  const evidenceSlug = `${slug}-documentation-pending`;
  const priorEvidence = bySlug("evidence", evidenceSlug);
  const evidenceId = priorEvidence?.id ?? randomUUID();
  write("evidence", evidenceSlug, {
    id: evidenceId, recordType: "evidence", schemaVersion: 1, createdAt: priorEvidence?.createdAt ?? now, updatedAt: now,
    slug: evidenceSlug, title: `${name} project evidence`, description: "Supporting material is being selected and documented for this project record.",
    evidenceType: "placeholder", visibility: "public", placeholder: true,
  });
  for (const hat of hats) {
    if (!hatIds[hat]) throw new Error(`Unknown Hat key ${hat}.`);
    const relSlug = `${hat}-applied-in-${workSlug}`;
    const prior = bySlug("relationships", relSlug);
    write("relationships", relSlug, {
      id: prior?.id ?? randomUUID(), recordType: "relationship", schemaVersion: 1, createdAt: prior?.createdAt ?? now, updatedAt: now,
      slug: relSlug, sourceId: hatIds[hat], sourceType: "hat", relationshipType: "applied-in", targetId: workId, targetType: "work", role: "primary",
    });
  }
  const evidenceRelSlug = `${workSlug}-evidenced-by-${evidenceSlug}`;
  const priorRel = bySlug("relationships", evidenceRelSlug);
  write("relationships", evidenceRelSlug, {
    id: priorRel?.id ?? randomUUID(), recordType: "relationship", schemaVersion: 1, createdAt: priorRel?.createdAt ?? now, updatedAt: now,
    slug: evidenceRelSlug, sourceId: workId, sourceType: "work", relationshipType: "evidenced-by", targetId: evidenceId, targetType: "evidence",
  });
  seeded += 1;
}

console.log(`Seeded ${seeded} Section 10 project-family baselines without replacing existing detailed work.`);
