import ServiceIntentExplorer from "@/components/services/ServiceIntentExplorer";
import HomeSuggestions from "@/components/services/HomeSuggestions";

export default function SystemEntryNode() {
  return (
    <section className="hero">

      <h1>MiKE GOLD</h1>
      <h2>Systems Architect | Audio. Electrical. Media. Software.
      </h2>

      <ServiceIntentExplorer compact />
      <HomeSuggestions />

    </section>
  );
}
