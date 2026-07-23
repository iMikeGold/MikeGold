import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import workSemanticProfiles from "../../../records/concepts/work-semantic-profiles.json";

export type ConceptKind =
  | "object" | "activity" | "outcome" | "environment" | "constraint"
  | "quality" | "deliverable" | "system-layer" | "medium" | "workflow";

export type SemanticConcept = {
  slug: string;
  label: string;
  definition: string;
  kind: ConceptKind;
  phrases: string[];
  related?: string[];
  language?: { scope?: string; outcome?: string };
};

export type SemanticSignature = {
  concepts: string[];
  source: "authored" | "derived";
};

const concept = (
  slug: string,
  label: string,
  kind: ConceptKind,
  phrases: string[],
  definition: string,
  related: string[] = [],
  language?: SemanticConcept["language"],
): SemanticConcept => ({ slug, label, kind, phrases, definition, related, language });

export const SEMANTIC_CONCEPTS: SemanticConcept[] = [
  concept("field-communications", "Field communications", "object", ["field communications", "pitch communications", "pitch-side communications", "sideline communications", "comms"], "Communications systems used by teams operating within a live field environment.", ["communications-networking", "live-field-operations", "signal-path-resilience"], { scope: "field communications", outcome: "maintain dependable field communications" }),
  concept("communications-networking", "Communications networking", "system-layer", ["communications network", "telecom", "networked communications"], "Connected paths and endpoints that carry operational communications.", ["field-communications", "systems-integration"]),
  concept("signal-path-resilience", "Signal-path resilience", "quality", ["resilient signal paths", "signal redundancy", "telecom redundancy", "backup signal route", "failover"], "Maintaining dependable signal delivery through planned redundancy, routing and failure tolerance.", ["reliability-engineering", "signal-flow-design"], { scope: "resilient primary and fallback signal paths", outcome: "maintain dependable signal delivery" }),
  concept("signal-flow-design", "Signal-flow design", "activity", ["signal flow", "signal routing", "audio routing", "routing"], "Defining how signals travel between sources, processing stages and destinations.", ["signal-path-resilience", "broadcast-audio-delivery"]),
  concept("broadcast-audio-delivery", "Broadcast-audio delivery", "workflow", ["broadcast audio", "broadcast-audio", "programme audio", "program audio", "radio broadcast"], "Routing and delivering live programme audio into a broadcast workflow and audience output.", ["media-distribution", "signal-flow-design", "live-broadcast"], { scope: "broadcast-audio routing and delivery", outcome: "deliver continuous programme audio into the broadcast workflow" }),
  concept("media-distribution", "Media distribution", "workflow", ["media distribution", "content delivery", "playout", "publishing"], "Carrying prepared media through a delivery workflow to an audience.", ["broadcast-audio-delivery"]),
  concept("live-field-operations", "Live field operations", "environment", ["field operations", "live field", "pitch-side", "sideline", "stadium"], "Time-critical technical operation within a live sporting field environment.", ["live-sport", "field-communications"]),
  concept("live-sport", "Live sport", "environment", ["sport", "sports", "nfl", "football game", "match"], "A live sporting production or operational environment.", ["live-field-operations", "live-broadcast"]),
  concept("live-broadcast", "Live broadcast", "environment", ["live broadcast", "broadcast channel", "outside broadcast", "ob"], "A time-critical media workflow producing a live audience output.", ["broadcast-audio-delivery", "live-sport"]),
  concept("reliability-engineering", "Reliability engineering", "quality", ["reliability", "resilience", "redundancy", "high availability", "fail-safe"], "Designing for continuity, fault tolerance and dependable operation.", ["signal-path-resilience", "testing-commissioning"]),
  concept("systems-integration", "Systems integration", "activity", ["system integration", "systems integration", "technical integration", "hardware software integration"], "Connecting distinct components and responsibilities into one functioning system.", ["testing-commissioning", "communications-networking"]),
  concept("testing-commissioning", "Testing and commissioning", "activity", ["testing", "commissioning", "validation", "system test"], "Verifying an integrated system before operational use.", ["systems-integration", "reliability-engineering"]),
  concept("audio-production", "Audio production", "activity", ["recording", "mixing", "audio production", "sound design"], "Creating or transforming audio as media.", ["broadcast-audio-delivery", "media-distribution"]),
  concept("web-application", "Web application", "object", ["website", "web app", "web application", "frontend", "interface"], "Executable browser-based digital behaviour.", ["software-engineering"]),
  concept("software-engineering", "Software engineering", "activity", ["software", "backend", "api", "application", "code"], "Designing and building executable digital systems.", ["web-application", "data-systems"]),
  concept("data-systems", "Data systems", "system-layer", ["data system", "database", "data model", "information system"], "Structured models and operations for storing, interpreting and presenting information.", ["software-engineering", "product-definition"]),
  concept("product-definition", "Product and system definition", "activity", ["product definition", "system definition", "requirements", "service architecture"], "Defining a system's purpose, boundaries, model and intended operation.", ["data-systems"]),
  concept("cloud-operations", "Cloud deployment and operations", "system-layer", ["cloud", "hosting", "deployment", "server", "ci/cd"], "The runtime and release environment sustaining a live digital service.", ["software-engineering"]),
  concept("identity-systems", "Identity systems", "object", ["brand", "identity", "logo", "visual language"], "A coherent system by which an organisation or product is recognised.", []),
  concept("physical-audio-systems", "Physical audio systems", "object", ["sound system", "audio system", "loudspeaker", "mixing desk", "audio installation"], "Installed equipment and physical signal paths used to reproduce or control sound.", ["signal-flow-design", "systems-integration"]),
  concept("electronics-integration", "Electronics integration", "activity", ["electronics", "pcb", "firmware", "embedded", "sensor", "hardware"], "Integrating electronic hardware and embedded control into a working physical system.", ["systems-integration", "testing-commissioning"]),
];

