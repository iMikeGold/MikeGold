import Footer from "@/components/sections/Footer";
import ServiceIntentExplorer from "@/components/services/ServiceIntentExplorer";
import EngineLandingContent from "@/components/services/EngineLandingContent";

export default function EnginePage() {
  return (
    <main>
      <div className="page service-engine-page">
        <header className="page-header">
          <p className="work-kicker">INTENT → CONFIGURATION → DELIVERY ROUTE → EXPERIENCE</p>
          <h1>SERViCE ENGiNE</h1>
          <p>Describe the outcome or problem. The engine assembles a delivery route, connects the capabilities it requires and finds experience that can inform it.</p>
        </header>
        <ServiceIntentExplorer />
        <EngineLandingContent />
      </div>
      <Footer />
    </main>
  );
}
