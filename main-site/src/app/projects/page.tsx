import WorkExplorer from "@/components/work/WorkExplorer";
import Footer from "@/components/sections/Footer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

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

        <WorkExplorer projects={publicProjects} work={publicWork} hats={publicHats} />

        <section className="links-section">
          <h2>Reference work</h2>
          <ul>
            <li>
              <a href="https://library.protosynthesis.co.uk/" target="_blank" rel="noreferrer">
                ProtoSynthesis research notes
              </a>
            </li>
          </ul>
        </section>
      </div>
      <Footer />
    </main>
  );
}
