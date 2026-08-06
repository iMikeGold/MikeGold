import HatRegistry from "@/components/HatRegistry";
import Footer from "@/components/sections/Footer";
import { hats } from "@/system/registry";

export const dynamic = "force-static";

export default function RegistryPage() {
  return (
    <main className="registry-page">
      <style>{`
        .registry-page > footer {
          margin-top: 0 !important;
        }

        .registry-shell {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: clamp(10px, 2vw, 22px) clamp(12px, 3vw, 34px) 0;
        }

        .registry-intro {
          display: grid;
          gap: 4px;
          margin-bottom: 10px;
        }

        .registry-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 7px 12px;
        }

        .registry-title-row h1 {
          margin: 0;
          font-size: clamp(1rem, 2vw, 1.12rem);
          font-weight: 500;
        }

        .registry-live-count {
          color: #777;
          font-size: .68rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .registry-intro p {
          margin: 0;
          color: #8d8d8d;
          font-size: clamp(.78rem, 1.5vw, .9rem);
        }

        .registry-page #hat-registry-root {
          height: max(620px, calc(100dvh - 158px));
        }

        .registry-page .hat-tile {
          padding: 0;
        }

        .registry-page [data-hat-tile-face] {
          position: relative;
          z-index: 1;
        }

        .registry-page [data-hat-tile-face] > div {
          inset: 1px !important;
          width: auto !important;
          height: auto !important;
        }

        .registry-page [data-hat-tile-face] > div:first-child > strong {
          display: block;
          max-width: 100%;
          padding: 0 4px;
          overflow: hidden;
          overflow-wrap: anywhere;
          line-height: 1.15 !important;
        }

        .registry-page .hat-tile > [data-hat-tile-face] + div {
          inset: 1px !important;
          z-index: 20 !important;
          padding: 7px !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: none;
          transform: translateZ(2px);
        }

        .registry-page .hat-tile > [data-hat-tile-face] + div > span {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: normal;
          line-height: 1.2;
        }

        @media (max-width: 720px) {
          .registry-shell {
            padding-top: 9px;
          }

          .registry-intro {
            margin-bottom: 8px;
          }
        }
      `}</style>

      <div className="registry-shell">
        <header className="registry-intro">
          <div className="registry-title-row">
            <h1>HAT REGiSTRY</h1>
            <span className="registry-live-count">{hats.length} Hats</span>
          </div>
          <p>Expand nodes to explore relationships, overlap, and system strength.</p>
        </header>

        <HatRegistry />
      </div>
      <Footer />
    </main>
  );
}
