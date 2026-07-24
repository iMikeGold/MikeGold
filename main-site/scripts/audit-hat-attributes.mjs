import { readFileSync, readdirSync } from "node:fs";

const recordsRoot = new URL("../records/hats/", import.meta.url);
const axes = ["Depth", "Creativity", "Scale", "Interaction", "Structure", "Influence"];
const axisMaps = {
  Depth: ["engineering", "system", "logic", "architecture", "core", "analysis", "signal"],
  Creativity: ["creative", "design", "audio", "visual", "art", "expression", "aesthetic"],
  Scale: ["systems", "infrastructure", "platform", "distributed", "global", "network"],
  Interaction: ["live", "real-time", "performance", "event", "user", "interface", "feedback"],
  Structure: ["framework", "process", "workflow", "standard", "pipeline", "logic-chain"],
  Influence: ["brand", "marketing", "identity", "communication", "impact", "reach", "signal"],
};
const tagWeights = { core: 1, adjacent: 0.6, meta: 0.3 };
const clamp10 = (value) => Math.max(0, Math.min(10, value));
const round = (value, precision = 4) => Number(value.toFixed(precision));

const hats = readdirSync(recordsRoot)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(new URL(name, recordsRoot), "utf8")))
  .sort((left, right) => left.slug.localeCompare(right.slug));

const calculateWeight = (hat) => {
  const { base = 0, experience = 0, rarity = 0 } = hat.weight ?? {};
  return Math.max(0, Math.min(1, base * 0.5 + experience * 0.3 + rarity * 0.2));
};

function scoreAxisEvidence(hat, keywords) {
  let score = 0;
  let count = 0;
  for (const [group, weight] of Object.entries(tagWeights)) {
    for (const tag of hat.tags?.[group] ?? []) {
      for (const keyword of keywords) {
        if (tag.toLowerCase().includes(keyword)) {
          score += weight;
          count += 1;
        }
      }
    }
  }
  const searchable = [
    hat.name,
    hat.type,
    hat.category,
    hat.description,
    hat.details?.overview,
  ].filter(Boolean).join(" ").toLowerCase();
  for (const keyword of keywords) {
    if (searchable.includes(keyword)) {
      score += 0.8;
      count += 1;
    }
  }
  const evidence = count === 0 ? 0.08 : Math.min(1, score / Math.max(1, count));
  return evidence;
}

function scoreAxis(hat, keywords) {
  const evidence = scoreAxisEvidence(hat, keywords);
  return clamp10((evidence * 0.76 + calculateWeight(hat) * 0.24) * 10);
}

const profiles = hats.map((hat) => ({
  slug: hat.slug,
  name: hat.name,
  category: hat.category,
  weight: round(calculateWeight(hat), 3),
  vector: axes.map((axis) => round(scoreAxis(hat, axisMaps[axis]), 3)),
  vectorWithoutGeneralWeight: axes.map((axis) => round(scoreAxisEvidence(hat, axisMaps[axis]) * 10, 3)),
}));

for (const profile of profiles) {
  profile.generalWeightDelta = profile.vector.map((value, index) =>
    round(value - profile.vectorWithoutGeneralWeight[index], 3));
}

const vectorKey = (vector) => vector.map((value) => value.toFixed(3)).join("|");
const exactGroups = new Map();
for (const profile of profiles) {
  const key = vectorKey(profile.vector);
  exactGroups.set(key, [...(exactGroups.get(key) ?? []), profile.slug]);
}

const valueFrequency = new Map();
for (const { vector } of profiles) {
  for (const value of vector) {
    const key = value.toFixed(3);
    valueFrequency.set(key, (valueFrequency.get(key) ?? 0) + 1);
  }
}

const familyStats = Object.fromEntries(["creative", "design", "engineering"].map((category) => {
  const members = profiles.filter((profile) => profile.category === category);
  const axisAverages = axes.map((_, index) =>
    round(members.reduce((sum, profile) => sum + profile.vector[index], 0) / members.length, 3));
  return [category, {
    count: members.length,
    displayedHouseScore: round(members.reduce((sum, profile) => sum + profile.weight, 0) / members.length, 3),
    axisAverages,
  }];
}));

const axisStats = Object.fromEntries(axes.map((axis, index) => {
  const values = profiles.map((profile) => profile.vector[index]);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return [axis, {
    mean: round(mean, 3),
    variance: round(variance, 3),
    minimum: round(Math.min(...values), 3),
    maximum: round(Math.max(...values), 3),
  }];
}));

const nearDuplicatePairs = [];
for (let left = 0; left < profiles.length; left += 1) {
  for (let right = left + 1; right < profiles.length; right += 1) {
    const distance = Math.sqrt(
      profiles[left].vector.reduce(
        (sum, value, index) => sum + (value - profiles[right].vector[index]) ** 2,
        0,
      ),
    );
    if (distance <= 0.35) {
      nearDuplicatePairs.push({
        left: profiles[left].slug,
        right: profiles[right].slug,
        distance: round(distance, 3),
      });
    }
  }
}

const report = {
  hats: profiles.length,
  provenance: {
    individuallyAuthoredVectors: 0,
    runtimeKeywordDerivedVectors: profiles.length,
    storedProfileProvenanceFields: 0,
    storedAxisExplanations: 0,
  },
  uniqueVectors: exactGroups.size,
  exactDuplicateGroups: [...exactGroups.entries()]
    .filter(([, slugs]) => slugs.length > 1)
    .map(([vector, slugs]) => ({ vector, count: slugs.length, slugs }))
    .sort((left, right) => right.count - left.count || left.vector.localeCompare(right.vector)),
  nearDuplicatePairs: nearDuplicatePairs
    .sort((left, right) => left.distance - right.distance || left.left.localeCompare(right.left)),
  mostFrequentValues: [...valueFrequency.entries()]
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((left, right) => right.count - left.count || right.value - left.value)
    .slice(0, 20),
  familyStats,
  axisStats,
  profiles,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
