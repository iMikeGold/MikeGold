import Footer from "@/components/sections/Footer";

export default function ContactPage() {
  return (
    <main>
      <div className="page">

      <header className="page-header">
        <h1>GET iN TOUCH</h1>
        <p>Access point for collaboration and system integration.</p>
      </header>

      <section>
        <section>

      <section>

         <div style={{ flex:1, overflowX:"auto", display:"flex", gap:6, paddingBottom:8, minWidth:0 }}> <h2>Contact</h2>
         </div>

        <a
        href="mailto:i@mikegold.co.uk?subject=Project Enquiry"
        style={{
        display:"inline-block",
        padding:"12px 18px",
        border:"1px solid #333",
        borderRadius:8
        }}
        >
        eMail →
        </a>

        </section>


      <section>

        <h2>Integration</h2>

        <div style={{ flex:1, overflowX:"auto", display:"flex", gap:6, paddingBottom:8, minWidth:0 }}> <p>
        Answer a structured questionnaire and build a delivery profile.
        </p> </div>

        <a
        href="/integration"
        style={{
        display:"inline-block",
        padding:"12px 18px",
        border:"1px solid #333",
        borderRadius:8
        }}
        >
        Begin Integration →
        </a>

        </section>

      </section>
      </section>

    </div>
  <Footer />
    </main>
  );
}