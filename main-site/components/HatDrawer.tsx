// ==================================================
// iD Gravity Core — Hat Drawer v2.4
// Graph-Aware Display Layer • Fixed Polygon • Optimised Layout
// ==================================================

"use client";

import { useState } from "react";
import HatRadar from "@/components/Polygon/HatRadar";
import { getHatProfile } from "@/system/profile/hat-profile";

// ------------------------------
// Helpers (unchanged — logic preserved)
// ------------------------------
function flattenTags(hat: any): string[] {
  if (!hat?.tags) return [];
  return [
    ...(hat.tags.core || []),
    ...(hat.tags.adjacent || []),
    ...(hat.tags.meta || [])
  ];
}

function formatWeight(weight: any): number {
  if (!weight) return 0;
  const { base = 0, experience = 0, rarity = 0 } = weight;
  return (base * 0.5) + (experience * 0.3) + (rarity * 0.2);
}

function formatNumber(n: any) {
  if (typeof n === "number") return n.toFixed(2);
  return "0.00";
}

// ------------------------------
// Component
// ------------------------------
export default function HatDrawer({
  hat,
  relatedHats,
  onSelectHat,
  onClose
}: any) {
  const [hoveredRelated, setHoveredRelated] = useState<any>(null);

  if (!hat) return null;

  const weightScore = formatWeight(hat.weight);
  const tags = flattenTags(hat);

  return (
    <div
      style={{
        color: "#fff",
        background: "#111",
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 400,
        zIndex: 1000,
        overflowY: "hidden",
        boxSizing: "border-box",
        borderLeft: "1px solid #222",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        padding: 0
      }}
    >
      {/* HEADER BAR — Fixed at top */}
      <div
        style={{
          padding: "20px 20px 12px",
          borderBottom: "1px solid #222",
          background: "#111",
          position: "sticky",
          top: 0,
          zIndex: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 600 }}>
            {hat.name}
          </h2>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {hat.category} • {hat.type} • Score {weightScore.toFixed(2)}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "#222",
            border: "none",
            color: "#fff",
            width: 28,
            height: 28,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0
          }}
        >
          ×
        </button>
      </div>

      {/* ✅ FIXED POLYGON / RADAR — stays in place, content scrolls under it */}
      <div
        style={{
          padding: "16px 20px",
          background: "#111",
          borderBottom: "1px solid #222",
          position: "sticky",
          top: "64px",
          zIndex: 2,
          textAlign: "center"
        }}
      >
        <HatRadar values={getHatProfile(hat)} />
      </div>

      {/* SCROLLABLE CONTENT AREA — scrolls UP INTO the fixed polygon */}
      <div
        style={{
          padding: "20px",
          flex: 1,
          overflowY: "auto",
          position: "relative",
          zIndex: 1
        }}
      >
        <p style={{ marginTop: 0, marginBottom: 20, lineHeight: 1.5, opacity: 0.9 }}>
          {hat.description}
        </p>

        <hr style={{ border: "none", borderTop: "1px solid #222", margin: "20px 0" }} />

        {/* TAGS */}
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 13, textTransform: "uppercase", opacity: 0.6 }}>Tags</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {tags.map((t: string) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  border: "1px solid #333",
                  borderRadius: 6,
                  opacity: 0.85,
                  background: "#1a1a1a"
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #222", margin: "20px 0" }} />

        {/* OVERVIEW */}
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 13, textTransform: "uppercase", opacity: 0.6 }}>Overview</strong>
          <p style={{ marginTop: 8, lineHeight: 1.5 }}>{hat.details?.overview}</p>
        </div>

        {/* CAPABILITIES */}
        {hat.details?.capabilities && (
          <div style={{ marginBottom: 20 }}>
            <strong style={{ fontSize: 13, textTransform: "uppercase", opacity: 0.6 }}>Capabilities</strong>
            <ul style={{ marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              {hat.details.capabilities.map((c: string) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* USE CASES */}
        {hat.details?.usedFor && (
          <div style={{ marginBottom: 20 }}>
            <strong style={{ fontSize: 13, textTransform: "uppercase", opacity: 0.6 }}>Used For</strong>
            <ul style={{ marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              {hat.details.usedFor.map((u: string) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid #222", margin: "20px 0" }} />

        {/* RELATED HATS (GRAPH VIEW) */}
        <div>
          <strong style={{ fontSize: 13, textTransform: "uppercase", opacity: 0.6 }}>Related Nodes</strong>

          {relatedHats.map((r: any) => (
            <div
              key={r.hat.id}
              onClick={() => onSelectHat(r.hat)}
              onMouseEnter={() => setHoveredRelated(r.hat)}
              onMouseLeave={() => setHoveredRelated(null)}
              style={{
                marginTop: 10,
                padding: 12,
                border: "1px solid #333",
                borderRadius: 6,
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s ease",
                background: "#151515"
              }}
            >
              <div style={{ fontWeight: 500 }}>{r.hat.name}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Strength: {r.strength}</div>

              {hoveredRelated?.id === r.hat.id && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    fontSize: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: "#ddd",
                    lineHeight: 1.4
                  }}
                >
                  {r.hat.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}