export default function QuickOverview() {
  return (
    <section style={{ padding: "60px 40px" }}>

      <h2>SYSTEM OVERVIEW</h2>

      <p style={{ opacity: 0.7, maxWidth: 700 }}>
        This system operates across interconnected engineering domains.
        Each domain functions as a modular capability layer.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 30 }}>

        <div>
          <h3>Audio Systems</h3>
          <p>Signal flow, live environments, studio engineering.</p>
        </div>

        <div>
          <h3>Electrical Systems</h3>
          <p>Circuits, embedded systems, hardware design.</p>
        </div>

        <div>
          <h3>Software Systems</h3>
          <p>Backend logic, automation, infrastructure.</p>
        </div>

        <div>
          <h3>Media Systems</h3>
          <p>Interactive environments, experiential design.</p>
        </div>

      </div>

    </section>
  );
}