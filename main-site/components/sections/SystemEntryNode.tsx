import Link from "next/link";

export default function SystemEntryNode() {
  return (
    <section className="hero">

      <h1>MIKE GOLD</h1>
      <h2>Systems Architect | Audio. Electrical. Software. Media. Systems.
      </h2>

      <p>What do you want to build?</p>

      <input
        placeholder="Describe a system, product, or idea..."
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "12px",
          background: "#222",
          border: "1px solid #333",
          color: "white"
        }}
      />

      <div style={{ marginTop: 16, opacity: 0.7 }}>
        Suggested:
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