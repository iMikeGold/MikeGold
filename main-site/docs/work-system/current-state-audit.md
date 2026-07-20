# Mike Gold Work System: Current-State Audit

Audit date: 2026-07-20  
Application root: `main-site/`  
Scope: Hat identity, relationships, polygon/profile consumers, Projects content,
route structure, and build configuration.

## Baseline

The application currently uses the Next.js App Router without a `src/`
directory. It is configured as a static export in `next.config.ts`.

At the time of this audit, the application code is organised as:

```text
app/          routes and layouts
components/   Hat Registry, drawer, polygon, interactions, and shared UI
system/       canonical Hat catalogue and capability calculations
public/       public assets
```

The repository already has unrelated uncommitted changes. Migration work must
not discard, reset, stage, commit, or otherwise rewrite those changes merely to
obtain a clean worktree.

## Canonical Hat source

`system/registry.ts` is the canonical, manually maintained Hat catalogue.

Current catalogue facts:

- 105 Hat records are loaded.
- 42 Hats are categorised as `creative`.
- 9 Hats are categorised as `design`.
- 54 Hats are categorised as `engineering`.
- 73 explicit Hat-to-Hat relationships are declared.
- No duplicate Hat keys were found.
- No duplicate Hat names were found.
- No relationship targets are missing.

The wider figure of 133 means the currently recognised capability set. The
105 figure means records presently defined and loaded. They must remain
separate concepts, and the Hat catalogue must remain open-ended.

## Existing identity mechanism

The current `Hat.id` is a semantic key such as `audio-engineer`. It currently
acts as all of the following:

1. Canonical record identity.
2. Relationship target.
3. Client-side selection key.
4. React rendering key.
5. Drawer and related-Hat navigation key.

It is not a UUID. There is no distinct `slug`, `legacyKey`, `schemaVersion`,
record lifecycle, or visibility field.

The durable model must separate:

```text
UUID       permanent private record identity
legacyKey historical reference to the current semantic ID
slug       public web and browser interaction identity
```

UUIDs must not be generated at runtime and must not be serialised into the
public static application.

## Hat consumers

The current dependency path is:

```text
system/registry.ts
├── components/HatRegistry.tsx
├── system/profile/hat-profile.ts
├── system/services/service-engine.ts
├── system/services/polygon-engine.ts
└── system/services/weights.ts
```

`components/HatRegistry.tsx` is a client component and imports the raw Hat
catalogue. It uses `hat.id` for selected-Hat state, active-Hat state, flipped
tiles, React keys, interaction overlays, and related-Hat navigation.

`system/services/service-engine.ts` uses semantic Hat IDs to resolve the 73
declared relationship targets. Search results return complete Hat objects.

`system/profile/hat-profile.ts` calculates a stable six-axis profile from Hat
tags and weight metadata. It does not rely on Hat identity or catalogue order.

`system/services/polygon-engine.ts` combines profile arrays. It does not use
Hat identity to calculate geometry.

`components/Polygon/HatRadar.tsx` renders six numeric axes. Its numeric React
keys identify fixed axes rather than Hats and are not an identity migration
problem.

No meaningful Hat behaviour was found to depend on a Hat's array position.

## Public/private projection boundary

Because the application is a static export and the Hat Registry is a client
component, adding UUIDs directly to the currently imported Hat objects would
place those UUIDs in browser JavaScript.

The required boundary is therefore:

```text
private canonical Hat records
        ↓ build-time relationship resolution
explicit public Hat projections
        ↓
static pages and client components
```

Public Hat projections may include public descriptions, categories, tags,
profile data, and relationships expressed as public slugs. They must not be
constructed by spreading an internal object and deleting selected fields.

## Projects page

`app/projects/page.tsx` is a client component with all content hard-coded in
the module. It contains:

- Two illustrative System Work cards.
- Twenty immediately loaded YouTube iframes.
- Two reference links.
- No Project records.
- No Work records.
- No Evidence records.
- No status, period, visibility, attribution, or contribution model.
- No relationship with the Hat catalogue.

The video and link collections use array indexes as React keys. These are
presentation keys, not existing record identity, but must be replaced when the
items become durable records.

Known content defects include `Redundacny`, `Mulicamera`, and `Mulimedia`. The
link labelled `GitHub Repository` currently points to LinkedIn.

The current media archive must remain accessible until its entries have been
progressively migrated into Work and Evidence records.

## Routes and counts

Current public routes are `/`, `/about`, `/capabilities`, `/contact`, `/engine`,
`/projects`, and `/registry`.

There are no dynamic Hat or Project routes.

Hard-coded capability counts currently exist in:

- `app/registry/page.tsx`: 133 recognised capabilities.
- `app/registry/page.tsx`: 105 loaded nodes.
- `components/sections/SystemGateways.tsx`: 133 capabilities.

The loaded count should eventually be derived from the public Hat projection.
The recognised total should become named metadata rather than an unexplained
JSX literal.

## Configuration findings

- Next.js: 16.2.9.
- React: 19.2.4.
- TypeScript strict mode is enabled.
- JSON module imports are enabled.
- `@/*` currently resolves from the application root.
- `next.config.ts` uses `output: "export"`.
- No runtime schema-validation dependency is installed.
- No record-generation or validation scripts exist.

The repository-bundled Next.js documentation confirms that `app`,
`components`, and other application source may live under `src/`, while
`public`, `package.json`, `next.config.ts`, and `tsconfig.json` remain at the
project root. The alias must be updated to resolve through `src/`.

## Migration checkpoints

1. Move `app/`, `components/`, and `system/` into `src/` as a structural-only
   operation and verify unchanged behaviour.
2. Add durable record identity and a one-time legacy-key-to-UUID migration.
3. Establish explicit private-record and public-projection types before
   migrating client consumers.
4. Introduce Project and Work records only after Hat identity is stable.
5. Add Evidence and explicit relationships before replacing the Projects UI.
6. Add Events and Deployments later, when meaningful history exists.

This document is a baseline. Subsequent migration decisions and record counts
should be appended to the migration log rather than silently rewriting the
historical findings above.
