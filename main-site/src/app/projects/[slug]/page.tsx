import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import BjorrIdentityLanguage from "@/components/work/BjorrIdentityLanguage";
import ProjectCaseStudy from "@/components/work/ProjectCaseStudy";
import ProjectContextBackLink from "@/components/work/ProjectContextBackLink";
import ProjectWorkArchive from "@/components/work/ProjectWorkArchive";
import { publicEvidence } from "@/system/generated/public-evidence.generated";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import type { ProjectCaseStudyRecord } from "@/system/projects/project-case-study.types";
import caseStudyRecords from "../../../../records/presentation/project-case-studies.json";
import projectMediaRecords from "../../../../records/presentation/project-media.json";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

type ProjectMediaRecord = {
  projectSlug?: string;
  assetPath: string;
  label: string;
};

const projectBySlug = new Map(publicProjects.map((project) => [project.slug, project]));
const evidenceBySlug = new Map(publicEvidence.map((evidence) => [evidence.slug, evidence]));
const hatBySlug = new Map(publicHats.map((hat) => [hat.slug, hat]));
const caseStudyByProjectSlug = new Map(
  (caseStudyRecords as ProjectCaseStudyRecord[]).map((caseStudy) => [caseStudy.projectSlug, caseStudy]),
);
const projectMediaByProjectSlug = new Map<string, ProjectMediaRecord>();
for (const media of projectMediaRecords as ProjectMediaRecord[]) {
  if (media.projectSlug && !projectMediaByProjectSlug.has(media.projectSlug)) {
    projectMediaByProjectSlug.set(media.projectSlug, media);
  }
}
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
  const caseStudy = caseStudyByProjectSlug.get(project.slug);
  const currentMedia = projectMediaByProjectSlug.get(project.slug);
  const presentedCaseStudy = caseStudy && currentMedia
    ? {
        ...caseStudy,
        heroImage: {
          src: currentMedia.assetPath,
          alt: caseStudy.heroImage?.alt ?? currentMedia.label,
          caption: caseStudy.heroImage?.caption ?? currentMedia.label,
        },
      }
    : caseStudy;

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

        {presentedCaseStudy && (
          <ProjectCaseStudy
            caseStudy={presentedCaseStudy}
            work={work}
            hats={hats}
            evidence={evidence}
          />
        )}

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
