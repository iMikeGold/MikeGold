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

function refineCaseStudy(caseStudy: ProjectCaseStudyRecord): ProjectCaseStudyRecord {
  if (caseStudy.projectSlug === "metroplist") {
    return {
      ...caseStudy,
      chapterOrder: ["media", "highlights", "gallery"],
      mediaSections: [
        {
          eyebrow: "BRAND LANGUAGE EVOLUTION",
          title: "A visual language for translating density and place",
          description: "Selected development studies record the fold, layered density and spatial grammar before that language is applied to data translation and comparison.",
          layout: "grid",
          images: [
            {
              src: "/images/projects/metroplist/branding_language/metroplist-concept-d-density-master-foundation-builds.webp",
              alt: "Metroplist visual-language foundation studies",
              caption: "Foundation studies",
            },
            {
              src: "/images/projects/metroplist/branding_language/metroplist-concept-d-density-master-transparent-preview.webp",
              alt: "Metroplist transparent density language study",
              caption: "Layered density study",
            },
            {
              src: "/images/projects/metroplist/branding_language/metroplist-concept-d-density-master1.webp",
              alt: "Metroplist selected visual-language direction",
              caption: "Selected direction",
            },
            {
              src: "/images/projects/metroplist/branding_language/metroplist-concept-d-density-master2-language-explained.webp",
              alt: "Metroplist visual language explained",
              caption: "Language explained",
            },
          ],
        },
      ],
    };
  }
  if (caseStudy.projectSlug === "community-supplies") {
    return { ...caseStudy, chapterOrder: ["highlights", "gallery"] };
  }
  if (caseStudy.projectSlug === "saveours") {
    return {
      ...caseStudy,
      highlights: caseStudy.highlights?.map((highlight) =>
        highlight.title === "Coded identity"
          ? {
              ...highlight,
              description: "The identity moves from the original commissioned SOS Morse-code mark into a wider SaveOurS coded language.",
            }
          : highlight,
      ),
      mediaSections: caseStudy.mediaSections?.map((section) =>
        section.eyebrow === "CODED IDENTITY LANGUAGE"
          ? {
              ...section,
              title: "From the original commissioned SOS Morse code to a SaveOurS code",
              description: "The original commission established an SOS Morse-code mark. The later identity develops that construction into SaveOurS as a wider coded language.",
              images: section.images.map((image, index) =>
                index === 1
                  ? {
                      ...image,
                      alt: "SaveOurS coded identity construction",
                      caption: "SaveOurS coded construction",
                    }
                  : image,
              ),
            }
          : section,
      ),
    };
  }
  return caseStudy;
}

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

export default async function ProjectRecordPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const rawCaseStudy = caseStudyByProjectSlug.get(project.slug);
  const caseStudy = rawCaseStudy ? refineCaseStudy(rawCaseStudy) : undefined;
  const currentMedia = projectMediaByProjectSlug.get(project.slug);
  const presentedCaseStudy = caseStudy
    ? {
        ...caseStudy,
        heroImage: caseStudy.heroImage ?? (currentMedia
          ? { src: currentMedia.assetPath, alt: currentMedia.label, caption: currentMedia.label }
          : undefined),
      }
    : undefined;

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

        {presentedCaseStudy && <ProjectCaseStudy caseStudy={presentedCaseStudy} />}
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
