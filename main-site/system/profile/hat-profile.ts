///////////////////////////////////////////////////////////////
// iD Gravity Core — Hat Profile Engine
// version: g01dn
// module: system/profile/hat-profile.ts
//
// PURPOSE:
// Converts a Hat (tags + structure + weight metadata)
// into a deterministic 6-axis cognitive profile (0–10)
//
// RULES:
// - No UI logic
// - No geometry logic
// - No randomness
// - Output must be stable + reproducible
///////////////////////////////////////////////////////////////

type Hat = {
  id?: string;
  name?: string;
  description?: string;

  category?: string;
  type?: string;

  tags?: {
    core?: string[];
    adjacent?: string[];
    meta?: string[];
  };

  weight?: {
    base?: number;
    experience?: number;
    rarity?: number;
  };
};

/**
 * 6-axis output (fixed order forever)
 */
export type HatProfile = [
  number, // Depth
  number, // Creativity
  number, // Scale
  number, // Interaction
  number, // Structure
  number  // Influence
];

const clamp10 = (n: number) => Math.max(0, Math.min(10, n));

/**
 * Safe extractor for tag groups
 */
function getTags(hat: Hat) {
  return {
    core: hat?.tags?.core ?? [],
    adjacent: hat?.tags?.adjacent ?? [],
    meta: hat?.tags?.meta ?? []
  };
}

/**
 * Weight system (core logic of meaning strength)
 */
const WEIGHT = {
  core: 1.0,
  adjacent: 0.6,
  meta: 0.3
};

/**
 * Axis keyword maps
 * These define how meaning flows into structure
 */
const AXIS_MAPS = {
  Depth: [
    "engineering",
    "system",
    "logic",
    "architecture",
    "core",
    "analysis",
    "signal"
  ],

  Creativity: [
    "creative",
    "design",
    "audio",
    "visual",
    "art",
    "expression",
    "aesthetic"
  ],

  Scale: [
    "systems",
    "infrastructure",
    "platform",
    "distributed",
    "global",
    "network"
  ],

  Interaction: [
    "live",
    "real-time",
    "performance",
    "event",
    "user",
    "interface",
    "feedback"
  ],

  Structure: [
    "framework",
    "process",
    "workflow",
    "standard",
    "pipeline",
    "logic-chain"
  ],

  Influence: [
    "brand",
    "marketing",
    "identity",
    "communication",
    "impact",
    "reach",
    "signal"
  ]
};

/**
 * Score a single axis
 */
function scoreAxis(hat: Hat, keywords: string[]): number {
  const tags = getTags(hat);

  let score = 0;
  let count = 0;

  const scan = (list: string[], weight: number) => {
    for (const tag of list) {
      for (const key of keywords) {
        if (tag.toLowerCase().includes(key)) {
          score += weight;
          count++;
        }
      }
    }
  };

  scan(tags.core, WEIGHT.core);
  scan(tags.adjacent, WEIGHT.adjacent);
  scan(tags.meta, WEIGHT.meta);

  if (count === 0) return 3; // baseline neutral presence

  // normalize into 0–10
  return clamp10((score / count) * 10);
}

/**
 * MAIN EXPORT
 * Hat → 6D profile vector
 */
export function getHatProfile(hat: Hat): HatProfile {
  const depth = scoreAxis(hat, AXIS_MAPS.Depth);
  const creativity = scoreAxis(hat, AXIS_MAPS.Creativity);
  const scale = scoreAxis(hat, AXIS_MAPS.Scale);
  const interaction = scoreAxis(hat, AXIS_MAPS.Interaction);
  const structure = scoreAxis(hat, AXIS_MAPS.Structure);
  const influence = scoreAxis(hat, AXIS_MAPS.Influence);

  return [
    clamp10(depth),
    clamp10(creativity),
    clamp10(scale),
    clamp10(interaction),
    clamp10(structure),
    clamp10(influence)
  ];
}