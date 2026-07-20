import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import { getMeaningfulSearchTerms, searchHats } from "@/system/services/service-engine";

export type ServiceIntentAnalysis = {
  terms: string[];
  hats: ReturnType<typeof searchHats>;
  work: { item: PublicWorkProjection; score: number; reason: "direct" | "capability" }[];
  confidence: "insufficient" | "possible" | "strong";
};

const words = (value: string) =>
  value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export function analyseServiceIntent(
  hats: PublicHat[],
  work: PublicWorkProjection[],
  query: string,
): ServiceIntentAnalysis {
  const terms = getMeaningfulSearchTerms(query).filter((term) => term.length >= 3);
  if (!terms.length) return { terms, hats: [], work: [], confidence: "insufficient" };

  const rankedHats = searchHats(hats, query, { semantic: true }).slice(0, 6);
  const strongestHatSlugs = new Set(rankedHats.slice(0, 4).map(({ hat }) => hat.slug));
  const rankedWork = work
    .map((item) => {
      const searchableWords = words(`${item.title} ${item.summary}`);
      const direct = terms.every((term) => searchableWords.some((word) => word.startsWith(term)));
      const connectedHatCount = item.appliedHatSlugs.filter((slug) => strongestHatSlugs.has(slug)).length;
      if (!direct && connectedHatCount < 2) return null;
      return {
        item,
        score: (direct ? 20 : 0) + connectedHatCount * 8,
        reason: direct ? "direct" as const : "capability" as const,
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  return {
    terms,
    hats: rankedHats,
    work: rankedWork,
    confidence: rankedHats.length >= 3 ? "strong" : rankedHats.length ? "possible" : "insufficient",
  };
}
