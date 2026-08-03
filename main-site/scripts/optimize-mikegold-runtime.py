#!/usr/bin/env python3
# Apply the MikeGold archive runtime optimisation.
#
# Run from ~/Dev/MikeGold/main-site, or let the script use that default path:
#   python3 optimize_mikegold_runtime.py
#   python3 optimize_mikegold_runtime.py --build
#
# The script is idempotent and aborts if expected source markers cannot be found.

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


OPEN_NEXT_CONFIG = '''import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
'''

PROJECTS_PAGE = '''import WorkExplorer from "@/components/work/WorkExplorer";
import Footer from "@/components/sections/Footer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import { publicWorkCards } from "@/system/generated/public-work-cards.generated";

export const dynamic = "force-static";

const explorerProjects = publicProjects.map(({
  slug,
  name,
  summary,
  status,
  context,
  establishedYear,
}) => ({
  slug,
  name,
  summary,
  status,
  context,
  establishedYear,
}));

const explorerWork = publicWork.map(({
  slug,
  projectSlug,
  title,
  summary,
  capabilityGroupIds,
  appliedHatSlugs,
}) => ({
  slug,
  projectSlug,
  title,
  summary,
  capabilityGroupIds,
  appliedHatSlugs,
}));

const explorerHats = publicHats.map(({ slug, name }) => ({ slug, name }));

const explorerCards = publicWorkCards.map(({
  projectSlug,
  lensId,
  projectName,
  contributionTitle,
  summary,
  relevantWorkSlugs,
  leadHatSlugs,
  supportingHatSlugs,
  primaryVisual,
  evidenceCompletenessScore,
  editorialSequence,
  finalScore,
  href,
}) => ({
  projectSlug,
  lensId,
  projectName,
  contributionTitle,
  summary,
  relevantWorkSlugs,
  leadHatSlugs,
  supportingHatSlugs,
  primaryVisual,
  evidenceCompletenessScore,
  editorialSequence,
  finalScore,
  href,
}));

export default function ProjectsPage() {
  return (
    <main>
      <div className="page work-page">
        <WorkExplorer
          projects={explorerProjects}
          work={explorerWork}
          hats={explorerHats}
          cards={explorerCards}
        />
      </div>
      <Footer />
    </main>
  );
}
'''

REGISTRY_PAGE = '''import HatRegistry from "@/components/HatRegistry";
import Footer from "@/components/sections/Footer";

export const dynamic = "force-static";

export default function RegistryPage() {
  return (
    <main> 

    <div style={{ padding: "40px" }}>

      {/* SYSTEM HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>HAT REGiSTRY</h1>

        <p style={{ opacity: 0.7, marginTop: "8px" }}>
          133 capabilities forming a connected system graph.
        </p>

        <p style={{ opacity: 0.5 }}>
          Expand nodes to explore relationships, overlap, and system strength.
        </p>
      </div>

      {/* SYSTEM STATUS BAR (optional but powerful) */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          fontSize: "12px",
          opacity: 0.6
        }}
      >
        <span>● ACTIVE SYSTEM</span>
        <span>● GRAPH MODE</span>
        <span>● 105 NODES LOADED</span>
      </div>

      {/* CORE SYSTEM */}
      <HatRegistry />
      </div>
      <Footer />
    </main>
  );
}
'''

PROJECT_DETAIL_PAGE = '''import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import BjorrIdentityLanguage from "@/components/work/BjorrIdentityLanguage";
import ProjectContextBackLink from "@/components/work/ProjectContextBackLink";
import ProjectWorkArchive from "@/components/work/ProjectWorkArchive";
import { publicEvidence } from "@/system/generated/public-evidence.generated";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

const projectBySlug = new Map(publicProjects.map((project) => [project.slug, project]));
const evidenceBySlug = new Map(publicEvidence.map((evidence) => [evidence.slug, evidence]));
const hatBySlug = new Map(publicHats.map((hat) => [hat.slug, hat]));
const workByProjectSlug = new Map<string, Array<(typeof publicWork)[number]>>();

for (const item of publicWork) {
  const projectWork = workByProjectSlug.get(item.projectSlug) ?? [];
  projectWork.push(item);
  workByProjectSlug.set(item.projectSlug, projectWork);
}

export function generateStaticParams() {
  return publicProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) notFound();

  const work = workByProjectSlug.get(project.slug) ?? [];
  const hats = [...new Set(work.flatMap((item) => item.appliedHatSlugs))].flatMap((hatSlug) => {
    const hat = hatBySlug.get(hatSlug);
    return hat ? [{ slug: hat.slug, name: hat.name }] : [];
  });
  const evidence = [...new Set(work.flatMap((item) => item.evidenceSlugs))].flatMap((evidenceSlug) => {
    const item = evidenceBySlug.get(evidenceSlug);
    return item ? [item] : [];
  });

  return (
    <main>
      <article className={`page project-record-page project-record-page-${project.slug}`}>
        <ProjectContextBackLink />
        <header className="project-record-hero">
          <div className="record-status-row">
            <span>{project.status.replaceAll("-", " ")}</span>
            <span>{project.context ?? project.establishedYear ?? "Period being documented"}</span>
          </div>
          <h1>{project.name}</h1>
          <p>{project.summary}</p>
        </header>

        {project.slug === "bjorr" && <BjorrIdentityLanguage />}

        <section>
          <p className="work-kicker">MY CONTRIBUTION</p>
          <h2>Documented work</h2>
          <ProjectWorkArchive work={work} hats={hats} evidence={evidence} />
        </section>
      </article>
      <Footer />
    </main>
  );
}
'''

