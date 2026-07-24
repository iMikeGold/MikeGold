import type { Hat } from "@/system/registry";

export type RankedHat = { hat: Hat; score: number };
type RelatedHat = { hat: Hat; strength: number };

const CONCEPT_GROUPS = [
  ["audio", "sound", "mixing", "recording", "acoustic"],
  ["broadcast", "ob", "commentary", "isdn", "television", "radio"],
  ["pcb", "circuit", "schematic", "board", "electronics", "hardware"],
  ["embedded", "firmware", "microcontroller", "iot"],
  ["devops", "infrastructure", "server", "deployment", "platform", "cloud"],
  ["rf", "wireless", "frequency", "comms", "communication"],
  ["manufacturing", "production", "assembly", "smd", "smt", "quality"],
  ["research", "cognitive", "neuroscience", "perception", "behavioural"],
  ["design", "creative", "visual", "interface", "ux", "ui"],
  ["mobile", "app", "application", "software", "frontend", "backend"],
  ["web", "website", "frontend", "browser", "interface"],
  ["leadership", "director", "management", "operations", "mentoring"]
] as const;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokens = (value: string) => normalize(value).split(/\s+/).filter(Boolean);
const STOP_WORDS = new Set(["a", "an", "and", "for", "i", "make", "need", "the", "to", "want", "with", "build", "create", "help", "hat", "hats", "engineer", "engineering", "designer", "specialist"]);

export const getMeaningfulSearchTerms = (value: string) => tokens(value)
  .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));

function termFamily(term: string, semantic: boolean) {
  const registryAliases = new Set(["foh", "pcb", "rf", "ui", "ux"]);
  if (!semantic && !registryAliases.has(term)) return new Set([term]);
  const group = CONCEPT_GROUPS.find((candidate) => candidate.some((value) => value === term));
  return new Set(group ?? [term]);
}

const tokenMatches = (value: string, candidates: Set<string>) =>
  tokens(value).some((word) =>
    [...candidates].some((candidate) =>
      candidate.length >= 3 && (word === candidate || word.startsWith(candidate)),
    ),
  );

function fields(hat: Hat) {
  return {
    name: normalize(hat.name),
    primary: [
      hat.type,
      hat.category,
      ...(hat.tags.core ?? []),
      ...(hat.details?.capabilities ?? [])
    ].filter(Boolean).map(String).map(normalize),
    supporting: [
      ...(hat.tags.adjacent ?? []),
      ...(hat.tags.meta ?? []),
      hat.description,
      hat.details?.overview,
      ...(hat.details?.usedFor ?? [])
    ].filter(Boolean).map(String).map(normalize)
  };
}

export function searchHats(
  allHats: Hat[],
  query: string,
  options: { semantic?: boolean } = {},
): RankedHat[] {
  const semantic = options.semantic ?? false;
  const phrase = normalize(query);
  if (!phrase) return allHats.map((hat) => ({ hat, score: 0 }));

  const queryTerms = getMeaningfulSearchTerms(query);
  if (!queryTerms.length) return [];

  return allHats
    .map((hat) => {
      const index = fields(hat);
      let score = index.name === phrase ? 100 : index.name.includes(phrase) ? 50 : 0;

      let matchedTerms = 0;
      for (const term of queryTerms) {
        const family = termFamily(term, semantic);
        const nameMatch = tokenMatches(index.name, family);
        const primaryMatch = index.primary.some((value) => tokenMatches(value, family));
        const supportingMatch = index.supporting.some((value) => tokenMatches(value, family));
        if (nameMatch || primaryMatch || supportingMatch) matchedTerms++;
        if (nameMatch) score += 18;
        else if (primaryMatch) score += 8;
        else if (supportingMatch) score += 3;
      }
      const coverage = matchedTerms / queryTerms.length;
      return { hat, score: coverage >= (semantic ? 0.6 : 1) ? score * coverage : 0 };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.hat.name.localeCompare(b.hat.name));
}

export function findRelatedHats(
  source: Hat,
  allHats: Hat[],
  limit = 12
): RelatedHat[] {
  const explicit = new Map(
    (source.relationships ?? []).map((relationship) => [
      relationship.targetId,
      relationship.strength
    ])
  );

  return allHats
    .filter((hat) => hat.id !== source.id)
    .filter((hat) => explicit.has(hat.id))
    .map((hat) => ({ hat, strength: Number((explicit.get(hat.id) ?? 0).toFixed(2)) }))
    .filter(({ strength }) => strength > 0)
    .sort((a, b) => b.strength - a.strength || a.hat.name.localeCompare(b.hat.name))
    .slice(0, limit);
}

export function findRelatedHatsForSelection(
  selected: Hat[],
  allHats: Hat[],
  limit = 8,
): RelatedHat[] {
  if (!selected.length) return [];
  const selectedIds = new Set(selected.map((hat) => hat.id));
  const scores = new Map<string, { hat: Hat; strengths: number[] }>();
  for (const source of selected) {
    for (const related of findRelatedHats(source, allHats, allHats.length)) {
      if (selectedIds.has(related.hat.id)) continue;
      const current = scores.get(related.hat.id) ?? { hat: related.hat, strengths: [] };
      current.strengths.push(related.strength);
      scores.set(related.hat.id, current);
    }
  }
  return [...scores.values()]
    .map(({ hat, strengths }) => {
      const relationship = Math.max(...strengths) * 0.65 + (strengths.reduce((sum, value) => sum + value, 0) / strengths.length) * 0.2;
      return {
        hat,
        // Keep semantic relevance independent from legacy visual profiles.
        strength: Number(Math.max(0, relationship).toFixed(2)),
      };
    })
    .sort((a, b) => b.strength - a.strength || a.hat.name.localeCompare(b.hat.name))
    .slice(0, Math.min(limit, Math.max(3, 8 - Math.floor(selected.length / 3))));
}
