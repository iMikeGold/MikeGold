import HatRegistry from "@/components/HatRegistry";
import Footer from "@/components/sections/Footer";

export default function RegistryPage() {
  return (
    <main style={{ padding: "40px" }}>

      {/* SYSTEM HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>HAT REGISTRY</h1>

        <p style={{ opacity: 0.7, marginTop: "8px" }}>
          133 capabilities forming a connected system graph.
        </p>

        <p style={{ opacity: 0.5 }}>
          Expand nodes to explore relationships, overlap, and system strength.
        </p>
      </div>

      {/* SYSTEM STATUS BAR (optional but powerful) */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          fontSize: "12px",
          opacity: 0.6
        }}
      >
        <span>● ACTIVE SYSTEM</span>
        <span>● GRAPH MODE</span>
        <span>● 105 NODES LOADED</span>
      </div>

      {/* CORE SYSTEM */}
      <HatRegistry />
      <Footer />
    </main>
  );
}