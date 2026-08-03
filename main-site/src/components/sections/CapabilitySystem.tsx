import Link from "next/link";

const capabilities = [
  {
    title: "Audio Engineering",
    summary: "Signal flow, live systems, studio environments.",
  },
  {
    title: "Electrical Systems",
    summary: "Hardware, circuits, embedded design.",
  },
  {
    title: "Software Systems",
    summary: "Backend logic, automation, infrastructure.",
  },
  {
    title: "Design Systems",
    summary: "UI, UX, interaction structure.",
  },
  {
    title: "Media Systems",
    summary: "Experience design, interactive environments.",
  },
] as const;

export default function CapabilitySystem() {
  return (
    <section className="core-capability-system">
      <h2>CORE CAPABiLiTY SYSTEMS</h2>

      <p className="core-capability-system-intro">
        These are functional domains within the system. Each one expands into a
        full operational layer.
      </p>

      <div className="core-capability-system-grid">
        {capabilities.map((capability) => (
          <Link
            href="/capabilities"
            className="core-capability-system-link"
            key={capability.title}
          >
            <article className="core-capability-system-card">
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
