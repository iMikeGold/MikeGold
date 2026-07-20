import Footer from "@/components/sections/Footer";
import ServiceIntentExplorer from "@/components/services/ServiceIntentExplorer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

export default function EnginePage() {
  return (
    <main>
      <div className="page service-engine-page">
        <header className="page-header">
          <p className="work-kicker">INTENT → CAPABILITY → APPLIED WORK</p>
          <h1>SERViCE ENGiNE</h1>
          <p>Describe the outcome or problem. The engine maps it to relevant Hats and work already recorded in the portfolio.</p>
        </header>
        <ServiceIntentExplorer hats={publicHats} projects={publicProjects} work={publicWork} />

        <section>
          <h2>CORE PRiNCiPLE</h2>
          <p>
            Don&apos;t just select services.
            Describe the outcomes.
          </p>
        </section>

        <section>
          <h2>HOW iT WORKS</h2>
          <p>
            1. Input is interpreted as intent<br />
            2. Intent is mapped to capability weights<br />
            3. Relevant systems are activated<br />
            4. A structured delivery profile is generated
          </p>
        </section>

        <section>
          <h2>EXAMPLE iNPUTS</h2>
          <p>“I need a live audio system for an installation”</p>
          <p>“I want a scalable backend for media streaming”</p>
          <p>“I need hardware + software integration for a product”</p>
        </section>

        <section>
          <h2>OUTPUT STRUCTURE</h2>
          <p>Capability stack</p>
          <p>Scope breakdown</p>
          <p>System delivery structure</p>
        </section>

        <section className="service-engine-explanation">
          <h2>CONNECTED RECORDS</h2>
          <p>
            The results use the same Hat records and Project → Work relationships
            as the Registry and Work archive. Supporting material remains behind
            each project and loads only when requested.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
