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
          gap: "14px",
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
            iD Gravity CORE v3.88
          </div>
        </div>

        {/* CENTRE: SYSTEM STATE */}

        <div
        style={{
        display:"flex",
        flexDirection:"column",
        gap:6,
        fontSize:12,
        opacity:.7
        }}
        >

        <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{
        width:8,
        height:8,
        borderRadius:"50%",
        background:"#22c55e",
        animation:"beaconPulse 3s infinite ease-in-out 0.5s"
        }}/>
        <div>Status : ACTiVE</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{
        width:8,
        height:8,
        borderRadius:"50%",
        background:"#3b82f6",
        animation:"beaconPulse 3s infinite ease-in-out 0.8s"

        }}/>
        <div>Registry : ONLiNE</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div 
        style={{
        width:8,
        height:8,
        borderRadius:"50%",
        background:"#eab308",
        animation:"beaconPulse 3s infinite ease-in-out 1.6s"
        }}
        />
        <div>Engine : READY</div>
        </div>

        </div>

        {/* RIGHT: NAV SHORTCUTS */}
        <div
        style={{
        display:"flex",
        flexDirection:"column",
        gap:4,
        fontSize:12,
        opacity:.7
        }}
        >
        <a href="/registry">Hats</a>
        <a href="/engine">Service</a>
        <a href="/projects">Work</a>
        <a href="/contact">Contact</a>
        </div>
      </div>

      
            

    </footer>
  );
}