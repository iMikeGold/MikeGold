import assert from "node:assert/strict";
import { publicHats } from "../src/system/generated/public-hats.generated";
import { publicWork } from "../src/system/generated/public-work.generated";
import { analyseServiceIntent } from "../src/system/services/intent-engine";
import { interpretConcepts } from "../src/system/services/semantic-ontology";
import { combineHatProfiles, selectPrincipalLayerHats } from "../src/system/services/polygon-engine";
import { resolveContextualDominanceMap, resolveDominantAxis } from "../src/system/services/profile-interpreter";
import { findRelatedHats } from "../src/system/services/service-engine";

const nflSlugs = new Set([
  "philadelphia-eagles-nfl-wembley-field-communications-and-resilient-signal-systems",
  "philadelphia-eagles-nfl-wembley-broadcast-audio-delivery",
  "houston-texans-london-game-field-communications-and-telecom-redundancy-systems",
]);

const positives = [
  "field communications and broadcast-audio systems",
  "Primary and backup communications paths with audio routed to transmission",
  "A resilient comms network for a live sports broadcast",
  "Reliable pitch-side communications with a feed into broadcast",
  "Pitchside telecommunications with IEM and programme-audio delivery",
];

const negatives = [
  "I need a podcast edited and published",
  "I need office Wi-Fi and email accounts",
  "I need a sports organisation identity",
];

const browserAcceptance = [
  "audio engineer",
  "audio enginee",
  "audio eng",
  "field engineer for live sports",
  "field recording for live sports",
  "sound engineer for live sports",
  "media systems",
  "build server",
  "build server rack",
  "design website",
  "build website",
  "build and design website",
  "website connected to a database",
  "design logo from image",
  "recreate logo from image",
  "studio engineer",
  "live sound engineer",
  "logo designer",
  "engineer",
  "build website with user accounts",
  "create a secure staff portal with role permissions",
  "add login to an existing website",
];

const liveSenseQueries = [
  "design a live website",
  "build a live website",
  "maintain a live website",
  "live sound engineer",
  "live sports broadcast",
  "live web presence",
  "make the website live",
  "live recording session",
];
const unresolvedBroadActivityQueries = [
  "design unknownword",
  "design nonsenseobject",
  "design unrecognised object",
];

const umbrellaQueries = [
  "reliable media system",
  "interactive media installation",
  "reliable multimedia distribution system",
  "scalable media streaming platform",
  "physical media playback installation",
  "connected media-control system",
  "I need an accessible identity system",
  "I need a scalable community platform",
  "I need a secure data system",
  "I need a hardware product with embedded control",
  "I need a content system that can publish across formats",
];

const queryRunTotal = positives.length + negatives.length + umbrellaQueries.length
  + browserAcceptance.length + liveSenseQueries.length + unresolvedBroadActivityQueries.length + 6 + 2 + 2 + 4;
let queryRunIndex = 0;
const runQuery = (query: string) => {
  const startedAt = performance.now();
  const result = analyseServiceIntent(publicHats, publicWork, query);
  queryRunIndex += 1;
  console.error(`[${queryRunIndex}/${queryRunTotal}] ${query} — analysed — ${(performance.now() - startedAt).toFixed(0)}ms`);
  return result;
};

const declaredRelationshipSource = publicHats.find((hat) => (hat.relationships ?? []).length > 0)!;
const declaredTargets = [...(declaredRelationshipSource.relationships ?? [])]
  .sort((left, right) => right.strength - left.strength
    || publicHats.find((hat) => hat.id === left.targetId)!.name.localeCompare(publicHats.find((hat) => hat.id === right.targetId)!.name))
  .map((item) => item.targetId);
