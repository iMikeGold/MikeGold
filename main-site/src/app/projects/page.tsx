import WorkExplorer from "@/components/work/WorkExplorer";
import Footer from "@/components/sections/Footer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import { publicWorkCards } from "@/system/generated/public-work-cards.generated";

import { resolveCapabilityGroupId, type CapabilityGroupId } from "@/system/work/capability-groups";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; q?: string; hat?: string; sort?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const initialGroup = (resolveCapabilityGroupId(params.area ?? null) ?? "") as CapabilityGroupId | "";
  const initialSort = params.sort === "name" || params.sort === "newest" || params.sort === "oldest"
    ? params.sort
    : "relevance";
  const requestedLimit = Number(params.limit);
  const initialLimit = Number.isFinite(requestedLimit) && requestedLimit > 7
    ? Math.ceil(requestedLimit / 7) * 7
    : 7;
  return (
    <main>
      <div className="page work-page">
        <WorkExplorer
          projects={publicProjects}
          work={publicWork}
          hats={publicHats}
          cards={publicWorkCards}
          initialGroup={initialGroup}
          initialQuery={params.q ?? ""}
          initialHat={params.hat ?? ""}
          initialSort={initialSort}
          initialLimit={initialLimit}
        />
      </div>
      <Footer />
    </main>
  );
}
