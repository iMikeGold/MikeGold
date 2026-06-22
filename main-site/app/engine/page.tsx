import Footer from "@/components/sections/Footer";

export default function EnginePage() {
  return (
    <main className="page">

      <header className="page-header">
        <section>
        <h1>SERViCE ENGiNE</h1>
        
        <p>A system that translates your intent into structured capability execution.</p>
        </section>

        <div
          style={{
          padding:10,
          background:"#111",
          border:"1px solid #222",
          borderTop: "1px solid #222",
          borderRadius:10,
          marginBottom:10
          }}
          >

          <div style={{ flex:1, overflowX:"auto", display:"flex", gap:6, paddingBottom:8, minWidth:0 }}> What do you want to build?</div>

          <input
          placeholder="Describe a project, requirement or idea..."
          style={{
          width:"100%",
          padding:20,
          background:"#181818",
          border:"1px solid #333",
          borderRadius:12,
          color:"white",
          fontSize:16
          }}
          />

        </div>
      </header>

      <section>
        <h2>CORE PRiNCiPLE</h2>
        <p>
          Don't just select services.
          Describe the outcomes.
        </p>
      </section>

      <section>
        <h2>HOW iT WORKS</h2>
        <p>
          1. Input is interpreted as intent  
          2. Intent is mapped to capability weights  
          3. Relevant systems are activated  
          4. A structured delivery profile is generated
        </p>
      </section>

      <section>
        <h2>EXAMPLE iNPUTS</h2>
        <p>“I need a live audio system for an installation”</p>
        <p>“I want a scalable backend for media streaming”</p>
        <p>“I need hardware + software integration for a product”</p>
      </section>

      <section>
        <h2>OUTPUT STRUCTURE</h2>
        <p>Capability stack</p>
        <p>Scope breakdown</p>
        <p>System delivery structure</p>
      </section>
      <Footer />
    </main>
  );
}