assert.deepEqual(
  findRelatedHats(declaredRelationshipSource, publicHats).map((item) => item.hat.id),
  declaredTargets,
  "Registry Related Hats must contain exactly the declared targets in stable order.",
);
const unrelatedSource = publicHats.find((hat) => (hat.relationships ?? []).length === 0)!;
assert.deepEqual(findRelatedHats(unrelatedSource, publicHats), [], "A Hat without declared edges must have no fallback recommendations.");
const changedPresentationSource = {
  ...declaredRelationshipSource,
  category: declaredRelationshipSource.category === "creative" ? "engineering" as const : "creative" as const,
  description: "Completely changed presentation prose that must not alter declared relationships.",
  tags: { core: ["unrelated"], adjacent: ["changed"], meta: ["presentation"] },
  weight: { base: 0, experience: 0, rarity: 0 },
};
assert.deepEqual(
  findRelatedHats(changedPresentationSource, publicHats).map((item) => item.hat.id),
  declaredTargets,
  "Tags, category, prose and legacy profile inputs must not change Related Hats.",
);
const directionalEdge = publicHats.flatMap((source) => (source.relationships ?? []).map((edge) => ({ source, edge })))
  .find(({ source, edge }) => !(publicHats.find((hat) => hat.id === edge.targetId)?.relationships ?? []).some((reverse) => reverse.targetId === source.id));
if (directionalEdge) {
  const target = publicHats.find((hat) => hat.id === directionalEdge.edge.targetId)!;
  assert.ok(
    !findRelatedHats(target, publicHats).some((item) => item.hat.id === directionalEdge.source.id),
    "A directional relationship must not be mirrored implicitly.",
  );
}

const positiveResults = positives.map((query) => {
  const result = runQuery(query);
  const matched = result.relevantWork.filter((item) => nflSlugs.has(item.workSlug));
  assert.ok(matched.length >= 2, `${query}: expected at least two responsibility-bearing NFL contributions.`);
  assert.ok(result.capabilityConfiguration.every((item) => item.reasons.length), `${query}: selected Hats require contextual reasons.`);
  assert.ok(result.modules.every((item) => !item.name.includes("Cloud") && !item.name.includes("Web")), `${query}: reliability must not activate Cloud or Web.`);
  return { query, modules: result.modules.map((item) => item.id), work: matched.map((item) => item.workSlug), hats: result.capabilityConfiguration.map((item) => item.slug) };
});

const negativeResults = negatives.map((query) => {
  const result = runQuery(query);
  const primaryNfl = result.relevantWork.filter((item) => nflSlugs.has(item.workSlug) && !["comparable-context", "supporting-work"].includes(item.presentationClass));
  assert.equal(primaryNfl.length, 0, `${query}: NFL work must not appear as primary relevant experience.`);
  return { query, title: result.title, primaryNfl: primaryNfl.length };
});

for (const query of unresolvedBroadActivityQueries) {
  const result = runQuery(query);
  assert.equal(result.publicStatus, "clarification-required", `${query}: a broad activity with an unresolved subject must request clarification.`);
  assert.equal(result.relevantWork.length, 0, `${query}: unresolved broad activity must not produce a stock archive list.`);
  assert.ok(result.interpretedIntent.ambiguities.some((message) => message.includes("recognised object")), `${query}: clarification must explain the missing subject.`);
}

const ecommerceTypoResult = runQuery("design eccomerce");
assert.ok(
  ecommerceTypoResult.interpretedIntent.concepts.some((concept) => concept.slug === "ecommerce-storefront"),
  "eccomerce must resolve through the reusable ecommerce storefront lexical record.",
);
assert.notEqual(ecommerceTypoResult.publicStatus, "clarification-required", "a recognised ecommerce typo must follow normal composition.");
assert.ok(ecommerceTypoResult.modules.some((module) => module.id === "web-application"), "ecommerce design must activate the existing web application route.");
const checkoutComponentResult = runQuery("add checkout to my existing website");
assert.ok(checkoutComponentResult.interpretedIntent.concepts.some((concept) => concept.slug === "checkout-system"));
assert.ok(checkoutComponentResult.interpretedIntent.concepts.every((concept) => concept.slug !== "ecommerce-storefront"), "checkout must not imply a complete storefront.");
assert.ok(!interpretConcepts("checkout system").expanded.has("ecommerce-storefront"), "PART_OF must be non-activating during concept traversal.");
const catalogueComponentResult = runQuery("design a product catalogue");
assert.ok(catalogueComponentResult.interpretedIntent.concepts.some((concept) => concept.slug === "product-catalogue"));
assert.ok(catalogueComponentResult.interpretedIntent.concepts.every((concept) => concept.slug !== "ecommerce-storefront"), "product catalogue must not imply commerce or payments.");
assert.ok(!interpretConcepts("product catalogue").expanded.has("ecommerce-storefront"), "catalogue PART_OF must not expand to storefront.");
const onlineShopResult = runQuery("build an online shop");
assert.ok(onlineShopResult.interpretedIntent.concepts.some((concept) => concept.slug === "ecommerce-storefront"));
const digitalStorefrontResult = runQuery("design a digital storefront");
assert.ok(digitalStorefrontResult.interpretedIntent.concepts.some((concept) => concept.slug === "ecommerce-storefront"));
const physicalStorefrontResult = runQuery("design a physical storefront");
assert.equal(physicalStorefrontResult.publicStatus, "clarification-required", "bare/physical storefront must not silently become a web application.");
assert.equal(physicalStorefrontResult.relevantWork.length, 0);
assert.ok(physicalStorefrontResult.interpretedIntent.concepts.every((concept) => concept.slug !== "ecommerce-storefront"));