PROJECT_WORK_ARCHIVE = '''"use client";

import { useEffect, useMemo, useState } from "react";
import EvidenceDisclosure from "@/components/work/EvidenceDisclosure";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import { resolveCapabilityGroupId, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkProjection } from "@/system/work/work.types";

type HatLabel = {
  slug: string;
  name: string;
};

export default function ProjectWorkArchive({ work, hats, evidence }: {
  work: PublicWorkProjection[];
  hats: HatLabel[];
  evidence: PublicEvidenceProjection[];
}) {
  const [area, setArea] = useState<CapabilityGroupId | "">("");

  useEffect(() => {
    const requested = resolveCapabilityGroupId(new URLSearchParams(window.location.search).get("area"));
    if (requested) setArea(requested);
  }, []);

  const hatBySlug = useMemo(() => new Map(hats.map((hat) => [hat.slug, hat])), [hats]);
  const evidenceBySlug = useMemo(() => new Map(evidence.map((item) => [item.slug, item])), [evidence]);
  const orderedWork = useMemo(
    () => work
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const leftContext = area && left.item.capabilityGroupIds.includes(area) ? 0 : 1;
        const rightContext = area && right.item.capabilityGroupIds.includes(area) ? 0 : 1;
        return leftContext - rightContext
          || (left.item.sequence ?? 999) - (right.item.sequence ?? 999)
          || left.index - right.index;
      })
      .map(({ item }) => item),
    [area, work],
  );

  return (
    <div className="project-work-sections">
      {orderedWork.map((item) => {
        const isContextual = !area || item.capabilityGroupIds.includes(area);
        const itemEvidence = item.evidenceSlugs.flatMap((slug) => {
          const record = evidenceBySlug.get(slug);
          return record ? [record] : [];
        });

        return (
          <article key={item.slug} className={`project-work-section${isContextual ? " is-contextual" : ""}`}>
            <div className="record-status-row">
              <span>{item.status.replaceAll("-", " ")}</span>
              <span>Work contribution</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            {!!item.appliedHatSlugs.length && (
              <div className="applied-hat-list" aria-label="Applied Hats">
                {item.appliedHatSlugs.map((slug) => (
                  <span key={slug}>{hatBySlug.get(slug)?.name ?? slug}</span>
                ))}
              </div>
            )}
            {!!item.stages?.length && (
              <ol className="work-stage-list">
                {item.stages.map((stage) => (
                  <li key={stage.key}>
                    <strong>{stage.label}</strong>
                    <span>{stage.status.replaceAll("-", " ")}</span>
                  </li>
                ))}
              </ol>
            )}
            <EvidenceDisclosure evidence={itemEvidence} defaultOpen={false} />
          </article>
        );
      })}
    </div>
  );
}
'''

