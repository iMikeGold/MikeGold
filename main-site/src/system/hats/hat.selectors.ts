import type { PublicHat } from "@/system/hats/hat.types";

export function getPublicHatBySlug(
  hats: readonly PublicHat[],
  slug: string,
): PublicHat | null {
  return hats.find((hat) => hat.slug === slug) ?? null;
}

export function getPublicHatsByCategory(
  hats: readonly PublicHat[],
  category: PublicHat["category"],
): PublicHat[] {
  return hats.filter((hat) => hat.category === category);
}
