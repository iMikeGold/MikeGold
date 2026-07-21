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
        <header className="page-header work-page-header">
          <p className="work-kicker">SYSTEMS DELIVERED</p>
          <h1>WORK</h1>
          <p>
            A growing record of products, identities, applications,
            infrastructure and engineering environments I have designed, built,
            deployed or helped bring into operation.
          </p>
        </header>

        <WorkExplorer projects={publicProjects} work={publicWork} hats={publicHats} cards={publicWorkCards} />
      </div>
      <Footer />
    </main>
  );
}
