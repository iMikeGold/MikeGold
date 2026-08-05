import WorkExplorer from "@/components/work/WorkExplorer";
import Footer from "@/components/sections/Footer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import { publicWorkCards } from "@/system/generated/public-work-cards.generated";
import type { ProjectCaseStudyRecord } from "@/system/projects/project-case-study.types";
import caseStudyRecords from "../../../records/presentation/project-case-studies.json";
import projectMediaRecords from "../../../records/presentation/project-media.json";

export const dynamic = "force-static";

type ProjectMediaRecord = {
  projectSlug?: string;
  assetPath: string;
  label: string;
};

const caseStudyByProjectSlug = new Map(
  (caseStudyRecords as ProjectCaseStudyRecord[]).map((caseStudy) => [caseStudy.projectSlug, caseStudy]),
);

const projectMediaByProjectSlug = new Map<string, ProjectMediaRecord>();
for (const media of projectMediaRecords as ProjectMediaRecord[]) {
  if (media.projectSlug && !projectMediaByProjectSlug.has(media.projectSlug)) {
    projectMediaByProjectSlug.set(media.projectSlug, media);
  }
}

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
}) => {
  const caseStudy = lensId ? undefined : caseStudyByProjectSlug.get(projectSlug);
  const currentMedia = lensId ? undefined : projectMediaByProjectSlug.get(projectSlug);
  const featuredOrder = caseStudy?.featuredOrder;
  const heroSrc = currentMedia?.assetPath ?? caseStudy?.heroImage?.src;
  const heroAlt = caseStudy?.heroImage?.alt ?? currentMedia?.label ?? `${projectName} project`;

  return {
    projectSlug,
    lensId,
    projectName,
    contributionTitle,
    summary,
    relevantWorkSlugs,
    leadHatSlugs,
    supportingHatSlugs,
    primaryVisual: heroSrc
      ? {
          evidenceSlug: `case-study-${projectSlug}`,
          src: heroSrc,
          alt: heroAlt,
          evidenceType: "image" as const,
        }
      : primaryVisual,
    evidenceCompletenessScore,
    editorialSequence: featuredOrder ?? editorialSequence,
    finalScore: featuredOrder ? 1000 - featuredOrder : finalScore,
    href,
  };
});

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
