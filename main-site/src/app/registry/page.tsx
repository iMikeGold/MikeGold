import HatRegistry from "@/components/HatRegistry";
import Footer from "@/components/sections/Footer";

export const dynamic = "force-static";

export default function RegistryPage() {
  return (
    <main>
      <div
        style={{
          width: "100%",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 40px)",
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>HAT REGiSTRY</h1>
          <p style={{ opacity: 0.7, margin: "8px 0 0" }}>
            133 capabilities forming a connected system graph.
          </p>
          <p style={{ opacity: 0.5, margin: "4px 0 0" }}>
            Expand nodes to explore relationships, overlap, and system strength.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 14px",
            marginBottom: 18,
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          <span>● ACTIVE SYSTEM</span>
          <span>● GRAPH MODE</span>
          <span>● 105 NODES LOADED</span>
        </div>

        <HatRegistry />
      </div>
      <Footer />
    </main>
  );
}
