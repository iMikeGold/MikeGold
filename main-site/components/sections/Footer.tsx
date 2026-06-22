export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "20px",
        padding: "20px",
        borderTop: "1px solid #222",
        background: "#0a0a0a",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* LEFT: IDENTITY */}
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            MiKE GOLD
          </div>

          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Audio · Electrical · Media · Software · Systems
          </div>

          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 6 }}>
            iD Gravity CORE v1.0
          </div>
        </div>

        {/* CENTRE: SYSTEM STATE */}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          <div>🟢 Status: ACTIVE </div>
          <div>🔵 Registry: ONLINE</div>
          <div>🟡 Engine: READY</div>
        </div>

        {/* RIGHT: NAV SHORTCUTS */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          <a href="/registry">Registry</a>
          <a href="/engine">Engine</a>
          <a href="/projects">Projects</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}