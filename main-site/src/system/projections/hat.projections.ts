import "server-only";

import type {
  InternalHatRecord,
  PublicHat,
} from "@/system/hats/hat.types";

export function createPublicHatProjection(
  hat: InternalHatRecord,
  allHats: readonly InternalHatRecord[],
): PublicHat {
  const byId = new Map(allHats.map((candidate) => [candidate.id, candidate]));

  return {
    id: hat.legacyKey,
    slug: hat.slug,
    name: hat.name,
    category: hat.category,
    type: hat.type,
    ...(hat.description ? { description: hat.description } : {}),
    tags: hat.tags,
    ...(hat.weight ? { weight: hat.weight } : {}),
    ...(hat.relationships?.length
      ? {
          relationships: hat.relationships.map((relationship) => {
            const target = byId.get(relationship.targetId);
            if (!target) {
              throw new Error(
                `Cannot publicly project unresolved Hat relationship ${relationship.targetId}.`,
              );
            }
            return {
              targetId: target.slug,
              type: relationship.type,
              strength: relationship.strength,
            };
          }),
        }
      : {}),
    ...(hat.details ? { details: hat.details } : {}),
  };
}
