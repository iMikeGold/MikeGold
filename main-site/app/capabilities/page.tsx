import Footer from "@/components/sections/Footer";

export default function CapabilityPage() {
  return (
    <main className="page">

      <header className="page-header">
        <h1>CORE CAPABILITIES</h1>
        <p>A structured breakdown of all functional domains within the system.</p>
      </header>

      <section>
        <h2>AUDIO ENGINEERING</h2>
        <p>
          Sound design, live systems, studio engineering, signal flow,
          acoustic environments, audio processing, system tuning.
        </p>
        <p>
          Focused on precision in real-world sound environments,
          from live performance to controlled studio systems.
        </p>
      </section>

      <section>
        <h2>MEDIA & EXPERIENCE SYSTEMS</h2>
        <p>
          Audio environments, interactive systems, sensory design,
          live media setups, experiential installations.
        </p>
        <p>
          Where technical systems become experiential outputs.
        </p>
      </section>

      <section>
        <h2>ELECTRICAL & HARDWARE SYSTEMS</h2>
        <p>
          Circuit design, PCB work, embedded systems, physical computing,
          custom hardware builds, power and signal integrity.
        </p>
        <p>
          Covers concept → prototype → functional deployment.
        </p>
      </section>

      <section>
        <h2>SOFTWARE & SYSTEMS ENGINEERING</h2>
        <p>
          Backend systems, automation, infrastructure, data handling,
          runtime logic, deployment workflows.
        </p>
        <p>
          Built for reliability, scalability, and repeatable execution.
        </p>
      </section>

      <section>
        <h2>DESIGN & INTERFACES</h2>
        <p>
          Web systems, UI logic, UX flow, navigation structure,
          interaction design, layout architecture.
        </p>
        <p>
          Focused on clarity, predictability, and structured interaction.
        </p>
      </section>
      < Footer />
    </main>
  );
}