#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const generatedRoot = join(projectRoot, "src", "system", "generated");
const serviceIndexRoot = join(projectRoot, "records", "generated", "service-engine");
const auditPath = join(projectRoot, "records", "editorial", "work-hat-audit.json");
const auditAssignmentsDirectory = join(
  projectRoot,
  "records",
  "editorial",
  "work-hat-audit",
);

const audit = JSON.parse(readFileSync(auditPath, "utf8"));
audit.assignments = readdirSync(auditAssignmentsDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .flatMap((file) =>
    JSON.parse(readFileSync(join(auditAssignmentsDirectory, file), "utf8")).assignments ?? [],
  );

function generatedFile(name) {
  return join(generatedRoot, name);
}

function readGenerated(name) {
  const path = generatedFile(name);
  const text = readFileSync(path, "utf8");
  const start = text.indexOf(" = ") + 3;
  const end = text.lastIndexOf(" as ");
  if (start < 3 || end <= start) throw new Error(`Cannot parse generated file ${name}.`);
  return {
    path,
    prefix: text.slice(0, start),
    suffix: text.slice(end),
    records: JSON.parse(text.slice(start, end)),
  };
}

function writeGenerated(document) {
  writeFileSync(
    document.path,
    `${document.prefix}${JSON.stringify(document.records, null, 2)}${document.suffix}`,
  );
}

function key(projectName, workTitle) {
  return `${projectName}::${workTitle}`;
}

function unique(values) {
  return [...new Set(values)];
}

function canonicalise(value) {
  if (Array.isArray(value)) {
    return value
      .map(canonicalise)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([itemKey, item]) => [itemKey, canonicalise(item)]),
    );
  }
  return value;
}

function contentHash(value) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalise(value)))
    .digest("hex");
}

const projectsDocument = readGenerated("public-projects.generated.ts");
const hatsDocument = readGenerated("public-hats.generated.ts");
const workDocument = readGenerated("public-work.generated.ts");
const cardsDocument = readGenerated("public-work-cards.generated.ts");

const projectNameBySlug = new Map(
  projectsDocument.records.map((project) => [project.slug, project.name]),
);
const publicHatSlugs = new Set(hatsDocument.records.map((hat) => hat.slug));

const duplicateAuditKeys = audit.assignments
  .map((entry) => key(entry.projectName, entry.workTitle))
  .filter((entryKey, index, all) => all.indexOf(entryKey) !== index);
if (duplicateAuditKeys.length) {
  throw new Error(`Duplicate work Hat-audit entries: ${unique(duplicateAuditKeys).join(", ")}`);
}

const auditByKey = new Map(
  audit.assignments.map((entry) => [key(entry.projectName, entry.workTitle), entry]),
);
const publicWorkKeys = workDocument.records.map((work) => {
  const projectName = projectNameBySlug.get(work.projectSlug);
  if (!projectName) throw new Error(`No public Project found for Work ${work.slug}.`);
  return key(projectName, work.title);
});

const missingAuditEntries = publicWorkKeys.filter((entryKey) => !auditByKey.has(entryKey));
const staleAuditEntries = [...auditByKey.keys()].filter((entryKey) => !publicWorkKeys.includes(entryKey));
if (missingAuditEntries.length || staleAuditEntries.length) {
  throw new Error(
    [
      missingAuditEntries.length
        ? `Missing work Hat-audit entries: ${missingAuditEntries.join(", ")}`
        : "",
      staleAuditEntries.length
        ? `Audit entries do not match public Work: ${staleAuditEntries.join(", ")}`
        : "",
    ].filter(Boolean).join("\n"),
  );
}

for (const entry of audit.assignments) {
  const unknownHatSlugs = entry.hatSlugs.filter((slug) => !publicHatSlugs.has(slug));
  if (unknownHatSlugs.length) {
    throw new Error(
      `${key(entry.projectName, entry.workTitle)} references unknown Hats: ${unknownHatSlugs.join(", ")}`,
    );
  }
  if (unique(entry.hatSlugs).length !== entry.hatSlugs.length) {
    throw new Error(`${key(entry.projectName, entry.workTitle)} contains duplicate Hats.`);
  }
}

