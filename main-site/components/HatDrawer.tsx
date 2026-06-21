"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import HatRadar from "@/components/Polygon/HatRadar";
import { getHatProfile } from "@/system/profile/hat-profile";

// ------------------------------
// HELPERS — YOURS, UNCHANGED
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

// ------------------------------
// DRAWER — YOUR FULL CODE, ONLY FIXES ADDED
// ------------------------------
export default function HatDrawer({
  hat,
  relatedHats,
  onSelectHat,
  onClose,
  drawerWidth,
  POLYGON_SIZE
}: any) {
  const [radarHeight, setRadarHeight] = useState(200);
  // ✅ ADDED: Hard limits to stop ballooning
  const MIN_HEIGHT = 160;
  const MAX_HEIGHT = 240; // Never gets taller than this
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // ✅ ADDED: Safe size logic — matches width, stays slim
  const effectivePolygonSize = useMemo(() => {
    const maxWidth = Math.min(drawerWidth - 32, POLYGON_SIZE);
    return Math.max(120, maxWidth);
  }, [drawerWidth, POLYGON_SIZE]);

  // ✅ ADDED: Fixed ratio — height = 85% of width, capped, no gaps
  useEffect(() => {
    const targetHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, effectivePolygonSize * 0.85));
    setRadarHeight(targetHeight);
  }, [effectivePolygonSize]);

  // DRAG LOGIC — YOURS, UNCHANGED, just uses the new limits
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientY - startY.current;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight.current + delta));
      setRadarHeight(newHeight);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = radarHeight;
    document.body.style.cursor = "ns-resize";
  };

  if (!hat) return null;
  const weightScore = formatWeight(hat.weight);
  const tags = flattenTags(hat);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "hidden",
        boxSizing: "border-box",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #222"
      }}
    >
      {/* HEADER — YOURS, EXACTLY */}
      <div
        style={{
          padding: "16px 18px 10px",
          borderBottom: "1px solid #222",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexShrink: 0
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: 17, fontWeight: 600 }}>
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
            width: 26,
            height: 26,
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ×
        </button>
      </div>

      {/* ✅ FIXED: Radar area — slim, tight, no ballooning, no blank space */}
      <div
        style={{
          padding: "4px 0",
          borderBottom: "1px solid #222",
          height: `${radarHeight}px`,
          maxHeight: `${MAX_HEIGHT}px`, // Hard stop
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden"
        }}
      >
        <HatRadar values={getHatProfile(hat)} size={effectivePolygonSize} />
      </div>

      {/* DRAG BAR — YOURS, EXACTLY */}
      <div
        onMouseDown={startDrag}
        style={{
          height: "4px",
          background: "#222",
          cursor: "ns-resize",
          borderTop: "1px solid #333",
          borderBottom: "1px solid #333",
          flexShrink: 0
        }}
      />

      {/* CONTENT — YOURS, FULL, UNCHANGED */}
      <div
        style={{
          padding: "16px 18px",
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          fontSize: "clamp(11px, 1.2vw, 14px)",
          lineHeight: 1.5
        }}
      >
        <p style={{ margin: "0 0 14px 0", opacity: 0.9 }}>
          {hat.description}
        </p>

        <div style={{ margin: "14px 0" }}>
          <strong style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>Tags</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {tags.map((t: string) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  padding: "3px 7px",
                  border: "1px solid #333",
                  borderRadius: 3,
                  background: "#1a1a1a"
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #222", margin: "14px 0" }} />

        <div style={{ margin: "14px 0" }}>
          <strong style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>Overview</strong>
          <p style={{ margin: "6px 0 0 0" }}>{hat.details?.overview}</p>
        </div>

        {hat.details?.capabilities && (
          <div style={{ margin: "14px 0" }}>
            <strong style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>Capabilities</strong>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 16 }}>
              {hat.details.capabilities.map((c: string) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        )}

        {hat.details?.usedFor && (
          <div style={{ margin: "14px 0" }}>
            <strong style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>Used For</strong>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 16 }}>
              {hat.details.usedFor.map((u: string) => <li key={u}>{u}</li>)}
            </ul>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid #222", margin: "14px 0" }} />

        <div>
          <strong style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>Related Nodes</strong>
          {relatedHats.map((r: any) => (
            <div
              key={r.hat.id}
              onClick={() => onSelectHat(r.hat)}
              style={{
                marginTop: 8,
                padding: 10,
                border: "1px solid #333",
                borderRadius: 3,
                cursor: "pointer",
                background: "#151515"
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 12 }}>{r.hat.name}</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Strength: {r.strength}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}