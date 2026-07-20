# Cognitive engine services

`system/registry.ts` is the canonical, manually editable Hat catalogue. It owns
Hat identity, copy, tags, evidence metadata, weights, and explicit graph edges.
It does not calculate UI output.

`profile/hat-profile.ts` converts one Hat's structured metadata into the fixed
six-axis polygon profile. Axis order is exported as `PROFILE_AXES`.

`weights.ts` owns the documented Gravity weight formula.

`polygon-engine.ts` owns deterministic multi-Hat combination. Combination uses
a strongest-signal anchor, diminishing supporting evidence, and a bounded
overlap bonus; it is intentionally not a simple average.

`service-engine.ts` owns ranked concept search and related-Hat calculation.
Search expands a small, transparent engineering vocabulary and scores names,
core metadata, and descriptive evidence at different strengths. Related Hats
blend explicit registry edges with shared vocabulary and taxonomy affinity.

The UI may select inputs and render outputs, but must not define fallback
scores, search rules, graph maths, or weight formulas.
