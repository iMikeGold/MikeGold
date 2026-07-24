import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const collection = (directory) => readdirSync(join(root, directory))
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => read(`${directory}/${name}`));
const slugs = (directory) => new Set(readdirSync(join(root, directory)).filter((name) => name.endsWith(".json")).map((name) => read(`${directory}/${name}`).slug));
const rawHats = collection("records/hats");
const rawWork = collection("records/work");
const rawRelationships = collection("records/relationships");
const hats = slugs("records/hats");
const work = slugs("records/work");
const evidence = slugs("records/evidence");
const conceptData = read("records/concepts/work-semantic-profiles.json");
const hatProfiles = read("records/concepts/hat-semantic-profiles.json").profiles;
const provenance = read("records/claims/service-engine-vertical-slice.json");
const coreConcepts = read("records/concepts/semantic-concepts-core.json");
const extendedConcepts = read("records/concepts/semantic-concept-extensions.json");
const moduleKnowledge = read("records/concepts/service-modules.json");
const stageKnowledge = read("records/concepts/delivery-stages.json");
const knowledgeManifest = read("records/concepts/knowledge-manifest.json");
const capabilityCoveragePolicy = read("records/concepts/capability-coverage-policy.json");
const generatedWorkIndex = read("records/generated/service-engine/work-semantic-index.json");
const generatedHatIndex = read("records/generated/service-engine/hat-semantic-index.json");
const generatedConceptWorkIndex = read("records/generated/service-engine/concept-to-work-index.json");
const generatedHatWorkIndex = read("records/generated/service-engine/hat-to-work-index.json");
const generatedProjectIndex = read("records/generated/service-engine/project-contribution-index.json");
const generatedIndexManifest = read("records/generated/service-engine/index-manifest.json");
const expectedModuleSource = "records/concepts/service-modules.json";
const moduleDatasets = readdirSync(join(root, "records"), { recursive: true })
  .map((path) => `records/${String(path).replaceAll("\\", "/")}`)
  .filter((path) => path.endsWith("service-modules.json"))
  .sort();
const conceptRecords = [...coreConcepts.concepts, ...extendedConcepts.concepts];
const conceptSlugs = new Set();
const moduleSlugs = new Set();
const declaredModuleSlugs = new Set(moduleKnowledge.modules.map((serviceModule) => serviceModule.id));
const knownConcepts = new Set(Object.values(conceptData.profiles).flat());
const errors = [];
const phraseOwners = new Map();
const canonicalise = (value) => Array.isArray(value)
  ? value.map(canonicalise).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  : value && typeof value === "object"
    ? Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonicalise(item)]))
    : value;
const contentHash = (value) => createHash("sha256").update(JSON.stringify(canonicalise(value))).digest("hex");

if (knowledgeManifest.moduleSource !== expectedModuleSource) {
  errors.push(`Knowledge manifest module source must be ${expectedModuleSource}`);
}
if (moduleDatasets.length !== 1 || moduleDatasets[0] !== expectedModuleSource) {
  errors.push(`Expected one canonical service-module dataset at ${expectedModuleSource}; found ${moduleDatasets.join(", ") || "none"}`);
}
const expectedArchiveSourceHash = contentHash({
  hats: rawHats,
  work: rawWork,
  relationships: rawRelationships,
  serviceEngineClaims: provenance.claims,
  workSemanticProfiles: conceptData.profiles,
  hatSemanticProfiles: hatProfiles,
  capabilityCoveragePolicy,
  semanticConcepts: conceptRecords.sort((left, right) => left.slug.localeCompare(right.slug)),
});
const indexedKnowledge = {
  workSemanticIndex: generatedWorkIndex.work,
  hatSemanticIndex: generatedHatIndex.hats,
  conceptToWorkIndex: generatedConceptWorkIndex.concepts,
  hatToWorkIndex: generatedHatWorkIndex.hats,
  projectContributionIndex: generatedProjectIndex.projects,
};
if (generatedIndexManifest.archiveSourceHash !== expectedArchiveSourceHash) {
  errors.push(`Generated Service Engine indexes are stale: expected archive source hash ${expectedArchiveSourceHash}`);
}
if (generatedIndexManifest.generatedIndexHash !== contentHash(indexedKnowledge)) {
  errors.push("Generated Service Engine index hash does not match its canonical content");
}

