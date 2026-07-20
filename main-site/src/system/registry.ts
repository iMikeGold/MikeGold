// iD Gravity public compatibility registry.
// Canonical private Hat records live in records/hats and are projected at build
// time. This module intentionally contains no internal record UUIDs.

import { publicHats } from "@/system/generated/public-hats.generated";

export type { PublicHat as Hat } from "@/system/hats/hat.types";

export const GRAVITY_META = {
  version: "3.0",
  schema: "iD-Gravity-Core",
  scale: "0–1 Normalized",
  weight_model: {
    base: "Inherent importance / core value",
    experience: "Capability depth / mastery potential",
    rarity: "Scarcity / uniqueness factor",
    formula:
      "finalWeight = (base * 0.5) + (experience * 0.3) + (rarity * 0.2)",
  },
  relationship_rules: {
    dependency: "Directional → Required upstream condition",
    supports: "Directional → Enhances but not required",
    overlap: "Bidirectional → Shared capability space",
    adjacent: "Bidirectional → Conceptual proximity only",
  },
  taxonomy: {
    categories: ["creative", "design", "engineering"],
    types: ["audio", "visual", "interface", "web", "systems", "software"],
  },
} as const;

export const hats = publicHats;
