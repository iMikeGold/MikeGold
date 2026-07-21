"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicProjectProjection } from "@/system/projects/project.types";
import { analyseServiceIntent } from "@/system/services/intent-engine";
import type { PublicWorkProjection } from "@/system/work/work.types";

export default function ServiceIntentExplorer({
  hats,
  projects,
  work,
  compact = false,
}: {
  hats: PublicHat[];
  projects: PublicProjectProjection[];
  work: PublicWorkProjection[];
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (compact) return;
    const enquiry = new URLSearchParams(window.location.search).get("q");
    if (enquiry) setQuery(enquiry);
  }, [compact]);
  const analysis = useMemo(
    () => analyseServiceIntent(hats, work, query),
    [hats, query, work],
  );
  const matchedWork = analysis.relevantWork.slice(0, compact ? 2 : 5);
  const hatBySlug = useMemo(() => new Map(hats.map((hat) => [hat.slug, hat])), [hats]);

  return (
    <div className={`service-intent-explorer${compact ? " is-compact" : ""}`}>
      <label htmlFor={compact ? "home-service-intent" : "engine-service-intent"}>
        What do you want to build?
      </label>
      <input
        id={compact ? "home-service-intent" : "engine-service-intent"}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Describe a system, product, requirement or idea..."
      />
      {query.trim().length > 0 && compact && (
        <div className="service-qualification-result" aria-live="polite">
          <span className="work-kicker">INITIAL SERVICE ROUTE · {analysis.confidence.level}</span>
          <strong>{analysis.title}</strong>
          <p>{analysis.summary}</p>
          {!!analysis.modules.length && <p>{analysis.modules.slice(0, 3).map((module) => module.name).join(" · ")}</p>}
          <div className="service-qualification-actions">
            <Link href={`/engine?q=${encodeURIComponent(query)}`}>Analyse this enquiry →</Link>
            {!!matchedWork.length && <Link href="/projects">See relevant experience</Link>}
          </div>
        </div>
      )}
      {query.trim().length > 0 && !compact && (
        <div className="service-intent-results" aria-live="polite">
          <section>
            <span className="work-kicker">PROPOSED SERVICE CONFIGURATION · {analysis.confidence.level}</span>
            <h2>{analysis.title}</h2>
            <p>{analysis.summary}</p>
            <p>{analysis.confidence.explanation}</p>
          </section>
          {!!analysis.modules.length && <section>
            <span className="work-kicker">DELIVERY MODULES</span>
            <div className="service-module-results">
              {analysis.modules.map((module) => <article key={module.id}><span>{module.status}</span><h3>{module.name}</h3><p>{module.reason}</p><ul>{module.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
            </div>
          </section>}
          {!!analysis.deliveryPhases.length && <section>
            <span className="work-kicker">DELIVERY PROFILE</span>
            <ol className="service-phase-results">{analysis.deliveryPhases.map((phase) => <li key={phase.name}><strong>{phase.name}</strong><span>{phase.purpose}</span></li>)}</ol>
          </section>}
          {!!analysis.leadHatSlugs.length && <section>
            <span className="work-kicker">CAPABILITY CONFIGURATION</span>
            <div className="service-hat-results">
              {analysis.leadHatSlugs.map((slug) => (
                <Link href={`/registry?hat=${slug}`} key={slug}>{hatBySlug.get(slug)?.name ?? slug}</Link>
              ))}
            </div>
            {!!analysis.supportingHatSlugs.length && <p>Supporting: {analysis.supportingHatSlugs.map((slug) => hatBySlug.get(slug)?.name ?? slug).join(" · ")}</p>}
          </section>}
          <section>
            <span className="work-kicker">RELEVANT EXPERIENCE</span>
            {matchedWork.length ? matchedWork.map(({ workSlug, projectSlug, reason }) => {
              const item = work.find((candidate) => candidate.slug === workSlug)!;
              const project = projects.find((candidate) => candidate.slug === projectSlug);
              return (
                <Link className="service-work-result" href={`/projects/${projectSlug}`} key={workSlug}>
                  <strong>{item.title}</strong>
                  <span>{project?.name ?? projectSlug} · {reason}</span>
                </Link>
              ); }) : <p>Related proof will appear when the enquiry activates a defined service route.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