WORK_EXPLORER = '''"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicProjectProjection } from "@/system/projects/project.types";
import { CAPABILITY_GROUPS, resolveCapabilityGroupId, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkCardProjection, PublicWorkProjection } from "@/system/work/work.types";

type View = "projects" | "work" | "capabilities";
type ProjectSort = "relevance" | "name" | "newest" | "oldest";
type ExplorerHat = Pick<PublicHat, "slug" | "name">;
type ExplorerProject = Pick<
  PublicProjectProjection,
  "slug" | "name" | "summary" | "status" | "context" | "establishedYear"
>;
type ExplorerWork = Pick<
  PublicWorkProjection,
  "slug" | "projectSlug" | "title" | "summary" | "capabilityGroupIds" | "appliedHatSlugs"
>;
type ExplorerCard = Pick<
  PublicWorkCardProjection,
  | "projectSlug"
  | "lensId"
  | "projectName"
  | "contributionTitle"
  | "summary"
  | "relevantWorkSlugs"
  | "leadHatSlugs"
  | "supportingHatSlugs"
  | "primaryVisual"
  | "evidenceCompletenessScore"
  | "editorialSequence"
  | "finalScore"
  | "href"
>;

const DIRECTORY_PAGE_SIZE = 7;
const SHOWCASE_LIMIT = 6;
const cardKey = (projectSlug: string, lensId?: CapabilityGroupId) =>
  `${projectSlug}::${lensId ?? ""}`;

export default function WorkExplorer({
  projects,
  work,
  hats,
  cards,
  initialGroup = "",
  initialQuery = "",
  initialHat = "",
  initialSort = "relevance",
  initialLimit = DIRECTORY_PAGE_SIZE,
}: {
  projects: ExplorerProject[];
  work: ExplorerWork[];
  hats: ExplorerHat[];
  cards: ExplorerCard[];
  initialGroup?: CapabilityGroupId | "";
  initialQuery?: string;
  initialHat?: string;
  initialSort?: ProjectSort;
  initialLimit?: number;
}) {
  const [view, setView] = useState<View>("projects");
  const [query, setQuery] = useState(initialQuery);
  const [hatFilter, setHatFilter] = useState(initialHat);
  const [groupFilter, setGroupFilter] = useState<CapabilityGroupId | "">(initialGroup);
  const [archiveOpen, setArchiveOpen] = useState(Boolean(initialGroup || initialQuery || initialHat));
  const [projectSort, setProjectSort] = useState<ProjectSort>(initialSort);
  const [directoryLimit, setDirectoryLimit] = useState(initialLimit);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedArea = resolveCapabilityGroupId(params.get("area"));
    if (requestedArea) {
      setGroupFilter(requestedArea);
      setArchiveOpen(true);
      setView("projects");
    }

    const requestedQuery = params.get("q");
    if (requestedQuery) {
      setQuery(requestedQuery);
      setArchiveOpen(true);
    }

    const requestedHat = params.get("hat");
    if (requestedHat) {
      setHatFilter(requestedHat);
      setArchiveOpen(true);
    }

    const requestedSort = params.get("sort");
    if (requestedSort === "name" || requestedSort === "newest" || requestedSort === "oldest") {
      setProjectSort(requestedSort);
    }

    const requestedLimit = Number(params.get("limit"));
    if (Number.isFinite(requestedLimit) && requestedLimit > DIRECTORY_PAGE_SIZE) {
      setDirectoryLimit(Math.ceil(requestedLimit / DIRECTORY_PAGE_SIZE) * DIRECTORY_PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    if (!archiveOpen) return;

    const params = new URLSearchParams();
    if (groupFilter) params.set("area", groupFilter);
    if (query.trim()) params.set("q", query.trim());
    if (hatFilter) params.set("hat", hatFilter);
    if (projectSort !== "relevance") params.set("sort", projectSort);
    if (directoryLimit > DIRECTORY_PAGE_SIZE) params.set("limit", String(directoryLimit));

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }, [archiveOpen, directoryLimit, groupFilter, hatFilter, projectSort, query]);

  const projectHref = (slug: string) => groupFilter
    ? `/projects/${slug}?area=${groupFilter}`
    : `/projects/${slug}`;

  const projectBySlug = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const hatBySlug = useMemo(
    () => new Map(hats.map((hat) => [hat.slug, hat])),
    [hats],
  );
  const cardByProjectAndLens = useMemo(
    () => new Map(cards.map((card) => [cardKey(card.projectSlug, card.lensId), card])),
    [cards],
  );
  const groupStats = useMemo(() => {
    const projectSlugsByGroup = new Map<CapabilityGroupId, Set<string>>();
    const contributionCounts = new Map<CapabilityGroupId, number>();

    for (const item of work) {
      for (const groupId of item.capabilityGroupIds) {
        const projectSlugs = projectSlugsByGroup.get(groupId) ?? new Set<string>();
        projectSlugs.add(item.projectSlug);
        projectSlugsByGroup.set(groupId, projectSlugs);
        contributionCounts.set(groupId, (contributionCounts.get(groupId) ?? 0) + 1);
      }
    }

    return new Map(CAPABILITY_GROUPS.map((group) => [
      group.id,
      {
        projectCount: projectSlugsByGroup.get(group.id)?.size ?? 0,
        contributionCount: contributionCounts.get(group.id) ?? 0,
      },
    ]));
  }, [work]);

  const usedHatSlugs = useMemo(
    () => [...new Set(
      work
        .filter((item) => !groupFilter || item.capabilityGroupIds.includes(groupFilter))
        .flatMap((item) => item.appliedHatSlugs),
    )].sort(),
    [groupFilter, work],
  );
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const visibleWork = useMemo(
    () => work.filter((item) => {
      const matchesQuery = !normalizedQuery
        || `${item.title} ${item.summary} ${item.projectSlug}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesGroup = !groupFilter || item.capabilityGroupIds.includes(groupFilter);
      const matchesHat = !hatFilter || item.appliedHatSlugs.includes(hatFilter);
      return matchesQuery && matchesGroup && matchesHat;
    }),
    [groupFilter, hatFilter, normalizedQuery, work],
  );
  const visibleProjectSlugs = useMemo(
    () => new Set(visibleWork.map((item) => item.projectSlug)),
    [visibleWork],
  );
  const visibleProjects = useMemo(
    () => projects.filter((project) => {
      if (hatFilter || groupFilter) return visibleProjectSlugs.has(project.slug);
      if (!normalizedQuery) return archiveOpen;
      return `${project.name} ${project.summary}`.toLowerCase().includes(normalizedQuery)
        || visibleProjectSlugs.has(project.slug);
    }),
    [archiveOpen, groupFilter, hatFilter, normalizedQuery, projects, visibleProjectSlugs],
  );
  const activeLensId = groupFilter || undefined;
  const visibleCards = useMemo(
    () => visibleProjects.flatMap((project) => {
      const card = cardByProjectAndLens.get(cardKey(project.slug, activeLensId));
      return card ? [card] : [];
    }),
    [activeLensId, cardByProjectAndLens, visibleProjects],
  );
  const visibleCardByProject = useMemo(
    () => new Map(visibleCards.map((card) => [card.projectSlug, card])),
    [visibleCards],
  );
  const visibleWorkByProject = useMemo(() => {
    const grouped = new Map<string, ExplorerWork[]>();
    for (const item of visibleWork) {
      const projectWork = grouped.get(item.projectSlug) ?? [];
      projectWork.push(item);
      grouped.set(item.projectSlug, projectWork);
    }
    return grouped;
  }, [visibleWork]);
  const visibleWorkByHat = useMemo(() => {
    const grouped = new Map<string, ExplorerWork[]>();
    for (const item of visibleWork) {
      for (const slug of item.appliedHatSlugs) {
        const connected = grouped.get(slug) ?? [];
        connected.push(item);
        grouped.set(slug, connected);
      }
    }
    return grouped;
  }, [visibleWork]);
  const searchRelevanceByProject = useMemo(() => {
    const scores = new Map<string, number>();
    if (!normalizedQuery) return scores;

    const contributionMatches = new Map<string, number>();
    for (const item of visibleWork) {
      contributionMatches.set(
        item.projectSlug,
        (contributionMatches.get(item.projectSlug) ?? 0) + 1,
      );
    }

    for (const project of visibleProjects) {
      const exactProjectMatch = project.name.toLowerCase().includes(normalizedQuery) ? 30 : 0;
      const workScore = Math.min(20, (contributionMatches.get(project.slug) ?? 0) * 8);
      scores.set(project.slug, exactProjectMatch + workScore);
    }

    return scores;
  }, [normalizedQuery, visibleProjects, visibleWork]);
  const orderedProjects = useMemo(
    () => [...visibleProjects].sort((left, right) => {
      if (projectSort === "name") return left.name.localeCompare(right.name);
      if (projectSort === "newest") {
        return (right.establishedYear ?? 0) - (left.establishedYear ?? 0)
          || left.name.localeCompare(right.name);
      }
      if (projectSort === "oldest") {
        return (left.establishedYear ?? 9999) - (right.establishedYear ?? 9999)
          || left.name.localeCompare(right.name);
      }

      const leftCard = visibleCardByProject.get(left.slug);
      const rightCard = visibleCardByProject.get(right.slug);
      const leftScore = leftCard?.finalScore ?? 0;
      const rightScore = rightCard?.finalScore ?? 0;

      return (rightScore + (searchRelevanceByProject.get(right.slug) ?? 0))
        - (leftScore + (searchRelevanceByProject.get(left.slug) ?? 0))
        || (rightCard?.evidenceCompletenessScore ?? 0)
          - (leftCard?.evidenceCompletenessScore ?? 0)
        || (leftCard?.editorialSequence ?? 9999)
          - (rightCard?.editorialSequence ?? 9999)
        || left.name.localeCompare(right.name)
        || left.slug.localeCompare(right.slug);
    }),
    [projectSort, searchRelevanceByProject, visibleCardByProject, visibleProjects],
  );
  const orderedCards = useMemo(
    () => orderedProjects.flatMap((project) => {
      const card = visibleCardByProject.get(project.slug);
      return card ? [card] : [];
    }),
    [orderedProjects, visibleCardByProject],
  );
  const showcaseCards = useMemo(
    () => orderedCards.slice(0, SHOWCASE_LIMIT),
    [orderedCards],
  );
  const showcaseProjectSlugs = useMemo(
    () => new Set(showcaseCards.map((card) => card.projectSlug)),
    [showcaseCards],
  );
  const remainingProjects = useMemo(
    () => orderedProjects.filter((project) => !showcaseProjectSlugs.has(project.slug)),
    [orderedProjects, showcaseProjectSlugs],
  );
  const directoryProjects = remainingProjects.slice(0, directoryLimit);
  const selectedGroup = CAPABILITY_GROUPS.find((group) => group.id === groupFilter);

  return (
    <section className="work-explorer" aria-labelledby="work-explorer-title">
      <header className="page-header work-page-header">
        <p className="work-kicker">SYSTEMS DELIVERED</p>
        <h1>WORK</h1>
        <p>
          {selectedGroup?.summary ??
            "A growing record of products, identities, applications, infrastructure and engineering environments I have designed, built, deployed or helped bring into operation."}
        </p>
      </header>

      {!archiveOpen && (
        <>
          <div className="capability-group-intro">
            <p className="work-kicker">SIX CONNECTED AREAS</p>
            <h2 id="work-explorer-title">Start with the whole picture</h2>
            <p>
              Choose an area for a focused route through the archive. Projects can
              cross several areas because the work behind them often does too.
            </p>
          </div>

          <div className="capability-group-grid">
            {CAPABILITY_GROUPS.map((group) => {
              const stats = groupStats.get(group.id) ?? {
                projectCount: 0,
                contributionCount: 0,
              };

              return (
                <Link
                  href={`/projects?area=${group.id}`}
                  key={group.id}
                  prefetch={false}
                  className={groupFilter === group.id
                    ? "capability-group-card is-active"
                    : "capability-group-card"}
                  onClick={(event) => {
                    event.preventDefault();
                    setGroupFilter(group.id);
                    setHatFilter("");
                    setQuery("");
                    setDirectoryLimit(DIRECTORY_PAGE_SIZE);
                    setArchiveOpen(true);
                    setView("projects");
                  }}
                >
                  <span className="capability-group-face capability-group-front">
                    <span className="capability-group-code">{group.code}</span>
                    <strong>{group.name}</strong>
                    <span className="capability-group-count">Open area →</span>
                  </span>
                  <span className="capability-group-face capability-group-back">
                    <span className="capability-group-summary">{group.summary}</span>
                    <span className="capability-group-count">
                      {stats.projectCount} project{stats.projectCount === 1 ? "" : "s"} ·{" "}
                      {stats.contributionCount} contributions
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="work-entry-actions">
            <p>Select an area to see its connected projects and contributions.</p>
            <button type="button" className="show-all-projects" onClick={() => setArchiveOpen(true)}>
              Browse the complete archive
            </button>
          </div>
        </>
      )}

      {archiveOpen && (
        <div className="work-archive-panel">
          <div className="work-route-banner">
            <span>{groupFilter ? "AREA SELECTED" : "COMPLETE ARCHIVE"}</span>
            <strong>{selectedGroup?.name ?? `${projects.length} project records`}</strong>
            <button
              type="button"
              onClick={() => {
                setGroupFilter("");
                setHatFilter("");
                setQuery("");
                setDirectoryLimit(DIRECTORY_PAGE_SIZE);
                setArchiveOpen(false);
              }}
            >
              ← Return to six areas
            </button>
          </div>

          <div className="work-explorer-heading" id="work-results">
            <div>
              <p className="work-kicker">STRUCTURED WORK ARCHIVE</p>
              <h2>{selectedGroup?.name ?? "Selected systems and applied work"}</h2>
            </div>
            <div className="work-view-tabs" aria-label="Work views">
              {(["projects", "work", "capabilities"] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={view === option ? "is-active" : ""}
                  onClick={() => setView(option)}
                >
                  {{ projects: "Selected Work", work: "Contributions", capabilities: "Capabilities" }[option]}
                </button>
              ))}
            </div>
          </div>

          <form className="work-filters" action="/projects" method="get">
            {groupFilter && <input type="hidden" name="area" value={groupFilter} />}
            <label>
              <span>Search</span>
              <input
                name="q"
                enterKeyHint="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setDirectoryLimit(DIRECTORY_PAGE_SIZE);
                }}
                placeholder="Project, work or contribution"
              />
            </label>
            <label>
              <span>Capability</span>
              <select
                name="hat"
                value={hatFilter}
                onChange={(event) => {
                  setHatFilter(event.target.value);
                  setDirectoryLimit(DIRECTORY_PAGE_SIZE);
                }}
              >
                <option value="">All applied Hats</option>
                {usedHatSlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {hatBySlug.get(slug)?.name ?? slug}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort projects</span>
              <select
                name="sort"
                value={projectSort}
                onChange={(event) => {
                  setProjectSort(event.target.value as ProjectSort);
                  setDirectoryLimit(DIRECTORY_PAGE_SIZE);
                }}
              >
                <option value="relevance">Editorial relevance</option>
                <option value="name">Project name</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            <button type="submit" className="work-filter-submit">Apply filters</button>
          </form>

          <button
            type="button"
            className="clear-work-route"
            onClick={() => {
              setGroupFilter("");
              setHatFilter("");
              setQuery("");
              setDirectoryLimit(DIRECTORY_PAGE_SIZE);
              setArchiveOpen(false);
            }}
          >
            Back to the six areas
          </button>

          {view === "projects" && (
            <>
              <header className="work-section-heading">
                <div>
                  <p className="work-kicker">SELECTED WORK</p>
                  <h3>Representative projects</h3>
                </div>
                <span>{showcaseCards.length} of {visibleProjects.length} matching projects</span>
              </header>

              <div className="project-record-grid">
                {showcaseCards.map((card) => {
                  const project = projectBySlug.get(card.projectSlug);
                  if (!project) return null;

                  const relevantVisuals = [card.primaryVisual].filter(
                    (item): item is NonNullable<typeof item> => Boolean(item),
                  );
                  const capabilityCount = card.leadHatSlugs.length + card.supportingHatSlugs.length;

                  return (
                    <article className="project-record-card" key={project.slug}>
                      {!!relevantVisuals.length && (
                        <div className="project-evidence-preview project-evidence-preview-1">
                          {relevantVisuals.map((item) => (
                            <figure key={item.evidenceSlug}>
                              <img src={item.src} alt={item.alt} loading="lazy" />
                            </figure>
                          ))}
                        </div>
                      )}
                      <div className="record-status-row">
                        <span>{project.status.replace(/-/g, " ")}</span>
                        <span>{project.context ?? project.establishedYear ?? "Period being documented"}</span>
                      </div>
                      <span className="work-project-label">PROJECT</span>
                      <h3>{card.projectName}</h3>
                      <span className="work-project-label">CONTRIBUTION</span>
                      <h4>{card.contributionTitle}</h4>
                      <p>{card.summary}</p>
                      <div className="record-measures">
                        <span>
                          {card.relevantWorkSlugs.length} contribution
                          {card.relevantWorkSlugs.length === 1 ? "" : "s"}
                        </span>
                        <span>{capabilityCount} applied Hats</span>
                      </div>
                      <a href={card.href}>View work →</a>
                    </article>
                  );
                })}
              </div>

              <section className="complete-work-index" aria-labelledby="complete-work-index-title">
                <header className="work-section-heading">
                  <div>
                    <p className="work-kicker">ALL MATCHING WORK</p>
                    <h3 id="complete-work-index-title">Complete project index</h3>
                  </div>
                  <span>
                    {visibleProjects.length} project{visibleProjects.length === 1 ? "" : "s"} ·{" "}
                    {visibleWork.length} contribution{visibleWork.length === 1 ? "" : "s"}
                  </span>
                </header>

                <div className="compact-project-directory">
                  {directoryProjects.map((project) => {
                    const projectWork = visibleWorkByProject.get(project.slug) ?? [];
                    const capabilityCount = new Set(
                      projectWork.flatMap((item) => item.appliedHatSlugs),
                    ).size;

                    return (
                      <a
                        className="compact-project-row"
                        href={projectHref(project.slug)}
                        key={project.slug}
                      >
                        <span>
                          <strong>{project.name}</strong>
                          <small>{project.summary}</small>
                        </span>
                        <span>
                          {projectWork.length} contribution{projectWork.length === 1 ? "" : "s"} ·{" "}
                          {capabilityCount} capabilities
                        </span>
                        <span>View →</span>
                      </a>
                    );
                  })}
                </div>

                {directoryProjects.length < remainingProjects.length && (
                  <button
                    className="load-more-work"
                    type="button"
                    onClick={() => setDirectoryLimit((value) => value + DIRECTORY_PAGE_SIZE)}
                  >
                    Show {Math.min(
                      DIRECTORY_PAGE_SIZE,
                      remainingProjects.length - directoryProjects.length,
                    )} more
                  </button>
                )}
              </section>
            </>
          )}

          {view === "work" && (
            <div className="work-record-list">
              {visibleWork.map((item) => (
                <article key={item.slug} className="work-record-card">
                  <div>
                    <span className="work-project-label">
                      {projectBySlug.get(item.projectSlug)?.name
                        ?? item.projectSlug.replace(/-/g, " ")}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>
                  <div className="applied-hat-list">
                    {item.appliedHatSlugs.map((slug) => (
                      <button type="button" key={slug} onClick={() => setHatFilter(slug)}>
                        {hatBySlug.get(slug)?.name ?? slug}
                      </button>
                    ))}
                    <a className="work-project-link" href={projectHref(item.projectSlug)}>
                      Open project →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {view === "capabilities" && (
            <div>
              <p className="work-kicker">CAPABILITIES EVIDENCED IN THIS VIEW</p>
              <div className="capability-work-grid">
                {usedHatSlugs.map((slug) => {
                  const connected = visibleWorkByHat.get(slug) ?? [];
                  if (!connected.length) return null;

                  return (
                    <button
                      type="button"
                      className="capability-work-card"
                      key={slug}
                      onClick={() => {
                        setHatFilter(slug);
                        setView("work");
                      }}
                    >
                      <strong>{hatBySlug.get(slug)?.name ?? slug}</strong>
                      <span>
                        {connected.length} connected work record
                        {connected.length === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!visibleWork.length && (
            <p className="work-empty-state">No documented work matches these filters yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
'''