assert.deepEqual(
  resolveDominantAxis([8, 8, 8, 8, 6.1, 2.5]).coDominantAxes,
  ["Depth", "Creativity", "Scale", "Interaction"],
  "Live Systems Designer must expose its four-way tie without fixed-order dominance.",
);
assert.deepEqual(
  resolveDominantAxis([8, 8, 8, 5.9, 4.7, 2.5]).coDominantAxes,
  ["Depth", "Creativity", "Scale"],
  "The Live Systems + Lighting stack must expose its three co-dominant axes.",
);

const umbrellaResults = umbrellaQueries.map((query) => {
  const result = runQuery(query);
  const repeated = analyseServiceIntent(publicHats, publicWork, query);
  assert.deepEqual(repeated, result, `${query}: identical input and knowledge must produce a byte-stable analysis object.`);
  assert.equal(repeated.diagnostics.analysisHash, result.diagnostics.analysisHash, `${query}: deterministic analysis hash changed.`);
  assert.equal(repeated.diagnostics.knowledgeHash, result.diagnostics.knowledgeHash, `${query}: deterministic knowledge hash changed.`);
  assert.ok(result.interpretedIntent.concepts.length, `${query}: expected a resolved object or controlled ambiguity.`);
  assert.ok(result.capabilityConfiguration.every((item) => item.reasons.length), `${query}: every selected Hat needs a contextual reason.`);
  if (query === "reliable media system") {
    assert.ok(result.interpretedIntent.ambiguities.some((item) => item.includes("media function")), "media system must expose its record-defined unresolved branch.");
    assert.ok(result.modules.some((item) => item.id === "media-system-definition" && item.status === "required"), "media-system definition must anchor the route.");
    assert.ok(result.modules.filter((item) => item.id === "signal-path-redundancy").every((item) => item.status === "recommended"), "reliability may modify but not define the route.");
    assert.ok(
      result.relevantWork.every((item) => item.admissionTrace.baseAdmissionScore > 0),
      "a selected capability must not admit Work without a semantic or claim-level base match.",
    );
  }
  if (query.includes("community platform")) {
    assert.ok(result.interpretedIntent.ambiguities.length, "record-defined community platform must use the generic ambiguity resolver.");
    assert.ok(result.modules.some((item) => item.id === "community-platform-definition"), "record-defined module hint must activate without a domain conditional.");
  }
  const quality = result.interpretedIntent.concepts.find((item) => ["quality", "constraint"].includes(item.kind));
  if (quality) assert.ok(result.diagnostics.modifierBindings.length, `${query}: quality must bind to a resolved target.`);
  return { query, ambiguities: result.interpretedIntent.ambiguities, modules: result.modules.map((item) => `${item.status}:${item.id}`), experienceTypes: [...new Set(result.relevantWork.map((item) => item.presentationClass))] };
});

