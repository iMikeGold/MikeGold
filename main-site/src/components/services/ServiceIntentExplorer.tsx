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
  const matchedHats = analysis.hats.slice(0, compact ? 3 : 6);
  const matchedWork = analysis.work.slice(0, compact ? 2 : 4);

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
      {analysis.terms.length > 0 && compact && (
        <div className="service-qualification-result" aria-live="polite">
          <span className="work-kicker">CAPABILITY FIT · {analysis.confidence}</span>
          <strong>
            {analysis.confidence === "insufficient"
              ? "More detail is needed to assess the enquiry."
              : "Relevant capability exists for this enquiry."}
          </strong>
          {!!matchedHats.length && (
            <p>{matchedHats.map(({ hat }) => hat.name).join(" · ")}</p>
          )}
          <div className="service-qualification-actions">
            <Link href={`/engine?q=${encodeURIComponent(query)}`}>Analyse this enquiry →</Link>
            {!!matchedWork.length && <Link href="/projects">See relevant experience</Link>}
          </div>
        </div>
      )}
      {analysis.terms.length > 0 && !compact && (
        <div className="service-intent-results" aria-live="polite">
          <section>
            <span className="work-kicker">CAPABILITY STACK</span>
            <div className="service-hat-results">
              {matchedHats.map(({ hat }) => (
                <Link href={`/registry?hat=${hat.slug}`} key={hat.slug}>{hat.name}</Link>
              ))}
            </div>
          </section>
          <section>
            <span className="work-kicker">RELEVANT EXPERIENCE</span>
            {matchedWork.length ? matchedWork.map(({ item, reason }) => {
              const project = projects.find((candidate) => candidate.slug === item.projectSlug);
              return (
                <Link className="service-work-result" href={`/projects/${item.projectSlug}`} key={item.slug}>
                  <strong>{item.title}</strong>
                  <span>{project?.name ?? item.projectSlug} · {reason === "direct" ? "directly relevant" : "capability evidence"}</span>
                </Link>
              );
            }) : <p>No recorded work matches yet; the capability results can still define a route.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
