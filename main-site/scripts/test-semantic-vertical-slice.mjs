import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = JSON.parse(await readFile(new URL("../records/concepts/work-semantic-profiles.json", import.meta.url), "utf8"));
const profiles = source.profiles;
const queryConcepts = new Set([
  "field-communications",
  "signal-path-resilience",
  "broadcast-audio-delivery",
  "live-field-operations",
]);

const renamedFixtures = [
  {
    slug: "philadelphia-eagles-nfl-wembley-field-communications-and-resilient-signal-systems",
    title: "Unrelated fixture alpha",
    summary: "Display wording deliberately contains no retrieval terminology."
  },
  {
    slug: "philadelphia-eagles-nfl-wembley-broadcast-audio-delivery",
    title: "Unrelated fixture beta",
    summary: "Display wording deliberately contains no retrieval terminology."
  },
  {
    slug: "houston-texans-london-game-field-communications-and-telecom-redundancy-systems",
    title: "Unrelated fixture gamma",
    summary: "Display wording deliberately contains no retrieval terminology."
  }
];

const ranked = renamedFixtures
  .map((fixture) => ({
    slug: fixture.slug,
    matches: (profiles[fixture.slug] ?? []).filter((concept) => queryConcepts.has(concept)),
  }))
  .filter((result) => result.matches.length)
  .sort((left, right) => right.matches.length - left.matches.length);

assert.equal(ranked.length, 3, "All three NFL contributions must survive title and summary replacement.");
assert.deepEqual(
  ranked.slice(0, 2).map((result) => result.slug).sort(),
  [
    "houston-texans-london-game-field-communications-and-telecom-redundancy-systems",
    "philadelphia-eagles-nfl-wembley-field-communications-and-resilient-signal-systems",
  ].sort(),
  "The field-communications contributions must retain the strongest concept coverage."
);
assert.ok(
  ranked.some((result) =>
    result.slug === "philadelphia-eagles-nfl-wembley-broadcast-audio-delivery" &&
    result.matches.includes("broadcast-audio-delivery")
  ),
  "Philadelphia broadcast-audio proof must be retrieved through its authored concept link."
);

console.log(JSON.stringify({ query: "field communications and broadcast-audio systems", renamedTitleInvariant: "passed", ranked }, null, 2));