const browserAcceptanceResults = browserAcceptance.map((query) => {
  const result = runQuery(query);
  const consumedWords = new Set(result.diagnostics.recognisedPhrases.flatMap((phrase) => phrase.split(/\s+/)));
  assert.ok(result.interpretedIntent.unresolvedTerms.every((term) => !consumedWords.has(term)), `${query}: a recognised phrase token remained unresolved.`);
  assert.notEqual(result.publicStatus, "clarification-required", `${query}: useful partial language must not be rejected.`);
  if (query.startsWith("audio eng")) assert.equal(result.queryMode, "capability-role-lookup");
  if (query === "audio engineer") assert.ok(result.capabilityConfiguration.length >= 2, "audio engineer should explore several relevant capabilities.");
  if (query === "engineer") assert.equal(result.relevantWork.length, 0, "a generic role alone must not admit Work.");
  if (query === "studio engineer") assert.ok(result.capabilityConfiguration.some((item) => ["audio-engineer", "sound-engineer", "music-engineer"].includes(item.slug)));
  if (query === "live sound engineer") assert.ok(result.relevantWork.every((item) => !["bamboograph", "best-indies", "ourgani"].includes(item.projectSlug)));
  if (query === "logo designer") {
    assert.ok(result.modules.some((item) => item.id === "logo-identity-design"));
    assert.ok(result.modules.every((item) => item.id !== "logo-artwork-recreation"));
  }
  if (query === "build website") assert.ok(
    result.capabilityConfiguration.some((item) => ["application-engineer", "software-engineer"].includes(item.slug))
      && result.capabilityConfiguration.every((item) => item.slug !== "access-control-engineer"),
    JSON.stringify(result.capabilityConfiguration),
  );
  if (query === "design website") assert.ok(
    result.capabilityConfiguration[0]?.slug === "web-design-engineer"
      && result.capabilityConfiguration.some((item) => ["application-engineer", "software-engineer"].includes(item.slug)),
    JSON.stringify(result.capabilityConfiguration),
  );
  if (query === "build and design website") assert.ok(
    result.capabilityConfiguration.some((item) => ["application-engineer", "software-engineer"].includes(item.slug))
      && result.capabilityConfiguration.some((item) => item.slug === "web-design-engineer"),
    JSON.stringify(result.capabilityConfiguration),
  );
  if (query === "website connected to a database") assert.ok(
    result.capabilityConfiguration.every((item) => item.slug !== "access-control-engineer"),
    JSON.stringify(result.capabilityConfiguration),
  );
  if (["build website with user accounts", "create a secure staff portal with role permissions", "add login to an existing website"].includes(query)) {
    assert.ok(result.capabilityConfiguration.some((item) => item.slug === "access-control-engineer"), JSON.stringify(result.capabilityConfiguration));
  }
  if (query === "create a secure staff portal with role permissions") {
    assert.ok(
      result.capabilityConfiguration.some((item) => ["application-engineer", "software-engineer"].includes(item.slug)),
      JSON.stringify(result.capabilityConfiguration),
    );
  }
  if (query === "media systems") assert.equal(result.publicStatus, "exploratory-route");
  if (query === "build server rack") assert.ok(result.modules.some((item) => item.id === "physical-infrastructure-integration") && result.modules.every((item) => item.id !== "cloud-operations"));
  if (query.includes("logo from image")) assert.ok(
    result.modules.some((item) => item.id === "logo-artwork-recreation") && result.modules.every((item) => item.id !== "identity-system"),
    JSON.stringify({ concepts: result.interpretedIntent.concepts, modules: result.modules }),
  );
  assert.ok(
    result.relevantWork
      .filter((item) => item.relationshipSource === "derived-candidate")
      .every((item) => item.presentationClass === "archive-connection" || item.presentationClass === "capability-connected-work" || item.presentationClass === "connected-system-experience"),
    `${query}: derived Work received an unsupported public class: ${JSON.stringify(result.relevantWork.map((item) => ({ work: item.workSlug, source: item.relationshipSource, class: item.presentationClass })))}`,
  );
  return {
    query,
    mode: result.queryMode,
    status: result.publicStatus,
    concepts: result.interpretedIntent.concepts.map((item) => item.slug),
    unresolved: result.interpretedIntent.unresolvedTerms,
    modules: result.modules.map((item) => item.id),
  };
});