VALIDATE_RUNTIME = '''import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const requiredFiles = [
  "open-next.config.ts",
  "wrangler.jsonc",
  "src/app/api/engine/analyse/route.ts",
  "src/server/service-engine/analyse-public-service.ts",
  "src/app/projects/page.tsx",
  "src/app/projects/[slug]/page.tsx",
  "src/app/registry/page.tsx",
];
const errors = requiredFiles
  .filter((file) => !existsSync(join(root, file)))
  .map((file) => `Missing Service Engine runtime file: ${file}`);

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (/output\\s*:\\s*["']export["']/.test(nextConfig)) {
  errors.push("Static export cannot be enabled while the private Service Engine route exists.");
}

const route = readFileSync(join(root, "src/app/api/engine/analyse/route.ts"), "utf8");
if (!route.includes("export async function POST")) errors.push("Service Engine route must expose POST.");
if (!route.includes("private, no-store")) errors.push("Service Engine route must return private, no-store responses.");

const openNextConfig = readFileSync(join(root, "open-next.config.ts"), "utf8");
if (!openNextConfig.includes("staticAssetsIncrementalCache")) {
  errors.push("OpenNext must use the static-assets incremental cache for prerendered routes.");
}
if (!openNextConfig.includes("enableCacheInterception: true")) {
  errors.push("OpenNext cache interception must remain enabled for prerendered routes.");
}

for (const file of ["src/app/projects/page.tsx", "src/app/registry/page.tsx"]) {
  const source = readFileSync(join(root, file), "utf8");
  if (!source.includes('export const dynamic = "force-static"')) {
    errors.push(`${file} must remain force-static.`);
  }
  if (source.includes("searchParams")) {
    errors.push(`${file} must read URL filters in its client component, not at Worker runtime.`);
  }
}

const projectRoute = readFileSync(join(root, "src/app/projects/[slug]/page.tsx"), "utf8");
if (!projectRoute.includes("generateStaticParams")) {
  errors.push("Project records must enumerate known slugs at build time.");
}
if (!projectRoute.includes('export const dynamic = "force-static"')) {
  errors.push("Known project records must remain force-static.");
}

if (errors.length) {
  console.error(JSON.stringify({ errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  runtime: "OpenNext Cloudflare Worker",
  staticExport: false,
  privateAnalyserRoute: true,
  prerenderedRouteCache: "Workers Static Assets",
  staticArchiveRoutes: ["/projects", "/registry", "/projects/[slug]"],
  errors: [],
}, null, 2));
'''

