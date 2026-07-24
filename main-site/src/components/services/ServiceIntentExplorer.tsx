"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useServiceEngineSession } from "./ServiceEngineSession";

export default function ServiceIntentExplorer({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const {
    draftQuery, submittedQuery, submittedResult: result, analysisPending, error,
    setDraftQuery, analyse,
  } = useServiceEngineSession();

  return (
    <div className={`service-intent-explorer${compact ? " is-compact" : ""}`}>
      <label htmlFor={compact ? "home-service-intent" : "engine-service-intent"}>
        What do you want to build?
      </label>
      <form onSubmit={(event) => { event.preventDefault(); void analyse(); }} className="service-intent-form">
        <input
          id={compact ? "home-service-intent" : "engine-service-intent"}
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Describe a system, product, requirement or idea..."
          autoComplete="off"
        />
        <button type="submit" disabled={analysisPending || !draftQuery.trim()}>
          {analysisPending ? "Analysing…" : "Analyse enquiry"}
        </button>
      </form>
      {error && <p className="service-form-error" role="alert">{error}</p>}
      {result && submittedQuery && compact && (
        <div className="service-qualification-result" aria-live="polite">
          <span className="work-kicker">INITIAL SERVICE ROUTE · {result.status.replaceAll("-", " ")}</span>
          <strong>{result.understood.title}</strong>
          <p>{result.understood.summary}</p>
          <div className="service-qualification-actions">
            <button type="button" onClick={() => router.push("/engine")}>Open full route →</button>
            {!!result.projects.length && <Link href="/projects">See connected work</Link>}
          </div>
        </div>
      )}
      {result && submittedQuery && !compact && (
        <div className="service-intent-results" aria-live="polite">
          <section>
            <span className="work-kicker">UNDERSTOOD · {result.status.replaceAll("-", " ")}</span>
            <h2>{result.understood.title}</h2>
            <p>{result.understood.summary}</p>
          </section>
          <section>
            <span className="work-kicker">LIKELY ROUTE</span>
            {!!result.route.concepts.length && <p><strong>Resolved concepts:</strong> {result.route.concepts.join(" · ")}</p>}
            {!!result.route.unresolvedTerms.length && <p><strong>Unresolved:</strong> {result.route.unresolvedTerms.join(" · ")}</p>}
            {!!result.route.objective && <p><strong>Objective:</strong> {result.route.objective}</p>}
          </section>
          {!!result.capabilities.length && <section>
            <span className="work-kicker">CAPABILITIES</span>
            <div className="service-module-results">
              {result.capabilities.map((capability) => (
                <article key={capability.hatSlug}>
                  <span>{capability.state.replaceAll("-", " ")}</span>
                  <h3><Link href={`/registry?hat=${capability.hatSlug}`}>{capability.name}</Link></h3>
                  <p>{capability.reason}</p>
                </article>
              ))}
            </div>
          </section>}
          <section>
            <span className="work-kicker">CONNECTED WORK</span>
            {result.projects.length ? result.projects.map((project) => (
              <Link className="service-work-result" href={`/projects/${project.projectSlug}`} key={project.projectSlug}>
                <small>{project.connectionLabel}</small>
                <strong>{project.name}</strong>
                <span>{project.headline} — {project.summary}</span>
                {!!project.additionalContributions.length && <span>
                  Also connected: {project.additionalContributions.map((item) => item.title).join(" · ")}
                </span>}
              </Link>
            )) : <p>No direct previous application is confirmed for this exact route yet.</p>}
          </section>
          {result.refinement && <section>
            <span className="work-kicker">REFINE</span>
            <p>{result.refinement}</p>
          </section>}
        </div>
      )}
    </div>
  );
}
