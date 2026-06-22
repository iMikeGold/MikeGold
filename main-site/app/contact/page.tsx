import Footer from "@/components/sections/Footer";

export default function ContactPage() {
  return (
    <main className="page">

      <header className="page-header">
        <h1>GET iN TOUCH</h1>
        <p>Access point for collaboration and system integration.</p>
      </header>

      <section>
        <section>

      <h2>Email</h2>

      <a
      href="mailto:i@mikegold.co.uk?subject=Project Enquiry"
      >
      i@mikegold.co.uk
      </a>

      </section>

      <section>

      <h2>Integration</h2>

      <p>
      Answer a structured questionnaire and build a delivery profile.
      </p>

      <a href="/integration">
      Begin Integration →
      </a>

      </section>
      </section>
      < Footer />
    </main>
  );
}