HEADERS = '''/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
'''

HAT_URL_EFFECT = '''  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedQuery = params.get("q")?.trim();
    if (requestedQuery) setSearchQuery(requestedQuery);

    const requestedHatId = params.get("hat")?.trim();
    if (!requestedHatId) return;

    const requestedHat = hats.find(
      (hat) => hat.slug === requestedHatId || hat.id === requestedHatId,
    );
    if (!requestedHat) return;

    setSelectedHats([requestedHat]);
    setActiveHat(requestedHat);
    setCollapsedSections((previous) => ({
      ...previous,
      [requestedHat.category]: false,
    }));
    setPendingRevealHatId(requestedHat.id);
  }, []);

'''


def write_text(path: Path, content: str) -> bool:
    current = path.read_text(encoding="utf-8") if path.exists() else None
    if current == content:
        print(f"unchanged  {path}")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"updated    {path}")
    return True


def insert_hat_url_effect(path: Path) -> bool:
    source = path.read_text(encoding="utf-8")
    if 'const requestedHatId = params.get("hat")?.trim();' in source:
        print(f"unchanged  {path}")
        return False

    marker = '''  const tileBrowserRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef(new Map<string, HTMLElement>());

'''
    if marker not in source:
        raise RuntimeError(f"Expected HatRegistry state marker was not found in {path}")

    path.write_text(source.replace(marker, marker + HAT_URL_EFFECT, 1), encoding="utf-8")
    print(f"updated    {path}")
    return True


