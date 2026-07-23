import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import {
  CONCEPT_BY_SLUG, expandConcepts, hatSemanticConcepts, interpretConcepts,
  workSemanticSignature,
} from "@/system/services/semantic-ontology";

type ModuleStatus = "required" | "recommended" | "optional";
type ModuleDefinition = {
  id: string; name: string; activation: string[]; required: string[]; supporting: string[];
  outcomes: string[]; deliverables: string[]; dependencies?: string[];
};
type HatResolution = { slug: string; role: "lead" | "core" | "supporting"; score: number; source: "evidenced" | "inferred"; reasons: string[] };

export type ServiceConfiguration = {
  title: string; summary: string;
  interpretedIntent: {
    concepts: Array<{ slug: string; label: string; kind: string; sourcePhrase: string; confidence: number; alternatives: string[] }>;
    unresolvedTerms: string[];
    ambiguities: string[];
  };
  modules: Array<{ id: string; name: string; reason: string; status: ModuleStatus; deliverables: string[] }>;
  scope: { objective: string; includedSystems: string[]; outcomes: string[]; assumptions: string[]; exclusions: string[]; questions: string[] };
  deliveryPhases: Array<{ name: string; purpose: string; moduleIds: string[] }>;
  capabilityRequirements: Array<{
    conceptSlug: string;
    role: "required" | "recommended";
    selectedHatSlugs: string[];
    evidencedHatSlugs: string[];
    inferredHatSlugs: string[];
  }>;
  capabilityConfiguration: HatResolution[];
  leadHatSlugs: string[]; supportingHatSlugs: string[];
  relevantWork: Array<{ workSlug: string; projectSlug: string; reason: string; score: number; matchedConcepts: string[]; relationshipSource: "authored" | "derived" }>;
  confidence: { level: "insufficient" | "provisional" | "strong"; explanation: string };
  engineVersion: string;
};

const MODULES: ModuleDefinition[] = [
  { id: "field-communications-design", name: "Field communications design", activation: ["field-communications", "live-field-operations"], required: ["field-communications", "communications-networking"], supporting: ["signal-path-resilience", "systems-integration"], outcomes: ["dependable operational communications in a live field environment"], deliverables: ["communications topology", "routing and redundancy plan", "operational configuration"], dependencies: ["testing-commissioning"] },
  { id: "broadcast-audio-delivery", name: "Broadcast-audio delivery", activation: ["broadcast-audio-delivery", "live-broadcast"], required: ["broadcast-audio-delivery", "signal-flow-design"], supporting: ["media-distribution", "reliability-engineering"], outcomes: ["continuous programme-audio delivery into the audience broadcast workflow"], deliverables: ["broadcast signal-flow design", "audio routing configuration", "delivery and continuity plan"], dependencies: ["testing-commissioning"] },
  { id: "testing-commissioning", name: "Testing and commissioning", activation: ["testing-commissioning", "reliability-engineering"], required: ["testing-commissioning"], supporting: ["systems-integration", "reliability-engineering"], outcomes: ["a verified system ready for operational use"], deliverables: ["test plan", "commissioning checks", "operational handover"] },
  { id: "physical-audio-system", name: "Physical audio-system engineering", activation: ["physical-audio-systems"], required: ["physical-audio-systems", "signal-flow-design"], supporting: ["systems-integration", "testing-commissioning"], outcomes: ["an integrated and dependable physical audio system"], deliverables: ["system design", "signal-path plan", "installation and test plan"], dependencies: ["testing-commissioning"] },
  { id: "web-application", name: "Web and application engineering", activation: ["web-application", "software-engineering"], required: ["web-application", "software-engineering"], supporting: ["data-systems"], outcomes: ["a usable executable digital service"], deliverables: ["application architecture", "responsive interface", "production build"] },
  { id: "data-system", name: "Data-system definition and engineering", activation: ["data-systems", "product-definition"], required: ["data-systems"], supporting: ["product-definition", "software-engineering"], outcomes: ["structured information that can be interpreted and experienced in multiple ways"], deliverables: ["data model", "interpretation model", "system definition"] },
  { id: "cloud-operations", name: "Cloud deployment and operations", activation: ["cloud-operations"], required: ["cloud-operations"], supporting: ["software-engineering", "reliability-engineering"], outcomes: ["a reliable live production service"], deliverables: ["runtime environment", "release workflow", "operational documentation"] },
  { id: "identity-system", name: "Brand and identity system", activation: ["identity-systems"], required: ["identity-systems"], supporting: [], outcomes: ["a coherent system of recognition and expression"], deliverables: ["identity direction", "visual language", "application system"] },
  { id: "electronics-integration", name: "Electronics and physical-system integration", activation: ["electronics-integration"], required: ["electronics-integration", "systems-integration"], supporting: ["testing-commissioning"], outcomes: ["working electronic and embedded integration"], deliverables: ["technical architecture", "integrated build", "test plan"], dependencies: ["testing-commissioning"] },
];

