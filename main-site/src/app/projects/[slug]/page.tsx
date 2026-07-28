import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import BjorrIdentityLanguage from "@/components/work/BjorrIdentityLanguage";
import ProjectContextBackLink from "@/components/work/ProjectContextBackLink";
import ProjectWorkArchive from "@/components/work/ProjectWorkArchive";
import { publicEvidence } from "@/system/generated/public-evidence.generated";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

// OpenNext must be allowed to resolve the generated project slugs at request
// time. Closing the route with `dynamicParams = false` caused the Worker to
// return its 404 page for every otherwise valid `/projects/<slug>` URL.
export const dynamicParams = true;

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
          <ProjectWorkArchive work={work} hats={publicHats} evidence={publicEvidence} />
        </section>
      </article>
      <Footer />
    </main>
  );
}