def update_wrangler(path: Path) -> bool:
    source = path.read_text(encoding="utf-8")
    if '"run_worker_first": false' in source:
        print(f"unchanged  {path}")
        return False

    marker = '''  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },'''
    replacement = '''  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS",
    "run_worker_first": false
  },'''
    if marker not in source:
        raise RuntimeError(f"Expected Wrangler assets block was not found in {path}")

    updated = source.replace(marker, replacement, 1)
    if not updated.endswith("\n"):
        updated += "\n"
    path.write_text(updated, encoding="utf-8")
    print(f"updated    {path}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Path to main-site (defaults to the current directory).",
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Run npm run build:cloudflare after applying the patch.",
    )
    args = parser.parse_args()

    root = args.root.expanduser().resolve()
    if not (root / "package.json").exists():
        fallback = Path.home() / "Dev" / "MikeGold" / "main-site"
        if fallback.exists():
            root = fallback.resolve()
        else:
            print("Run this script from ~/Dev/MikeGold/main-site or pass --root.", file=sys.stderr)
            return 2

    required = [
        root / "open-next.config.ts",
        root / "wrangler.jsonc",
        root / "src/app/projects/page.tsx",
        root / "src/app/projects/[slug]/page.tsx",
        root / "src/app/registry/page.tsx",
        root / "src/components/HatRegistry.tsx",
        root / "src/components/work/ProjectWorkArchive.tsx",
        root / "src/components/work/WorkExplorer.tsx",
        root / "scripts/validate-service-runtime.mjs",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        print("Missing required files:\n" + "\n".join(missing), file=sys.stderr)
        return 2

    changed = []
    replacements = {
        root / "open-next.config.ts": OPEN_NEXT_CONFIG,
        root / "src/app/projects/page.tsx": PROJECTS_PAGE,
        root / "src/app/registry/page.tsx": REGISTRY_PAGE,
        root / "src/app/projects/[slug]/page.tsx": PROJECT_DETAIL_PAGE,
        root / "src/components/work/ProjectWorkArchive.tsx": PROJECT_WORK_ARCHIVE,
        root / "src/components/work/WorkExplorer.tsx": WORK_EXPLORER,
        root / "scripts/validate-service-runtime.mjs": VALIDATE_RUNTIME,
        root / "public/_headers": HEADERS,
    }

    for path, content in replacements.items():
        if write_text(path, content):
            changed.append(path)

    if insert_hat_url_effect(root / "src/components/HatRegistry.tsx"):
        changed.append(root / "src/components/HatRegistry.tsx")
    if update_wrangler(root / "wrangler.jsonc"):
        changed.append(root / "wrangler.jsonc")

    print("\nApplied MikeGold runtime optimisation.")
    print(f"Changed files: {len(changed)}")
    for path in changed:
        print(f"  - {path.relative_to(root)}")

    if args.build:
        print("\nRunning npm run build:cloudflare ...")
        completed = subprocess.run(["npm", "run", "build:cloudflare"], cwd=root)
        return completed.returncode

    print("\nNext:")
    print("  npm run build:cloudflare")
    print("  git diff --check")
    print("  git status --short")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