const liveSenseResults = liveSenseQueries.map((query) => {
  const result = runQuery(query);
  const recognised = new Set(result.interpretedIntent.concepts.map((item) => item.slug));
  if (query === "live sound engineer" || query === "live recording session") {
    assert.ok(result.diagnostics.modifierBindings.some((binding) => binding.endsWith("live-environment")), `${query}: live must resolve to the event/audio sense.`);
  }
  if (query === "live web presence" || query === "design a live website" || query === "build a live website") {
    assert.ok(result.diagnostics.modifierBindings.some((binding) => binding.endsWith("operational-state")), `${query}: live must resolve to a reusable operational state.`);
    assert.ok(result.modules.every((module) => module.id !== "cloud-operations"), `${query}: operational state must not independently select cloud operations.`);
  }
  if (query === "maintain a live website") {
    assert.ok(result.modules.some((module) => module.id === "cloud-operations"), `${query}: operation + web application + operational state should select operations.`);
  }
  if (query === "make the website live") {
    assert.ok(recognised.has("transition-to-live"), `${query}: movement into the live state must resolve as a transition activity.`);
    assert.ok(result.modules.some((module) => module.id === "cloud-operations"), `${query}: transition + web application should select deployment/release.`);
  }
  if (query === "live sports broadcast") assert.ok(recognised.has("live-sport") || recognised.has("live-broadcast"));
  assert.ok(result.relevantWork.every((item) => item.scoreComponents.responsibility > 0 || item.scoreComponents.capability > 0), `${query}: environment/state alone admitted Work.`);
  return {
    query,
    concepts: result.interpretedIntent.concepts.map((item) => item.slug),
    bindings: result.diagnostics.modifierBindings,
    modules: result.modules.map((item) => item.id),
    work: result.relevantWork.map((item) => item.workSlug),
  };
});

for (const query of ["operational", "live event environment"]) {
  const result = runQuery(query);
  assert.equal(result.modules.length, 0, `${query}: state/environment alone must activate no delivery module.`);
  assert.equal(result.diagnostics.addedDependencies.length, 0, `${query}: state/environment alone must add no dependency.`);
  assert.equal(result.capabilityRequirements.length, 0, `${query}: state/environment alone must create no capability requirement.`);
  assert.equal(result.capabilityConfiguration.length, 0, `${query}: state/environment alone must configure no capability.`);
  assert.equal(result.relevantWork.length, 0, `${query}: state/environment alone must admit no Work.`);
}

const retrievalInvariantCases = [
  {
    query: "build over ip audio playback system",
    forbiddenProjects: ["2xu-wetsuit-testing", "bamboograph", "bonsai-tree-of-life"],
  },
  {
    query: "live media system",
    forbiddenProjects: ["bristow-operational-excellence", "2xu-wetsuit-testing"],
  },
];
for (const { query, forbiddenProjects } of retrievalInvariantCases) {
  const result = runQuery(query);
  assert.ok(
    result.relevantWork.every((item) => item.admissionTrace.baseAdmissionScore > 0),
    `${query}: every Work result needs an admission reason before capability boosts.`,
  );
  assert.ok(
    result.relevantWork.every((item) => !forbiddenProjects.includes(item.projectSlug)),
    `${query}: Hat-only Work leaked into the result: ${JSON.stringify(result.relevantWork)}`,
  );
}

const determinismQueries = [
  "physical media playback installation",
  "reliable media system",
  "accessible community platform",
  "resilient live audio and communications system",
];
const determinismSnapshots = determinismQueries.map((query) => ({
  query,
  result: runQuery(query),
}));

const tenHatStack = publicHats.slice(0, 10);
const reversedTenHatStack = [...tenHatStack].reverse();
assert.equal(resolveContextualDominanceMap(tenHatStack).size, 10, "All selected Hats must receive contextual dominance.");
assert.deepEqual(combineHatProfiles(tenHatStack), combineHatProfiles(reversedTenHatStack), "Combined profile must not depend on selection order.");
assert.deepEqual(
  [...resolveContextualDominanceMap(tenHatStack)].sort(),
  [...resolveContextualDominanceMap(reversedTenHatStack)].sort(),
  "Contextual attribute colour must not depend on selection order.",
);
assert.equal(selectPrincipalLayerHats(tenHatStack).length, 7, "Only explanatory layers, not selected Hat truth, may be limited to seven.");

console.log(JSON.stringify({
  positiveQueries: positiveResults.length,
  negativeQueries: negativeResults.length,
  umbrellaQueries: umbrellaResults.length,
  browserAcceptanceQueries: browserAcceptanceResults.length,
  liveSenseResults,
  determinismSnapshots:
    process.env.SERVICE_INCLUDE_DETERMINISM_SNAPSHOTS === "1"
      ? determinismSnapshots
      : determinismSnapshots.map(({ query, result }) => ({
          query,
          analysisHash: result.diagnostics.analysisHash,
        })),
}, null, 2));