for (const concept of conceptRecords) {
  if (conceptSlugs.has(concept.slug)) errors.push(`Duplicate concept slug: ${concept.slug}`);
  conceptSlugs.add(concept.slug);
  if (!concept.label?.trim() || !concept.definition?.trim() || !concept.kind || !concept.phrases?.length) {
    errors.push(`Concept ${concept.slug} does not satisfy the canonical concept schema`);
  }
  for (const phrase of concept.phrases ?? []) {
    const key = phrase.toLowerCase().trim();
    phraseOwners.set(key, [...(phraseOwners.get(key) ?? []), concept]);
  }
}
for (const [workSlug, signature] of Object.entries(generatedWorkIndex.work)) {
  if (!work.has(workSlug)) errors.push(`Generated Work index references unknown Work ${workSlug}`);
  for (const conceptSlug of signature.concepts ?? []) if (!conceptSlugs.has(conceptSlug)) errors.push(`Generated Work index ${workSlug} references unknown concept ${conceptSlug}`);
}
for (const [hatSlug, signature] of Object.entries(generatedHatIndex.hats)) {
  if (!hats.has(hatSlug)) errors.push(`Generated Hat index references unknown Hat ${hatSlug}`);
  const indexedCoverage = Object.values(signature.coverage ?? {}).flat();
  for (const conceptSlug of indexedCoverage) if (!conceptSlugs.has(conceptSlug)) errors.push(`Generated Hat index ${hatSlug} references unknown concept ${conceptSlug}`);
}
for (const [conceptSlug, workSlugs] of Object.entries(generatedConceptWorkIndex.concepts)) {
  if (!conceptSlugs.has(conceptSlug)) errors.push(`Generated concept-to-Work index references unknown concept ${conceptSlug}`);
  for (const workSlug of workSlugs) if (!work.has(workSlug)) errors.push(`Generated concept-to-Work index references unknown Work ${workSlug}`);
}
for (const [hatSlug, workSlugs] of Object.entries(generatedHatWorkIndex.hats)) {
  if (!hats.has(hatSlug)) errors.push(`Generated Hat-to-Work index references unknown Hat ${hatSlug}`);
  for (const workSlug of workSlugs) if (!work.has(workSlug)) errors.push(`Generated Hat-to-Work index references unknown Work ${workSlug}`);
}
const conceptReferences = (concept) => [
  ...(concept.relatedConceptSlugs ?? []),
  ...(concept.broaderConceptSlugs ?? []),
  ...(concept.narrowerConceptSlugs ?? []),
  ...(concept.impliedConceptSlugs ?? []),
  ...(concept.commonRequirementConceptSlugs ?? []),
  ...(concept.senseBindings ?? []).flatMap((binding) => [
    ...(binding.targetConceptSlugs ?? []),
    ...(binding.resolvedConceptSlugs ?? []),
  ]),
  ...(concept.typedRelationships ?? []).map((relationship) => relationship.targetConceptSlug),
];
const allowedTypedRelationships = new Set(["PARENT_OF", "CHILD_OF", "PART_OF", "REQUIRES", "USED_IN", "OVERLAPS_WITH", "CONTRASTS_WITH", "AMBIGUOUS_SENSE"]);
const allowedTraversalPolicies = new Set(["activating", "non-activating", "disambiguation-only"]);
const allowedLexicalRelationships = new Set(["ALIAS_OF", "MISSPELLING_OF", "ABBREVIATION_OF"]);
for (const concept of conceptRecords) {
  for (const reference of conceptReferences(concept)) {
    if (!conceptSlugs.has(reference)) errors.push(`Concept ${concept.slug} references unknown concept ${reference}`);
  }
  if (concept.breadth === "umbrella" && !(concept.narrowerConceptSlugs?.length)) errors.push(`Umbrella concept ${concept.slug} has no narrower routes`);
  if (concept.breadth === "umbrella" && concept.narrowerConceptSlugs?.some((slug) => !conceptSlugs.has(slug))) errors.push(`Umbrella concept ${concept.slug} contains an invalid narrower route`);
  if (concept.ambiguityPolicy?.requiresResolution && !concept.ambiguityPolicy.promptMode) errors.push(`Concept ${concept.slug} requires resolution without an ambiguity prompt policy`);
  if (concept.modifierPolicy?.requiresTarget && !(concept.modifierPolicy.canModifyKinds?.length)) errors.push(`Modifier ${concept.slug} requires a target but declares no compatible kinds`);
  if (concept.senseBindings?.length && !concept.modifierPolicy?.requiresTarget) errors.push(`Concept ${concept.slug} declares sense bindings without a target-requiring modifier policy`);
  for (const binding of concept.senseBindings ?? []) {
    if (!binding.targetConceptSlugs?.length || !binding.resolvedConceptSlugs?.length) errors.push(`Concept ${concept.slug} contains an incomplete sense binding`);
    for (const resolvedSlug of binding.resolvedConceptSlugs ?? []) {
      if (declaredModuleSlugs.has(resolvedSlug)) errors.push(`Concept ${concept.slug} sense binding resolves directly to delivery module ${resolvedSlug}`);
      if (hats.has(resolvedSlug)) errors.push(`Concept ${concept.slug} sense binding resolves directly to Hat ${resolvedSlug}`);
      if (work.has(resolvedSlug)) errors.push(`Concept ${concept.slug} sense binding resolves directly to Work ${resolvedSlug}`);
    }
  }
  for (const relationship of concept.typedRelationships ?? []) {
    if (!allowedTypedRelationships.has(relationship.type)) errors.push(`Concept ${concept.slug} has unknown typed relationship ${relationship.type}`);
    if (!allowedTraversalPolicies.has(relationship.traversal)) errors.push(`Concept ${concept.slug} has invalid traversal policy ${relationship.traversal}`);
    if (["PART_OF", "USED_IN", "OVERLAPS_WITH"].includes(relationship.type) && relationship.traversal === "activating") {
      errors.push(`Concept ${concept.slug} ${relationship.type} relationship must not automatically activate ${relationship.targetConceptSlug}`);
    }
  }
  for (const lexical of concept.lexicalEntries ?? []) {
    if (!allowedLexicalRelationships.has(lexical.relationship)) errors.push(`Concept ${concept.slug} has unknown lexical relationship ${lexical.relationship}`);
    if (!(concept.phrases ?? []).includes(lexical.phrase)) errors.push(`Concept ${concept.slug} lexical entry ${lexical.phrase} is absent from phrases`);
  }
}
for (const [phrase, owners] of phraseOwners) {
  if (owners.length < 2) continue;
  const controlled = owners.every((owner) => owner.ambiguityPolicy?.requiresResolution);
  if (!controlled) errors.push(`Phrase "${phrase}" collides across ${owners.map((owner) => owner.slug).join(", ")} without a controlled ambiguity policy`);
}
const stageSlugs = new Set(stageKnowledge.stages);
for (const serviceModule of moduleKnowledge.modules) {
  if (moduleSlugs.has(serviceModule.id)) errors.push(`Duplicate module slug: ${serviceModule.id}`);
  moduleSlugs.add(serviceModule.id);
  if (!serviceModule.activation?.length) errors.push(`Module ${serviceModule.id} has no activation path`);
  if (!serviceModule.required?.length) errors.push(`Module ${serviceModule.id} has no requirement concepts`);
  for (const stage of serviceModule.stages ?? []) if (!stageSlugs.has(stage)) errors.push(`Module ${serviceModule.id} references unknown stage ${stage}`);
  for (const reference of [...(serviceModule.activation ?? []), ...(serviceModule.required ?? []), ...(serviceModule.supporting ?? [])]) {
    if (!conceptSlugs.has(reference)) errors.push(`Module ${serviceModule.id} references unknown concept ${reference}`);
  }
  for (const composition of serviceModule.activationCompositions ?? []) {
    if (!(composition.allOf?.length)) errors.push(`Module ${serviceModule.id} contains an empty activation composition`);
    for (const reference of composition.allOf ?? []) {
      if (!conceptSlugs.has(reference)) errors.push(`Module ${serviceModule.id} activation composition references unknown concept ${reference}`);
    }
  }
}
for (const concept of conceptRecords) {
  for (const moduleSlug of concept.possibleModuleSlugs ?? []) {
    if (!moduleSlugs.has(moduleSlug)) errors.push(`Concept ${concept.slug} references unknown module ${moduleSlug}`);
  }
}
for (const serviceModule of moduleKnowledge.modules) {
  for (const dependency of serviceModule.dependencies ?? []) {
    if (!moduleSlugs.has(dependency)) errors.push(`Module ${serviceModule.id} references unknown dependency ${dependency}`);
  }
}
const moduleById = new Map(moduleKnowledge.modules.map((module) => [module.id, module]));
const visiting = new Set();
const visited = new Set();
const visitModule = (moduleId, path = []) => {
  if (visiting.has(moduleId)) {
    errors.push(`Unsupported module dependency cycle: ${[...path, moduleId].join(" → ")}`);
    return;
  }
  if (visited.has(moduleId)) return;
  visiting.add(moduleId);
  for (const dependency of moduleById.get(moduleId)?.dependencies ?? []) visitModule(dependency, [...path, moduleId]);
  visiting.delete(moduleId);
  visited.add(moduleId);
};
for (const moduleId of [...moduleSlugs].sort()) visitModule(moduleId);

