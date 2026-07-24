import { getHatProfile, PROFILE_AXES, type HatProfile } from "@/system/profile/hat-profile";
import type { Hat } from "@/system/registry";
import { combineHatProfiles } from "@/system/services/polygon-engine";

export const PROFILE_AXIS_COLOURS = [
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#22d3ee",
] as const;

export const PROFILE_AXIS_MEANINGS = {
  Depth: "technical depth, specialist reasoning and engineering detail",
  Creativity: "creative synthesis, expression and design-led thinking",
  Scale: "platform reach, infrastructure and distributed-system thinking",
  Interaction: "live operation, user feedback and real-time behaviour",
  Structure: "process, repeatability, standards and dependable delivery",
  Influence: "communication, identity, reach and external impact",
} as const;

export type ProfileAxis = (typeof PROFILE_AXES)[number];
export type AttributeDominance = {
  primaryAxis: ProfileAxis;
  primaryScore: number;
  secondaryAxis: ProfileAxis;
  secondaryScore: number;
  coDominantAxes: ProfileAxis[];
  gap: number;
  confidence: "balanced" | "moderate" | "strong";
  colour: string;
  secondaryColour: string;
};

export function resolveDominantAxis(values: HatProfile): AttributeDominance {
  const ranked = PROFILE_AXES
    .map((axis, index) => ({ axis, score: values[index], index }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const [primary, secondary] = ranked;
  const gap = Number((primary.score - secondary.score).toFixed(2));
  const coDominantAxes = ranked
    .filter((candidate) => primary.score - candidate.score < 0.35)
    .map((candidate) => candidate.axis);
  return {
    primaryAxis: primary.axis,
    primaryScore: primary.score,
    secondaryAxis: secondary.axis,
    secondaryScore: secondary.score,
    coDominantAxes,
    gap,
    confidence: gap >= 0.75 ? "strong" : gap >= 0.35 ? "moderate" : "balanced",
    colour: PROFILE_AXIS_COLOURS[primary.index],
    secondaryColour: PROFILE_AXIS_COLOURS[secondary.index],
  };
}

export function resolveContextualHatDominance(hat: Hat, selectedHats: Hat[]): AttributeDominance {
  const intrinsic = getHatProfile(hat);
  if (selectedHats.length <= 1) return resolveDominantAxis(intrinsic);
  const stack = combineHatProfiles(selectedHats);
  const withoutHat = combineHatProfiles(selectedHats.filter((item) => item.id !== hat.id));
  const contextual = intrinsic.map((strength, axis) => Number((
    strength * 0.6 +
    stack[axis] * 0.25 +
    Math.max(0, strength - withoutHat[axis]) * 0.15
  ).toFixed(2))) as HatProfile;
  return resolveDominantAxis(contextual);
}

export function resolveContextualDominanceMap(selectedHats: Hat[]): Map<string, AttributeDominance> {
  if (!selectedHats.length) return new Map();
  const profiles = selectedHats.map((hat) => ({ hat, profile: getHatProfile(hat) }));
  const stack = combineHatProfiles(selectedHats);
  const axisStats = PROFILE_AXES.map((_, axis) => {
    const values = profiles.map(({ profile }) => profile[axis]).sort((a, b) => b - a);
    return {
      sum: values.reduce((total, value) => total + value, 0),
      largest: values[0] ?? 0,
      secondLargest: values[1] ?? 0,
      largestCount: values.filter((value) => value === values[0]).length,
    };
  });
  return new Map(profiles.map(({ hat, profile }) => {
    const contextual = profile.map((strength, axis) => {
      if (selectedHats.length === 1) return strength;
      const stats = axisStats[axis];
      const meanWithout = (stats.sum - strength) / (selectedHats.length - 1);
      const strongestWithout = strength === stats.largest && stats.largestCount === 1 ? stats.secondLargest : stats.largest;
      const combinedWithout = meanWithout * 0.78 + strongestWithout * 0.22;
      return Number((strength * 0.6 + stack[axis] * 0.25 + Math.max(0, strength - combinedWithout) * 0.15).toFixed(2));
    }) as HatProfile;
    return [hat.id, resolveDominantAxis(contextual)];
  }));
}

export function interpretHatProfile(values: HatProfile, selectedNames: string[]) {
  const ranked = PROFILE_AXES
    .map((axis, index) => ({ axis, value: values[index] }))
    .sort((left, right) => right.value - left.value);
  const primary = ranked[0];
  const secondary = ranked[1];
  const dominance = resolveDominantAxis(values);
  const axisList = dominance.coDominantAxes.length > 1
    ? dominance.coDominantAxes.slice(0, -1).join(", ") + ` and ${dominance.coDominantAxes.at(-1)}`
    : dominance.primaryAxis;
  const subject = selectedNames.length > 1
    ? `This ${selectedNames.length}-Hat combination`
    : selectedNames[0] ?? "This capability";
  const profileMode = selectedNames.length > 1
    ? `${subject}'s legacy visual profile provides its highest coverage through ${axisList}.`
    : dominance.coDominantAxes.length > 1
      ? `${subject}'s legacy visual profile is balanced across ${axisList}.`
      : `${subject}'s legacy visual profile places its highest value on ${axisList}.`;

  return {
    primary,
    secondary,
    summary: `${profileMode} The two highest axes currently describe ${PROFILE_AXIS_MEANINGS[primary.axis]} alongside ${PROFILE_AXIS_MEANINGS[secondary.axis]}. These values remain provisional visual orientation data, not a proficiency assessment.`,
  };
}
