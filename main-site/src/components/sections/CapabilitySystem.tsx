import Link from "next/link";

export default function CapabilityCards() {
  return (
    <section style={{ padding: "60px 40px" }}>

      <h2>CORE CAPABiLiTY SYSTEMS</h2>

      <p style={{ opacity: 0.7, maxWidth: 700 }}>
        These are functional domains within the system.
        Each one expands into a full operational layer.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 30 }}>

        <Link href="/capabilities">
          <div style={card}>
            <h3>Audio Engineering</h3>
            <p>Signal flow, live systems, studio environments.</p>
          </div>
        </Link>

        <Link href="/capabilities">
          <div style={card}>
            <h3>Electrical Systems</h3>
            <p>Hardware, circuits, embedded design.</p>
          </div>
        </Link>

        <Link href="/capabilities">
          <div style={card}>
            <h3>Software Systems</h3>
            <p>Backend logic, automation, infrastructure.</p>
          </div>
        </Link>

        <Link href="/capabilities">
          <div style={card}>
            <h3>Design Systems</h3>
            <p>UI, UX, interaction structure.</p>
          </div>
        </Link>

        <Link href="/capabilities">
          <div style={card}>
            <h3>Media Systems</h3>
            <p>Experience design, interactive environments.</p>
          </div>
        </Link>

      </div>

    </section>
  );
}

const card: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #222",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "0.2s",
};