for (const [hatSlug, profile] of Object.entries(hatProfiles)) {
  if (!hats.has(hatSlug)) errors.push(`Unknown Hat semantic profile: ${hatSlug}`);
  if (profile.conceptSlugs) errors.push(`Hat semantic profile ${hatSlug} uses removed legacy conceptSlugs coverage`);
  const coverage = profile.coverage
    ? [...profile.coverage.direct, ...profile.coverage.core, ...profile.coverage.supporting, ...profile.coverage.contextual]
    : [];
  const duplicateCoverage = coverage.filter((slug, index) => coverage.indexOf(slug) !== index);
  if (duplicateCoverage.length) errors.push(`Hat semantic profile ${hatSlug} assigns a concept to conflicting tiers: ${[...new Set(duplicateCoverage)].join(", ")}`);
  if (!coverage?.length) errors.push(`Hat semantic profile ${hatSlug} has no capability coverage`);
  for (const conceptSlug of coverage ?? []) knownConcepts.add(conceptSlug);
}
for (const claim of provenance.claims) {
  if (!work.has(claim.workSlug)) errors.push(`Claim ${claim.id} references unknown Work ${claim.workSlug}`);
  if (!claim.statement?.trim()) errors.push(`Claim ${claim.id} has no statement`);
  if (!claim.conceptSlugs?.length) errors.push(`Claim ${claim.id} has no concepts`);
  if (!claim.hatAssignments?.length) errors.push(`Claim ${claim.id} has no capability assignments`);
  for (const assignment of claim.hatAssignments ?? []) {
    if (!hats.has(assignment.hatSlug)) errors.push(`Claim ${claim.id} references unknown Hat ${assignment.hatSlug}`);
    if (!assignment.role || !assignment.weight) errors.push(`Claim ${claim.id}/${assignment.hatSlug} lacks role or weight`);
  }
}
const claimIds = new Set(provenance.claims.map((claim) => claim.id));
for (const link of provenance.evidenceClaimLinks) {
  if (!claimIds.has(link.claimId)) errors.push(`Evidence link references unknown claim ${link.claimId}`);
  if (!evidence.has(link.evidenceSlug)) errors.push(`Evidence link references unknown Evidence ${link.evidenceSlug}`);
  if (!link.rationale?.trim()) errors.push(`Evidence link ${link.evidenceSlug}/${link.claimId} has no rationale`);
}
for (const conceptSlug of knownConcepts) {
  if (!conceptSlugs.has(conceptSlug)) errors.push(`Semantic profile references unknown concept ${conceptSlug}`);
}
const canonicalKnowledge = {
  schemaVersions: [coreConcepts.schemaVersion, extendedConcepts.schemaVersion, moduleKnowledge.schemaVersion],
  concepts: conceptRecords.map((record) => ({ ...record })).sort((a, b) => a.slug.localeCompare(b.slug)),
  modules: moduleKnowledge.modules.map((record) => ({ ...record })).sort((a, b) => a.id.localeCompare(b.id)),
  stages: [...stageSlugs].sort(),
};
const knowledgeHash = createHash("sha256").update(JSON.stringify(canonicalKnowledge)).digest("hex");
if (knowledgeManifest.canonicalKnowledgeHash !== knowledgeHash) {
  errors.push(`Knowledge manifest hash is stale: expected ${knowledgeHash}, found ${knowledgeManifest.canonicalKnowledgeHash}`);
}
if (errors.length) {
  console.error(JSON.stringify({ errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  concepts: conceptRecords.length,
  modules: moduleKnowledge.modules.length,
  dependencies: moduleKnowledge.modules.reduce((sum, serviceModule) => sum + (serviceModule.dependencies?.length ?? 0), 0),
  stages: stageSlugs.size,
  claims: provenance.claims.length,
  evidenceClaimLinks: provenance.evidenceClaimLinks.length,
  hatSemanticProfiles: Object.keys(hatProfiles).length,
  knowledgeHash,
  duplicateIdentities: 0,
  brokenReferences: 0,
  invalidAmbiguityPolicies: 0,
  invalidModifierPolicies: 0,
  dependencyCycles: 0,
  errors: [],
}, null, 2));
