import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import EvidenceDisclosure from "@/components/work/EvidenceDisclosure";
import { publicEvidence } from "@/system/generated/public-evidence.generated";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = publicProjects.find((candidate) => candidate.slug === slug);
  if (!project) notFound();

  const work = publicWork.filter((item) => item.projectSlug === project.slug);
  const hatBySlug = new Map(publicHats.map((hat) => [hat.slug, hat]));
  const evidenceBySlug = new Map(publicEvidence.map((item) => [item.slug, item]));

  return (
    <main>
      <article className="page project-record-page">
        <Link className="record-back-link" href="/projects">
          ← All work
        </Link>
        <header className="project-record-hero">
          <div className="record-status-row">
            <span>{project.status.replaceAll("-", " ")}</span>
            <span>{project.context ?? project.establishedYear ?? "Period being documented"}</span>
          </div>
          <h1>{project.name}</h1>
          <p>{project.summary}</p>
          {project.liveUrl && (
            <a className="project-live-link" href={project.liveUrl} target="_blank" rel="noreferrer">
              Visit live project ↗
            </a>
          )}
        </header>

        <section>
          <p className="work-kicker">MY CONTRIBUTION</p>
          <h2>Documented work</h2>
          <div className="project-work-sections">
            {work.map((item) => (
              <article key={item.slug} className="project-work-section">
                <div className="record-status-row">
                  <span>{item.status.replaceAll("-", " ")}</span>
                  <span>Work contribution</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>

                {!!item.appliedHatSlugs.length && (
                  <div className="applied-hat-list" aria-label="Applied Hats">
                    {item.appliedHatSlugs.map((hatSlug) => (
                      <span key={hatSlug}>{hatBySlug.get(hatSlug)?.name ?? hatSlug}</span>
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

                <EvidenceDisclosure
                  evidence={item.evidenceSlugs.flatMap((evidenceSlug) => {
                    const evidence = evidenceBySlug.get(evidenceSlug);
                    return evidence ? [evidence] : [];
                  })}
                />
              </article>
            ))}
          </div>
        </section>
      </article>
      <Footer />
    </main>
  );
}
