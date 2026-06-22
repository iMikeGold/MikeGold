import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">

        {/* =========================
            GLOBAL HEADER v1.1
        ========================== */}
        <header
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

            <div
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
                src="/images/1517537470883.jpg"
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

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
            <Link href="/">Home</Link>
            <Link href="/about">Intel</Link>
            <Link href="/capabilities">Able</Link>
            <Link href="/registry">Hats</Link>
            <Link href="/engine">Engine</Link>
            <Link href="/projects">Work</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          {/* VERSION SYSTEM */}
          <div
            style={{
              fontSize: "12px",
              opacity: 0.6,
              fontFamily: "monospace",
              whiteSpace: "nowrap",
            }}
          >
          | M1K3 G01D
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

      </body>
    </html>
  );
}