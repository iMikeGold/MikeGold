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
