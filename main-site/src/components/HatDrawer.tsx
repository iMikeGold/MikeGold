"use client";

import { useMemo } from "react";
import HatRadar from "@/components/Polygon/HatRadar";
import { combineHatProfiles } from "@/system/services/polygon-engine";
import { getHatProfile } from "@/system/profile/hat-profile";
import { calculateWeight } from "@/system/services/weights";
import { PROFILE_AXES, type HatProfile } from "@/system/profile/hat-profile";
import {
  interpretHatProfile,
  PROFILE_AXIS_COLOURS,
  PROFILE_AXIS_MEANINGS,
} from "@/system/services/profile-interpreter";

// ------------------------------
// HELPERS — UNCHANGED
// ------------------------------
function flattenTags(hat: any): string[] {
  if (!hat?.tags) return [];
  return [
    ...(hat.tags.core || []),
    ...(hat.tags.adjacent || []),
    ...(hat.tags.meta || [])
  ];
}

// ------------------------------
// DRAWER — FULL CODE, ONLY FIXES ADDED
// ------------------------------
export default function HatDrawer({
  hat,
  selectedHats,
  relatedHats,
  onSelectHat,
  onClose,
  drawerWidth,
  POLYGON_SIZE
}: any) {
  const effectivePolygonSize = useMemo(() => {
    const maxWidth = Math.min(drawerWidth - 24, Math.max(POLYGON_SIZE, 240));
    return Math.max(180, maxWidth);
  }, [drawerWidth, POLYGON_SIZE]);

  if (!hat) return null;
  const weightScore = calculateWeight(hat);
  const tags = flattenTags(hat);
  const polygonHats = selectedHats.length ? selectedHats : [hat];
  const polygonValues = combineHatProfiles(polygonHats);
  const interpretation = interpretHatProfile(
    polygonValues as HatProfile,
    polygonHats.map((item: any) => item.name),
  );
  const colorForHat = (id: string) => {
    const hue = [...id].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 360, 0);
    return `hsl(${hue} 82% 66%)`;
  };
  const polygonLayers = polygonHats.slice(0, 8).map((item: any) => ({ values: getHatProfile(item), color: colorForHat(item.id) }));

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
      {/* HEADER — EXACTLY */}
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
          {selectedHats.length > 1 && (
            <div style={{ fontSize: 11, color: "#60a5fa", marginTop: 4 }}>
              Combined capability profile · {selectedHats.length} hats
            </div>
          )}
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

      {/* FIXED: Radar area — slim, tight, no ballooning, no blank space */}
      <div
        style={{
          padding: "4px 0",
          borderBottom: "1px solid #222",
          minHeight: `${effectivePolygonSize + 8}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden"
        }}
      >
        <HatRadar values={polygonValues} layers={polygonLayers} size={effectivePolygonSize} />
      </div>

      {/* CONTENT — FULLY UNCHANGED */}
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

        <details className="polygon-key">
          <summary>Read this capability graph</summary>
          <p className="polygon-interpretation">{interpretation.summary}</p>
          <div className="polygon-axis-key">
            {PROFILE_AXES.map((axis, index) => (
              <div key={axis}>
                <i style={{ background: PROFILE_AXIS_COLOURS[index] }} />
                <span><strong>{axis}</strong> · {polygonValues[index].toFixed(1)}</span>
                <small>{PROFILE_AXIS_MEANINGS[axis]}</small>
              </div>
            ))}
          </div>
          {polygonHats.length > 1 && (
            <p className="polygon-layer-note">
              The solid blue shape is the combined profile. The quieter coloured outlines show each selected Hat so their contribution remains visible.
            </p>
          )}
        </details>

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
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                Affinity: {Math.round(r.strength * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
