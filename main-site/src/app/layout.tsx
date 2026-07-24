import type { Metadata } from "next";
import Link from "next/link";
import EngineNavigationLink from "@/components/services/EngineNavigationLink";
import { ServiceEngineSessionProvider } from "@/components/services/ServiceEngineSession";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mike Gold | Engineer",
  description: "Designed by iMG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-white">
        <ServiceEngineSessionProvider>

        {/* =========================
            GLOBAL HEADER v1.1
        ========================== */}
        <header className="site-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderBottom: "1px solid #222",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
          }}
        >

          {/* BRAND (UPDATED BLOCK) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            <Link href="/" aria-label="Mike Gold home"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid #333",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/pfp/mikegold-engineer-festival.webp"
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Link>

          </div>

          {/* NAVIGATION */}
          <nav className="top-nav"
            style={{
              display: "flex",
              gap: "14px",
              fontSize: "14px",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            <Link href="/registry">Hats</Link>
            <EngineNavigationLink />
            <Link href="/projects">Work</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          {/* VERSION SYSTEM */}
          <Link href="/" className="site-version"
            style={{
              fontSize: "12px",
              opacity: 0.6,
              fontFamily: "monospace",
              whiteSpace: "nowrap",
            }}
          >
          |M1K3G01D
          </Link>

        </header>

        {/* PAGE CONTENT */}
       <main style={{ flex: 1 }}>
        <div className="container">
          {children}
        </div>
      </main>
      </ServiceEngineSessionProvider>

      </body>
    </html>
  );
}
