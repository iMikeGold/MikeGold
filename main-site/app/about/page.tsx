import Footer from "@/components/sections/Footer";

export default function AboutPage() {
  return (
    <main className="page">

      <header className="page-header">
        <h1>ABOUT</h1>
        <p>Systems originate from a need to connect disciplines into one working structure.</p>
      </header>

      <section>
        <p>
          Audio engineering and electrical engineering were the starting point.
          Everything else evolved from solving real system problems.
        </p>

        <p>
          The focus is not individual disciplines, but how they integrate into complete systems.
        </p>
      </section>

      <section>
        <h2>PHILOSOPHY</h2>
        <p>
          Build systems that behave predictably under real-world conditions.
        </p>
      </section>

      <footer>
        <p>Return to navigation bar to continue exploring the system.</p>
      </footer>

      <Footer />
    </main>
  );
}