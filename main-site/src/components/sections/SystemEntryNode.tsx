import ServiceIntentExplorer from "@/components/services/ServiceIntentExplorer";
import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";

export default function SystemEntryNode() {
  return (
    <section className="hero">

      <h1>MiKE GOLD</h1>
      <h2>Systems Architect | Audio. Electrical. Media. Software.
      </h2>

      <ServiceIntentExplorer hats={publicHats} projects={publicProjects} work={publicWork} compact />

      <div style={{ marginTop: 16, opacity: 0.7, marginBottom: 16}}>
        Suggestions:
        <ul>
          <li>Audio system for live performance</li>
          <li>Backend infrastructure for media</li>
          <li>Interactive installation</li>
          <li>Hardware + software product</li>
        </ul>
      </div>

    </section>
  );
}
