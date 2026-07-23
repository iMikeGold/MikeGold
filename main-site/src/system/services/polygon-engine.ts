import type { Hat } from "@/system/registry";
import {
  getHatProfile,
  type HatProfile
} from "@/system/profile/hat-profile";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Combines Hat vectors without flattening them into an average.
 *
 * The selection is a weighted blend, not an accumulating total. Adding a Hat
 * can raise or lower an axis, so the polygon changes direction and shape rather
 * than merely growing toward a circle.
 */
export function combineHatProfiles(selectedHats: Hat[]): HatProfile {
  if (selectedHats.length === 0) return [0, 0, 0, 0, 0, 0];
  if (selectedHats.length === 1) return getHatProfile(selectedHats[0]);

  const profiles = selectedHats.map(getHatProfile);

  return profiles[0].map((_, axis) => {
    const values = profiles.map((profile) => profile[axis] / 10);
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const strongest = Math.max(...values);
    return Number((clamp01(mean * 0.78 + strongest * 0.22) * 10).toFixed(2));
  }) as HatProfile;
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

/** Deterministic language composition from the complete selection. */
export function composeCombinedHatDescription(selectedHats: Hat[]) {
  if (!selectedHats.length) return "";
  if (selectedHats.length === 1) return selectedHats[0].description ?? selectedHats[0].details?.overview ?? "";
  const capabilities = unique(selectedHats.flatMap((hat) => hat.details?.capabilities ?? [])).slice(0, 6);
  const uses = unique(selectedHats.flatMap((hat) => hat.details?.usedFor ?? [])).slice(0, 4);
  const names = selectedHats.map((hat) => hat.name);
  const namePhrase = names.length > 2
    ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
    : names.join(" and ");
  const capabilityPhrase = capabilities.length
    ? ` Together they cover ${capabilities.join(", ")}.`
    : "";
  const usePhrase = uses.length
    ? ` This configuration is suited to ${uses.join(", ")}.`
    : "";
  return `This configuration combines ${namePhrase}.${capabilityPhrase}${usePhrase}`;
}
