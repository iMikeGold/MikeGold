import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const audit = JSON.parse(execFileSync(process.execPath, [
  new URL("audit-hat-attributes.mjs", import.meta.url).pathname,
], { encoding: "utf8" }));
const semantic = JSON.parse(readFileSync(new URL("records/concepts/hat-semantic-profiles.json", root), "utf8"));
const claims = JSON.parse(readFileSync(new URL("records/claims/service-engine-vertical-slice.json", root), "utf8"));
const axes = ["Depth", "Creativity", "Scale", "Interaction", "Structure", "Influence"];

const claimIdsByHat = new Map();
for (const claim of claims.claims ?? []) {
  for (const assignment of claim.hatAssignments ?? []) {
    const current = claimIdsByHat.get(assignment.hatSlug) ?? [];
    current.push(claim.id);
    claimIdsByHat.set(assignment.hatSlug, current);
  }
}

const coverageText = (slug) => {
  const coverage = semantic.profiles?.[slug]?.coverage;
  if (!coverage) return "No authored tiered profile";
  return ["direct", "core", "supporting", "contextual"]
    .flatMap((tier) => (coverage[tier] ?? []).map((concept) => `${tier}:${concept}`))
    .join("; ") || "Authored profile has no concepts";
};
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const warning = [
  "# Hat Capability Ledger — current-state audit",
  "",
  "> **Not canonical capability truth.** Every six-axis vector below is a legacy runtime derivation from Hat prose/tags plus a 24% general-weight blend. No Hat currently has an individually authored orientation, axis provenance, personal attainment record, credential record, or recognition record.",
  "",
  `Generated from ${audit.hats} Hat records. Use this ledger to review and replace the legacy inputs, not to validate them.`,
  "",
  "| Hat | Family | Depth | Creativity | Scale | Interaction | Structure | Influence | Semantic coverage | Confirmed claim IDs | Review |",
  "|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|",
];

const rows = ["hat_id,name,family,depth,creativity,scale,interaction,structure,influence,orientation_provenance,semantic_coverage,personal_proficiency,assessment_confidence,credentials,recognition,confirmed_claim_ids,review_status"];
for (const profile of audit.profiles) {
  const coverage = coverageText(profile.slug);
  const claimIds = (claimIdsByHat.get(profile.slug) ?? []).sort();
  warning.push(`| ${profile.name} | ${profile.category} | ${profile.vector.join(" | ")} | ${coverage} | ${claimIds.join(", ") || "None"} | Required |`);
  rows.push([
    profile.slug,
    profile.name,
    profile.category,
    ...profile.vector,
    "runtime-keyword-derived-legacy",
    coverage,
    "not modelled",
    "unverified",
    "not modelled",
    "not modelled",
    claimIds.join("; "),
    "required",
  ].map(csv).join(","));
}

mkdirSync(new URL("docs/generated/", root), { recursive: true });
mkdirSync(new URL("generated/", root), { recursive: true });
writeFileSync(new URL("docs/generated/HAT-CAPABILITY-LEDGER.md", root), `${warning.join("\n")}\n`);
writeFileSync(new URL("generated/hat-capability-ledger.csv", root), `${rows.join("\n")}\n`);
process.stdout.write(`Generated ${audit.hats} legacy-profile ledger rows across ${axes.length} axes.\n`);