for (const work of workDocument.records) {
  const projectName = projectNameBySlug.get(work.projectSlug);
  const entry = auditByKey.get(key(projectName, work.title));

  work.appliedHatSlugs = [...entry.hatSlugs];

  if (entry.titleOverride) work.title = entry.titleOverride;
  if (entry.summaryOverride) work.summary = entry.summaryOverride;
  if (entry.lensAssignmentsOverride) {
    work.lensAssignments = entry.lensAssignmentsOverride;
    work.capabilityGroupIds = entry.lensAssignmentsOverride.map((assignment) => assignment.lensId);
    const lensSummaries = Object.fromEntries(
      entry.lensAssignmentsOverride
        .filter((assignment) => assignment.lensSummary)
        .map((assignment) => [assignment.lensId, assignment.lensSummary]),
    );
    if (Object.keys(lensSummaries).length) work.lensSummaries = lensSummaries;
    else delete work.lensSummaries;
  }
}

cardsDocument.records = cardsDocument.records
  .filter((card) => {
    if (!card.lensId) return true;
    return workDocument.records.some(
      (work) =>
        work.projectSlug === card.projectSlug
        && work.capabilityGroupIds.includes(card.lensId),
    );
  })
  .map((card) => {
    const relevantWork = workDocument.records.filter(
      (work) =>
        work.projectSlug === card.projectSlug
        && (!card.lensId || work.capabilityGroupIds.includes(card.lensId)),
    );
    const appliedHatSlugs = unique(relevantWork.flatMap((work) => work.appliedHatSlugs));

    card.relevantWorkSlugs = relevantWork.map((work) => work.slug);
    card.contributionTitle = relevantWork.map((work) => work.title).join(" · ");
    card.leadHatSlugs = appliedHatSlugs.slice(0, 4);
    card.supportingHatSlugs = appliedHatSlugs.slice(4);

    if (relevantWork.length === 1) {
      const [work] = relevantWork;
      card.summary = card.lensId
        ? work.lensSummaries?.[card.lensId] ?? work.summary
        : work.summary;
    }

    if (Array.isArray(card.relevanceReasons)) {
      card.relevanceReasons = card.relevanceReasons.map((reason) =>
        /evidenced capabilities contribute a capped distinctiveness signal$/.test(reason)
          ? `${appliedHatSlugs.length} evidenced capabilities contribute a capped distinctiveness signal`
          : reason,
      );
    }

    return card;
  });

writeGenerated(workDocument);
writeGenerated(cardsDocument);

const workSemanticIndex = JSON.parse(
  readFileSync(join(serviceIndexRoot, "work-semantic-index.json"), "utf8"),
);
const hatSemanticIndex = JSON.parse(
  readFileSync(join(serviceIndexRoot, "hat-semantic-index.json"), "utf8"),
);
const conceptToWorkIndex = JSON.parse(
  readFileSync(join(serviceIndexRoot, "concept-to-work-index.json"), "utf8"),
);
const projectContributionIndex = JSON.parse(
  readFileSync(join(serviceIndexRoot, "project-contribution-index.json"), "utf8"),
);
const manifestPath = join(serviceIndexRoot, "index-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const hatToWorkIndex = Object.fromEntries(
  hatsDocument.records.map((hat) => [
    hat.slug,
    workDocument.records
      .filter((work) => work.appliedHatSlugs.includes(hat.slug))
      .map((work) => work.slug)
      .sort(),
  ]),
);
writeFileSync(
  join(serviceIndexRoot, "hat-to-work-index.json"),
  `${JSON.stringify({ schemaVersion: 1, hats: hatToWorkIndex }, null, 2)}\n`,
);

manifest.generatedIndexHash = contentHash({
  workSemanticIndex: workSemanticIndex.work,
  hatSemanticIndex: hatSemanticIndex.hats,
  conceptToWorkIndex: conceptToWorkIndex.concepts,
  hatToWorkIndex,
  projectContributionIndex: projectContributionIndex.projects,
});
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const totalAssignments = workDocument.records.reduce(
  (total, work) => total + work.appliedHatSlugs.length,
  0,
);
console.log(
  JSON.stringify(
    {
      auditedProjects: audit.reviewScope.projects,
      auditedWorkContributions: workDocument.records.length,
      availableHats: hatsDocument.records.length,
      appliedHatAssignments: totalAssignments,
      reviewedAt: audit.reviewedAt,
    },
    null,
    2,
  ),
);
