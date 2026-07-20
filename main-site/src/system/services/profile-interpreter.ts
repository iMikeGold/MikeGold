import { PROFILE_AXES, type HatProfile } from "@/system/profile/hat-profile";

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

export function interpretHatProfile(values: HatProfile, selectedNames: string[]) {
  const ranked = PROFILE_AXES
    .map((axis, index) => ({ axis, value: values[index] }))
    .sort((left, right) => right.value - left.value);
  const primary = ranked[0];
  const secondary = ranked[1];
  const spread = primary.value - ranked[ranked.length - 1].value;
  const balance = spread < 2 ? "balanced across the six dimensions" : `led by ${primary.axis.toLowerCase()}`;
  const subject = selectedNames.length > 1
    ? `This ${selectedNames.length}-Hat combination`
    : selectedNames[0] ?? "This capability";

  return {
    primary,
    secondary,
    summary: `${subject} is ${balance}. Its strongest relationship combines ${PROFILE_AXIS_MEANINGS[primary.axis]} with ${PROFILE_AXIS_MEANINGS[secondary.axis]}.`,
  };
}
