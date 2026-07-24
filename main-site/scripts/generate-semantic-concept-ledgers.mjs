import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const core = read("records/concepts/semantic-concepts-core.json");
const extensions = read("records/concepts/semantic-concept-extensions.json");
const modules = read("records/concepts/service-modules.json").modules;
const hats = read("records/concepts/hat-semantic-profiles.json").profiles ?? {};
const claims = read("records/claims/service-engine-vertical-slice.json").claims ?? [];
const concepts = [
  ...core.concepts.map((concept) => ({ ...concept, source: "semantic-concepts-core.json" })),
  ...extensions.concepts.map((concept) => ({ ...concept, source: "semantic-concept-extensions.json" })),
].sort((a, b) => a.slug.localeCompare(b.slug));
const bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));
const csv = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
const list = (items) => [...new Set(items.filter(Boolean))].sort().join(" · ");
const md = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const relationText = (concept) => [
  ...(concept.broaderConceptSlugs ?? []).map((target) => `CHILD_OF:${target}:activating-broader-context`),
  ...(concept.narrowerConceptSlugs ?? []).map((target) => `PARENT_OF:${target}:non-lexical`),
  ...(concept.relatedConceptSlugs ?? []).map((target) => `legacy-related:${target}:one-hop-context-only`),
  ...(concept.typedRelationships ?? []).map((relationship) => `${relationship.type}:${relationship.targetConceptSlug}:${relationship.traversal}`),
];
const modulesFor = (slug) => modules.flatMap((module) => [
  ...(module.activation ?? []).includes(slug) ? [`activate:${module.id}`] : [],
  ...(module.required ?? []).includes(slug) ? [`required:${module.id}`] : [],
  ...(module.supporting ?? []).includes(slug) ? [`supporting:${module.id}`] : [],
  ...(module.activationCompositions ?? []).some((composition) => composition.allOf.includes(slug)) ? [`composition:${module.id}`] : [],
]);
const hatsFor = (slug) => Object.entries(hats).flatMap(([hatSlug, profile]) =>
  ["direct", "core", "supporting", "contextual"].flatMap((tier) =>
    (profile.coverage?.[tier] ?? []).includes(slug) ? [`${tier}:${hatSlug}`] : []));
const claimsFor = (slug) => claims.filter((claim) => claim.conceptSlugs?.includes(slug)).map((claim) => `${claim.status}:${claim.id}:${claim.workSlug}`);
const childrenFor = (slug) => concepts.filter((concept) => concept.broaderConceptSlugs?.includes(slug)).map((concept) => concept.slug);

const semanticHeadings = ["Concept", "Label", "Type", "Definition", "Source", "Aliases/phrases", "Parent", "Children", "Typed relationships and traversal", "Modules", "Hat coverage", "Confirmed Work claims", "Review"];
const semanticFields = concepts.map((concept) => [
  concept.slug, concept.label, concept.kind, concept.definition, concept.source,
  list(concept.phrases ?? []), list(concept.broaderConceptSlugs ?? []), list(childrenFor(concept.slug)),
  list(relationText(concept)), list(modulesFor(concept.slug)), list(hatsFor(concept.slug)),
  list(claimsFor(concept.slug)), "review-required",
]);
const semanticMarkdown = `# Semantic Concept Ledger

Inspection output for ${concepts.length} canonical concepts. Typed \`PART_OF\`, \`USED_IN\` and \`OVERLAPS_WITH\` relationships are non-activating by validation. Legacy \`relatedConceptSlugs\` remain visible for migration review and are not lexical aliases.

| ${semanticHeadings.join(" | ")} |
| ${semanticHeadings.map(() => "---").join(" | ")} |
${semanticFields.map((row) => `| ${row.map(md).join(" | ")} |`).join("\n")}
`;

const phraseRows = concepts.flatMap((concept) => (concept.phrases ?? []).map((phrase) => {
  const declared = concept.lexicalEntries?.find((entry) => entry.phrase === phrase);
  const canonicalLabel = phrase.toLowerCase() === concept.label.toLowerCase();
  return [
    phrase, concept.slug,
    declared?.relationship ?? (canonicalLabel ? "CANONICAL_LABEL" : "ALIAS_OF (legacy/unclassified)"),
    declared ? "explicit lexical metadata" : "legacy phrases array",
    "direct lexical resolution",
    declared ? "reviewed structure; semantic meaning still reviewable" : "review-required",
  ];
})).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
const phraseHeadings = ["Phrase", "Concept", "Lexical relationship", "Provenance", "Traversal", "Review"];
const phraseMarkdown = `# Phrase and Alias Ledger

The current matcher stores most lexical material in a legacy \`phrases\` array, so aliases, abbreviations and spelling variants are not yet fully typed. Explicit entries (currently including the observed ecommerce misspelling) are distinguished below. A crawler may propose classifications but cannot approve them.

| ${phraseHeadings.join(" | ")} |
| ${phraseHeadings.map(() => "---").join(" | ")} |
${phraseRows.map((row) => `| ${row.map(md).join(" | ")} |`).join("\n")}
`;

const consumerHeadings = ["Concept", "Service-module consumers", "Hat consumers", "Confirmed Work-claim consumers", "Orphan/gap"];
const consumerRows = concepts.map((concept) => {
  const moduleConsumers = modulesFor(concept.slug);
  const hatConsumers = hatsFor(concept.slug);
  const claimConsumers = claimsFor(concept.slug);
  return [
    concept.slug, list(moduleConsumers), list(hatConsumers), list(claimConsumers),
    !moduleConsumers.length && !hatConsumers.length && !claimConsumers.length ? "no structured consumers" : "",
  ];
});
const consumerMarkdown = `# Concept Consumer Matrix

This matrix makes semantic spread inspectable. A concept may support Service resolution without a Work claim. Work claims remain independent historical proof.

| ${consumerHeadings.join(" | ")} |
| ${consumerHeadings.map(() => "---").join(" | ")} |
${consumerRows.map((row) => `| ${row.map(md).join(" | ")} |`).join("\n")}
`;

mkdirSync(new URL("docs/generated/", root), { recursive: true });
mkdirSync(new URL("generated/", root), { recursive: true });
const outputs = [
  ["docs/generated/SEMANTIC-CONCEPT-LEDGER.md", semanticMarkdown],
  ["generated/semantic-concept-ledger.csv", [semanticHeadings, ...semanticFields].map((row) => row.map(csv).join(",")).join("\n") + "\n"],
  ["docs/generated/PHRASE-AND-ALIAS-LEDGER.md", phraseMarkdown],
  ["generated/phrase-and-alias-ledger.csv", [phraseHeadings, ...phraseRows].map((row) => row.map(csv).join(",")).join("\n") + "\n"],
  ["docs/generated/CONCEPT-CONSUMER-MATRIX.md", consumerMarkdown],
  ["generated/concept-consumer-matrix.csv", [consumerHeadings, ...consumerRows].map((row) => row.map(csv).join(",")).join("\n") + "\n"],
];
for (const [path, content] of outputs) writeFileSync(new URL(path, root), content);
console.log(`Semantic ledgers: ${concepts.length} concepts, ${phraseRows.length} phrases, ${consumerRows.length} consumer rows.`);
console.log(`Orphan concepts requiring review: ${consumerRows.filter((row) => row.at(-1)).length}.`);
