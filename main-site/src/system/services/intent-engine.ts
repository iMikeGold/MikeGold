import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import { getMeaningfulSearchTerms } from "@/system/services/service-engine";
import type { CapabilityGroupId } from "@/system/work/capability-groups";

type ModuleStatus = "required" | "recommended" | "optional";
type ServiceModuleDefinition = {
  id: string; name: string; aliases: string[]; outcomes: string[]; qualifiers: string[];
  deliverables: string[]; leadHatSlugs: string[]; supportingHatSlugs: string[];
  relatedGroupIds: CapabilityGroupId[]; dependencies?: string[];
};

export type ServiceConfiguration = {
  title: string; summary: string;
  interpretedIntent: { outcomes: string[]; objects: string[]; constraints: string[]; qualifiers: string[] };
  modules: Array<{ id: string; name: string; reason: string; status: ModuleStatus; deliverables: string[] }>;
  deliveryPhases: Array<{ name: string; purpose: string; moduleIds: string[] }>;
  leadHatSlugs: string[]; supportingHatSlugs: string[];
  relevantWork: Array<{ workSlug: string; projectSlug: string; reason: string; score: number }>;
  confidence: { level: "insufficient" | "provisional" | "strong"; explanation: string };
};

const MODULES: ServiceModuleDefinition[] = [
  { id: "product-system-definition", name: "Product and system definition", aliases: ["product", "platform", "service", "system", "idea", "define", "architecture"], outcomes: ["a coherent product or service model"], qualifiers: ["scalable", "public-facing", "multi-user"], deliverables: ["system definition", "service architecture", "delivery brief"], leadHatSlugs: ["systems-engineer", "concept-engineer"], supportingHatSlugs: ["data-modeler"], relatedGroupIds: ["system-product-definition"] },
  { id: "web-application", name: "Web and application engineering", aliases: ["website", "web", "application", "app", "interface", "frontend", "interactive"], outcomes: ["a usable public-facing digital product"], qualifiers: ["public-facing", "responsive", "interactive"], deliverables: ["interaction architecture", "responsive interface", "production application"], leadHatSlugs: ["web-design-engineer", "interface-designer"], supportingHatSlugs: ["systems-engineer"], relatedGroupIds: ["software-web-engineering"] },
  { id: "backend-data", name: "Backend and data integration", aliases: ["backend", "api", "database", "accounts", "data", "integration", "content"], outcomes: ["persistent and connected service behaviour"], qualifiers: ["scalable", "multi-user"], deliverables: ["data model", "service interfaces", "integration layer"], leadHatSlugs: ["data-modeler", "systems-engineer"], supportingHatSlugs: ["web-design-engineer"], relatedGroupIds: ["software-web-engineering", "system-product-definition"] },
  { id: "cloud-deployment", name: "Cloud deployment and operations", aliases: ["cloud", "deploy", "hosting", "production", "server", "reliable", "scale"], outcomes: ["a reliable live production service"], qualifiers: ["production-ready", "scalable", "live"], deliverables: ["deployment environment", "release workflow", "operational documentation"], leadHatSlugs: ["deployment-engineer", "systems-engineer"], supportingHatSlugs: [], relatedGroupIds: ["infrastructure-operations"], dependencies: ["web-application"] },
  { id: "brand-identity", name: "Brand identity architecture", aliases: ["brand", "identity", "logo", "visual", "language", "campaign"], outcomes: ["a coherent public identity and experience"], qualifiers: ["brand-led", "public-facing"], deliverables: ["identity direction", "visual language", "application system"], leadHatSlugs: ["identity-architect", "visual-language-engineer"], supportingHatSlugs: ["meaning-architect"], relatedGroupIds: ["brand-experience-systems"] },
  { id: "audio-media", name: "Audio and media-system design", aliases: ["audio", "sound", "music", "radio", "streaming", "broadcast", "recording", "media", "festival"], outcomes: ["reliable capture, production and distribution of media"], qualifiers: ["live", "streaming", "temporary"], deliverables: ["media workflow", "signal-flow design", "distribution plan"], leadHatSlugs: ["sound-systems-designer", "media-engineer", "live-systems-designer"], supportingHatSlugs: ["signal-flow-designer"], relatedGroupIds: ["media-asset-systems", "physical-technical-engineering"] },
  { id: "electronics-integration", name: "Electronics and physical-system integration", aliases: ["hardware", "electrical", "electronics", "pcb", "firmware", "embedded", "sensor", "installation"], outcomes: ["working hardware and software integration"], qualifiers: ["embedded", "physical", "prototype"], deliverables: ["technical architecture", "prototype or firmware build", "test and installation plan"], leadHatSlugs: ["electronics-engineer", "embedded-systems-engineer"], supportingHatSlugs: ["test-engineer", "systems-engineer"], relatedGroupIds: ["physical-technical-engineering"] },
];

const qualifierTerms = ["live", "temporary", "public-facing", "multi-user", "scalable", "embedded", "streaming", "physical", "brand-led", "prototype", "production-ready", "responsive", "interactive"];
const constraintTerms = ["budget", "deadline", "existing", "legacy", "secure", "accessible", "offline", "reliable"];

