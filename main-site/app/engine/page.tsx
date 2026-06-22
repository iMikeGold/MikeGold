import Footer from "@/components/sections/Footer";

export default function EnginePage() {
  return (
    <main className="page">

      <header className="page-header">
        <h1>SERVICE ENGINE</h1>
        <p>A system that translates intent into structured capability execution.</p>
      </header>

      <section>
        <h2>CORE PRINCIPLE</h2>
        <p>
          Users do not select services.
          They describe outcomes.
        </p>
      </section>

      <section>
        <h2>HOW IT WORKS</h2>
        <p>
          1. Input is interpreted as intent  
          2. Intent is mapped to capability weights  
          3. Relevant systems are activated  
          4. A structured delivery profile is generated
        </p>
      </section>

      <section>
        <h2>EXAMPLE INPUTS</h2>
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
      <Footer />
    </main>
  );
}