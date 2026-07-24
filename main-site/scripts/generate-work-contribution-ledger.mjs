import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const records = join(root, "records");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readDir = (name) => readdirSync(join(records, name))
  .filter((file) => file.endsWith(".json"))
  .map((file) => readJson(join(records, name, file)));
const csv = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
const list = (values) => [...new Set(values.filter(Boolean))].sort().join(" · ");

const work = readDir("work").sort((a, b) => a.slug.localeCompare(b.slug));
const projects = new Map(readDir("projects").map((record) => [record.id, record]));
const evidence = new Map(readDir("evidence").map((record) => [record.id, record]));
const hats = new Map(readDir("hats").map((record) => [record.id, record]));
const relationships = readDir("relationships");
const claimSet = readJson(join(records, "claims", "service-engine-vertical-slice.json"));
const claimsByWork = new Map();
for (const claim of claimSet.claims ?? []) {
  const current = claimsByWork.get(claim.workSlug) ?? [];
  current.push(claim);
  claimsByWork.set(claim.workSlug, current);
}
const signatureSet = readJson(join(records, "generated", "service-engine", "work-semantic-index.json")).work;
const reviews = readJson(join(root, "docs", "reviews", "work-contribution-review-assertions.json")).assertions;
const reviewsByWork = new Map();
for (const review of reviews) {
  for (const workSlug of review.targetWorkSlugs) {
    const current = reviewsByWork.get(workSlug) ?? [];
    current.push(review);
    reviewsByWork.set(workSlug, current);
  }
}

const rows = work.map((contribution) => {
  const project = projects.get(contribution.projectId);
  const claims = claimsByWork.get(contribution.slug) ?? [];
  const signature = signatureSet[contribution.slug] ?? { concepts: [], source: "missing" };
  const workRelationships = relationships.filter((relationship) =>
    (relationship.targetType === "work" && relationship.targetId === contribution.id)
    || (relationship.sourceType === "work" && relationship.sourceId === contribution.id));
  const hatNames = workRelationships.flatMap((relationship) => {
    if (relationship.sourceType === "hat") return [hats.get(relationship.sourceId)?.name];
    if (relationship.targetType === "hat") return [hats.get(relationship.targetId)?.name];
    return [];
  });
  const evidenceRecords = workRelationships.flatMap((relationship) => {
    if (relationship.sourceType === "evidence") return [evidence.get(relationship.sourceId)];
    if (relationship.targetType === "evidence") return [evidence.get(relationship.targetId)];
    return [];
  }).filter(Boolean);
  const reviewNotes = reviewsByWork.get(contribution.slug) ?? [];
  const summaryProvenance = contribution.summaryProvenance ?? "unknown-unreviewed";
  return {
    workContext: "unmodelled",
    project: project?.name ?? contribution.projectId,
    projectSlug: project?.slug ?? "",
    workSlug: contribution.slug,
    title: contribution.title,
    summary: contribution.summary,
    summaryProvenance,
    fieldProvenance: list([
      "public title: unknown-unreviewed",
      `public summary: ${summaryProvenance}`,
      `semantic concepts: ${signature.source === "confirmed" ? "confirmed" : "derived/inferred"}`,
      `responsibility: ${claims.length ? "confirmed claim" : "unknown"}`,
      `evidence roles: ${evidenceRecords.length ? "authored evidence metadata" : "not recorded"}`,
    ]),
    concepts: list(signature.concepts ?? []),
    responsibility: list(claims.filter((claim) => claim.claimType === "responsibility").map((claim) => claim.statement)),
    claimIds: list(claims.map((claim) => claim.id)),
    hats: list(hatNames),
    evidence: list(evidenceRecords.map((item) => `${item.title} [${item.role ?? item.evidenceType ?? "unspecified role"}]`)),
    editorial: list([
      project?.featured ? "project featured" : "",
      contribution.sequence != null ? `work sequence ${contribution.sequence}` : "",
      ...(contribution.lensAssignments ?? []).map((assignment) => `${assignment.lensId}:${assignment.role}`),
    ]),
    retrieval: `${signature.source ?? "missing"} semantic signature`,
    reviewStatus: reviewNotes.length ? list(reviewNotes.map((item) => item.status)) : "review-required",
    userCorrection: list(reviewNotes.map((item) => item.assertion)),
    proposedCapabilityEvents: "none — assessment not yet modelled",
  };
});

const headings = [
  "Work context", "Project", "Contribution", "Public summary", "Summary provenance", "Field-level provenance",
  "Indexed concepts", "Responsibility claims", "Hat links", "Evidence (declared role)",
  "Editorial/display fields", "Retrieval fields", "Review status", "User correction",
  "Proposed capability events",
];
const fields = [
  "workContext", "project", "title", "summary", "summaryProvenance", "fieldProvenance", "concepts",
  "responsibility", "hats", "evidence", "editorial", "retrieval", "reviewStatus",
  "userCorrection", "proposedCapabilityEvents",
];
const mdRows = rows.map((row) => `| ${fields.map((field) => String(row[field] ?? "").replaceAll("|", "\\|").replaceAll("\n", " ")).join(" | ")} |`);
const markdown = `# Work Contribution Ledger

Generated from canonical Project, Work, relationship, claim, Evidence and server-only semantic-index records.

This is an inspection surface, not a replacement source of truth. A summary marked \`unknown-unreviewed\` has no stored authorship/provenance declaration and must not be assumed to be user-confirmed. Work Context is shown as \`unmodelled\` until the proposed neutral context layer exists. Capability events are intentionally not inferred.

Contributions: ${rows.length}

| ${headings.join(" | ")} |
| ${headings.map(() => "---").join(" | ")} |
${mdRows.join("\n")}
`;
const csvText = [
  headings.map(csv).join(","),
  ...rows.map((row) => fields.map((field) => csv(row[field])).join(",")),
].join("\n") + "\n";

mkdirSync(join(root, "docs", "generated"), { recursive: true });
mkdirSync(join(root, "generated"), { recursive: true });
writeFileSync(join(root, "docs", "generated", "WORK-CONTRIBUTION-LEDGER.md"), markdown);
writeFileSync(join(root, "generated", "work-contribution-ledger.csv"), csvText);
console.log(`Work Contribution Ledger: ${rows.length} contributions`);
console.log(`Unreviewed/unknown summaries: ${rows.filter((row) => row.summaryProvenance === "unknown-unreviewed").length}`);
console.log(`Pending user corrections: ${rows.filter((row) => row.userCorrection).length}`);
