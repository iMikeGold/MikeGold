import WorkExplorer from "@/components/work/WorkExplorer";
import Footer from "@/components/sections/Footer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import { publicWorkCards } from "@/system/generated/public-work-cards.generated";

export default function ProjectsPage() {
  return (
    <main>
      <div className="page work-page">
        <WorkExplorer projects={publicProjects} work={publicWork} hats={publicHats} cards={publicWorkCards} />
      </div>
      <Footer />
    </main>
  );
}