export const CONCEPT_BY_SLUG = new Map(SEMANTIC_CONCEPTS.map((item) => [item.slug, item]));

const AUTHORED_WORK_CONCEPTS: Record<string, string[]> = workSemanticProfiles.profiles;

const normalise = (value: string) => ` ${value.toLowerCase().replaceAll(/[^a-z0-9]+/g, " ").trim()} `;
const phraseMatches = (text: string, phrase: string) => normalise(text).includes(` ${normalise(phrase).trim()} `);

export function expandConcepts(slugs: Iterable<string>, depth = 1): Set<string> {
  const expanded = new Set(slugs);
  let frontier = [...expanded];
  for (let step = 0; step < depth; step++) {
    const next = frontier.flatMap((slug) => CONCEPT_BY_SLUG.get(slug)?.related ?? []).filter((slug) => !expanded.has(slug));
    next.forEach((slug) => expanded.add(slug));
    frontier = next;
  }
  return expanded;
}

export function interpretConcepts(input: string) {
  const direct = SEMANTIC_CONCEPTS
    .map((item) => ({ item, matches: item.phrases.filter((phrase) => phraseMatches(input, phrase)) }))
    .filter(({ matches }) => matches.length)
    .sort((a, b) => Math.max(...b.matches.map((value) => value.length)) - Math.max(...a.matches.map((value) => value.length)));
  return { direct, expanded: expandConcepts(direct.map(({ item }) => item.slug)) };
}

export function workSemanticSignature(work: PublicWorkProjection): SemanticSignature {
  const authored = AUTHORED_WORK_CONCEPTS[work.slug];
  if (authored) return { concepts: authored, source: "authored" };
  const text = `${work.title} ${work.summary} ${work.lensAssignments.map((item) => `${item.rationale} ${item.lensSummary ?? ""}`).join(" ")}`;
  return {
    concepts: SEMANTIC_CONCEPTS.filter((item) => item.phrases.some((phrase) => phraseMatches(text, phrase))).map((item) => item.slug),
    source: "derived",
  };
}

export function hatSemanticConcepts(hat: PublicHat): Set<string> {
  const text = [
    hat.name, hat.type, hat.category, hat.description,
    ...hat.tags.core, ...hat.tags.adjacent, ...(hat.tags.meta ?? []),
    hat.details?.overview, ...(hat.details?.capabilities ?? []), ...(hat.details?.usedFor ?? []),
  ].filter(Boolean).join(" ");
  return expandConcepts(SEMANTIC_CONCEPTS.filter((item) => item.phrases.some((phrase) => phraseMatches(text, phrase))).map((item) => item.slug));
}
