import HatRegistry from "@/components/HatRegistry";
import Footer from "@/components/sections/Footer";

export const dynamic = "force-static";

export default function RegistryPage() {
  return (
    <main className="registry-page">
      <style>{`
        .registry-page > footer {
          margin-top: 0 !important;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "clamp(16px, 3vw, 34px)",
          paddingBottom: 0,
        }}
      >
        <header style={{ marginBottom: 16 }}>
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
            marginBottom: 14,
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
