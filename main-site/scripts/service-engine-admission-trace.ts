import { publicHats } from "../src/system/generated/public-hats.generated";
import { publicWork } from "../src/system/generated/public-work.generated";
import { analyseServiceIntent } from "../src/system/services/intent-engine";

const defaultQueries = [
  "field comms live sport",
  "build over ip audio playback system",
  "live media system",
  "complex product design language interpretation",
  "camera operator",
];
const queries = process.argv.slice(2).length ? process.argv.slice(2) : defaultQueries;
const expectedFalseCandidates: Record<string, string[]> = {
  "build over ip audio playback system": [
    "2xu-wetsuit-testing-distribution-systems",
    "bamboograph-system-development",
    "bonsai-tree-of-life-system-development",
  ],
  "live media system": [
    "bristow-operational-excellence-electronics-systems-engineering",
    "2xu-wetsuit-testing-distribution-systems",
  ],
};

const report = queries.map((query) => {
  const result = analyseServiceIntent(publicHats, publicWork, query);
  return {
    query,
    mode: result.queryMode,
    status: result.publicStatus,
    concepts: result.interpretedIntent.concepts.map(({ slug, kind, sourcePhrase }) => ({
      slug,
      kind,
      sourcePhrase,
    })),
    unresolved: result.interpretedIntent.unresolvedTerms,
    modules: result.modules.map(({ id, status }) => ({ id, status })),
    capabilities: result.capabilityConfiguration.map(({ slug, role, requirementSlugs, reasons }) => ({
      slug,
      role,
      requirementSlugs,
      reasons,
    })),
    work: result.relevantWork.map((item) => ({
      workSlug: item.workSlug,
      projectSlug: item.projectSlug,
      provenanceTier: item.presentationClass,
      relationshipSource: item.relationshipSource,
      matchingClaimIds: item.matchedClaimIds,
      matchingConcepts: item.matchedConcepts,
      hatRelationshipsUsed: item.matchedHatSlugs,
      baseAdmissionScore: item.admissionTrace.baseAdmissionScore,
      admittedBy: item.admissionTrace.admittedBy,
      boosts: item.admissionTrace.boosts,
      finalScore: item.score,
      reason: item.reasons,
    })),
    excludedFalseCandidates: (expectedFalseCandidates[query] ?? []).map((workSlug) => {
      const work = publicWork.find((item) => item.slug === workSlug);
      const selectedHatSlugs = new Set(result.capabilityConfiguration.map((item) => item.slug));
      const existingHatLinks = work?.appliedHatSlugs.filter((slug) => selectedHatSlugs.has(slug)) ?? [];
      return {
        workSlug,
        existingHatLinks,
        returned: result.relevantWork.some((item) => item.workSlug === workSlug),
        baseAdmissionScore: 0,
        boostsApplied: 0,
        reason: existingHatLinks.length
          ? "Selected-Hat relationship exists, but no matching contribution claim or semantic base admission exists."
          : "No matching contribution claim or semantic base admission exists.",
      };
    }),
  };
});

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