const STOP = new Set(["a", "an", "and", "for", "i", "need", "the", "to", "want", "with", "build", "create", "system", "systems"]);
const words = (value: string) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, " ").split(/\s+/).filter((item) => item && !STOP.has(item));

export function analyseServiceIntent(hats: PublicHat[], work: PublicWorkProjection[], query: string): ServiceConfiguration {
  const interpretation = interpretConcepts(query);
  const directSlugs = new Set(interpretation.direct.map(({ item }) => item.slug));
  const rankedModules = MODULES.map((module) => {
    const activation = module.activation.filter((slug) => directSlugs.has(slug));
    const related = module.required.filter((slug) => interpretation.expanded.has(slug));
    return { module, activation, related, score: activation.length * 30 + related.length * 9 };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);

  if (words(query).length < 2 || !rankedModules.length) return {
    title: "More detail needed",
    summary: "Describe the outcome, the thing being made or changed, and its operating environment.",
    interpretedIntent: {
      concepts: interpretation.direct.map(({ item, matches }) => ({
        slug: item.slug, label: item.label, kind: item.kind, sourcePhrase: matches[0],
        confidence: matches[0] === item.label.toLowerCase() ? 1 : 0.92,
        alternatives: (item.related ?? []).map((slug) => CONCEPT_BY_SLUG.get(slug)?.label ?? slug),
      })),
      unresolvedTerms: words(query),
      ambiguities: [],
    },
    modules: [], scope: { objective: "", includedSystems: [], outcomes: [], assumptions: [], exclusions: [], questions: ["What must the finished system enable?", "Where and under what constraints will it operate?"] },
    deliveryPhases: [], capabilityRequirements: [], capabilityConfiguration: [], leadHatSlugs: [], supportingHatSlugs: [], relevantWork: [],
    confidence: { level: "insufficient", explanation: "No defined service route has enough semantic coverage yet." }, engineVersion: "semantic-service-engine/2.0",
  };

  const selected = rankedModules.filter(({ score }) => score >= Math.max(9, rankedModules[0].score * 0.3));
  const ids = new Set(selected.map(({ module }) => module.id));
  for (const item of [...selected]) for (const dependency of item.module.dependencies ?? []) {
    const found = MODULES.find((module) => module.id === dependency);
    if (found && !ids.has(found.id)) { selected.push({ module: found, activation: [], related: [], score: 1 }); ids.add(found.id); }
  }
  const requiredConcepts = expandConcepts(selected.flatMap(({ module }) => [...module.required, ...module.supporting]));
  const workResults = work.map((item) => {
    const signature = workSemanticSignature(item);
    const expanded = expandConcepts(signature.concepts);
    const matched = [...requiredConcepts].filter((slug) => expanded.has(slug));
    const direct = signature.concepts.filter((slug) => directSlugs.has(slug));
    const primaryLens = item.lensAssignments.some((lens) => lens.role === "primary");
    const score = direct.length * 35 + matched.length * 8 + item.appliedHatSlugs.length * 1.5 + (primaryLens ? 2 : 0);
    return { item, signature, matched: [...new Set([...direct, ...matched])], score };
  }).filter(({ score }) => score >= 18).sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug));

  const evidencedHatSlugs = new Set(workResults.slice(0, 12).flatMap(({ item }) => item.appliedHatSlugs));
  const candidates = hats.map((hat) => {
    const concepts = hatSemanticConcepts(hat);
    const covered = [...requiredConcepts].filter((slug) => concepts.has(slug));
    const directCoverage = [...directSlugs].filter((slug) => concepts.has(slug));
    const evidenced = evidencedHatSlugs.has(hat.slug);
    return { hat, covered, score: directCoverage.length * 20 + covered.length * 6 + (evidenced ? 8 : 0), evidenced };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.hat.name.localeCompare(b.hat.name));

  const uncovered = new Set(requiredConcepts);
  const configured: HatResolution[] = [];
  for (const candidate of candidates) {
    const newCoverage = candidate.covered.filter((slug) => uncovered.has(slug));
    if (!newCoverage.length && configured.length >= 4) continue;
    configured.push({
      slug: candidate.hat.slug,
      role: configured.length < 2 ? "lead" : candidate.evidenced ? "core" : "supporting",
      score: candidate.score,
      source: candidate.evidenced ? "evidenced" : "inferred",
      reasons: newCoverage.slice(0, 4).map((slug) => `Covers ${CONCEPT_BY_SLUG.get(slug)?.label ?? slug}.`),
    });
    newCoverage.forEach((slug) => uncovered.delete(slug));
    if (!uncovered.size || configured.length >= 12) break;
  }

  const conceptLabels = interpretation.direct.map(({ item }) => item.label);
  const outcomes = [...new Set(selected.flatMap(({ module }) => module.outcomes))];
  const requiredModules = selected.filter(({ score }) => score > 1);
  const level = directSlugs.size >= 3 && requiredModules.length >= 2 ? "strong" : "provisional";
  const leadHatSlugs = configured.filter((item) => item.role === "lead" || item.role === "core").map((item) => item.slug);
  const supportingHatSlugs = configured.filter((item) => item.role === "supporting").map((item) => item.slug);
  const capabilityRequirements = [...requiredConcepts].map((conceptSlug) => {
    const covering = configured.filter((item) => hatSemanticConcepts(hats.find((hat) => hat.slug === item.slug)!).has(conceptSlug));
    return {
      conceptSlug,
      role: selected.some(({ module }) => module.required.includes(conceptSlug)) ? "required" as const : "recommended" as const,
      selectedHatSlugs: covering.map((item) => item.slug),
      evidencedHatSlugs: covering.filter((item) => item.source === "evidenced").map((item) => item.slug),
      inferredHatSlugs: covering.filter((item) => item.source === "inferred").map((item) => item.slug),
    };
  });
  return {
    title: requiredModules.slice(0, 2).map(({ module }) => module.name).join(" + "),
    summary: `A connected route for ${conceptLabels.slice(0, 4).join(", ").toLowerCase()}, assembled from semantic responsibilities rather than title matches.`,
    interpretedIntent: {
      concepts: interpretation.direct.map(({ item, matches }) => ({
        slug: item.slug, label: item.label, kind: item.kind, sourcePhrase: matches[0],
        confidence: matches[0] === item.label.toLowerCase() ? 1 : 0.92,
        alternatives: (item.related ?? []).map((slug) => CONCEPT_BY_SLUG.get(slug)?.label ?? slug),
      })),
      unresolvedTerms: words(query).filter((word) => !interpretation.direct.some(({ matches }) => matches.some((phrase) => words(phrase).includes(word)))),
      ambiguities: [],
    },
    modules: selected.map(({ module, activation, score }) => ({
      id: module.id, name: module.name, status: score === 1 ? "recommended" : activation.length ? "required" : "optional",
      reason: score === 1 ? "Required as a dependency of an activated module." : `Activated by ${activation.map((slug) => CONCEPT_BY_SLUG.get(slug)?.label ?? slug).join(" and ")}.`,
      deliverables: module.deliverables,
    })),
    scope: {
      objective: outcomes.join("; "),
      includedSystems: conceptLabels,
      outcomes,
      assumptions: ["The enquiry describes an initial outcome, not a confirmed technical specification."],
      exclusions: ["Commercial terms and site-specific constraints remain outside this provisional configuration."],
      questions: ["What existing systems and interfaces must be retained?", "What continuity, access and delivery constraints apply?"],
    },
    deliveryPhases: [
      { name: "Discover and define", purpose: "Confirm outcomes, boundaries, interfaces and constraints.", moduleIds: selected.map(({ module }) => module.id) },
      { name: "Design and integrate", purpose: "Configure and connect the required service modules.", moduleIds: selected.filter(({ module }) => module.id !== "testing-commissioning").map(({ module }) => module.id) },
      { name: "Test and commission", purpose: "Validate continuity, operation and readiness.", moduleIds: selected.filter(({ module }) => module.id === "testing-commissioning").map(({ module }) => module.id) },
      { name: "Deliver and hand over", purpose: "Operate or release the system with traceable documentation.", moduleIds: selected.map(({ module }) => module.id) },
    ].filter((phase) => phase.moduleIds.length),
    capabilityRequirements, capabilityConfiguration: configured, leadHatSlugs, supportingHatSlugs,
    relevantWork: workResults.map(({ item, matched, score, signature }) => ({
      workSlug: item.slug, projectSlug: item.projectSlug, score: Number(score.toFixed(1)),
      matchedConcepts: matched, relationshipSource: signature.source,
      reason: `Demonstrates ${matched.slice(0, 4).map((slug) => CONCEPT_BY_SLUG.get(slug)?.label ?? slug).join(", ")}${signature.source === "authored" ? " through an authored semantic profile" : " through the shared concept graph"}.`,
    })),
    confidence: { level, explanation: `${directSlugs.size} canonical concepts activated ${selected.length} connected modules. Inferred Hats are recommendations, not claims about historical work.` },
    engineVersion: "semantic-service-engine/2.0",
  };
}