export function analyseServiceIntent(hats: PublicHat[], work: PublicWorkProjection[], query: string): ServiceConfiguration {
  const terms = getMeaningfulSearchTerms(query).filter((term) => term.length >= 3);
  const normalized = query.toLowerCase().replaceAll(/[^a-z0-9-]+/g, " ");
  const ranked = MODULES.map((module) => {
    const matched = module.aliases.filter((alias) => normalized.includes(alias));
    const qualifierMatches = module.qualifiers.filter((term) => normalized.includes(term));
    return { module, matched, qualifierMatches, score: matched.length * 12 + qualifierMatches.length * 5 };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.module.id.localeCompare(b.module.id));

  if (terms.length < 2 || !ranked.length) return {
    title: "More detail needed", summary: "Describe the outcome, the thing being made or changed, and any important operating constraints.",
    interpretedIntent: { outcomes: [], objects: terms, constraints: [], qualifiers: [] }, modules: [], deliveryPhases: [], leadHatSlugs: [], supportingHatSlugs: [], relevantWork: [],
    confidence: { level: "insufficient", explanation: "The enquiry does not yet identify a service route with enough specificity." },
  };

  const strongestScore = ranked[0]?.score ?? 0;
  const relevanceFloor = Math.max(5, Math.ceil(strongestScore * 0.35));
  const selected = ranked.filter(({ score }) => score >= relevanceFloor);
  const selectedIds = new Set(selected.map(({ module }) => module.id));
  for (const { module } of [...selected]) for (const dependency of module.dependencies ?? []) {
    if (!selectedIds.has(dependency)) { const found = MODULES.find((candidate) => candidate.id === dependency); if (found) { selected.push({ module: found, matched: [], qualifierMatches: [], score: 1 }); selectedIds.add(dependency); } }
  }
  const knownHatSlugs = new Set(hats.map((hat) => hat.slug));
  const leadHatSlugs = [...new Set(selected.flatMap(({ module }) => module.leadHatSlugs))].filter((slug) => knownHatSlugs.has(slug));
  const supportingHatSlugs = [...new Set(selected.flatMap(({ module }) => module.supportingHatSlugs))].filter((slug) => knownHatSlugs.has(slug) && !leadHatSlugs.includes(slug));
  const relevantWork = work.map((item) => {
    const overlap = selected.filter(({ module }) => module.relatedGroupIds.some((group) => item.capabilityGroupIds.includes(group)));
    const hatOverlap = item.appliedHatSlugs.filter((slug) => leadHatSlugs.includes(slug)).length;
    return { item, overlap, score: overlap.length * 25 + hatOverlap * 10 };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug))
    .map(({ item, overlap, score }) => ({ workSlug: item.slug, projectSlug: item.projectSlug, score, reason: `Proves ${overlap.map(({ module }) => module.name).join(" and ")}.` }));
  const qualifiers = qualifierTerms.filter((term) => normalized.includes(term));
  const constraints = constraintTerms.filter((term) => normalized.includes(term));
  const outcomes = [...new Set(selected.flatMap(({ module }) => module.outcomes))];
  const primaryNames = selected.slice(0, 2).map(({ module }) => module.name.replace(" and ", " & "));
  const level = selected.length >= 3 && terms.length >= 5 ? "strong" : "provisional";
  return {
    title: primaryNames.join(" + "),
    summary: `A combined engagement covering ${selected.map(({ module }) => module.name.toLowerCase()).join(", ")}.`,
    interpretedIntent: { outcomes, objects: terms.filter((term) => !qualifiers.includes(term) && !constraints.includes(term)), constraints, qualifiers },
    modules: selected.map(({ module, matched }, index) => ({ id: module.id, name: module.name, status: index < 2 ? "required" : matched.length ? "recommended" : "optional", reason: matched.length ? `Activated by ${matched.map((term) => `“${term}”`).join(", ")}.` : "Added as a delivery dependency.", deliverables: module.deliverables })),
    deliveryPhases: [
      { name: "Define", purpose: "Confirm outcomes, boundaries and system relationships.", moduleIds: selected.filter(({ module }) => module.id.includes("definition") || module.id.includes("brand")).map(({ module }) => module.id) },
      { name: "Build", purpose: "Create and integrate the required service components.", moduleIds: selected.filter(({ module }) => !module.id.includes("deployment")).map(({ module }) => module.id) },
      { name: "Deploy and operate", purpose: "Validate, release and document the live system.", moduleIds: selected.filter(({ module }) => module.id.includes("deployment") || module.id.includes("audio") || module.id.includes("electronics")).map(({ module }) => module.id) },
    ].filter((phase) => phase.moduleIds.length),
    leadHatSlugs, supportingHatSlugs, relevantWork,
    confidence: { level, explanation: level === "strong" ? "Several specific objects, outcomes or operating qualifiers activated a coherent module set." : "A useful initial route is available; constraints and operating context would sharpen it." },
  };
}
