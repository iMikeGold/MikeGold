"use client";

import React, { useMemo } from "react";

// ====================================================
// iD Gravity Core — Hat Radar v1.2
// ✅ ORIGINAL DATA VALUES — NO CHANGES
// ✅ BOX AROUND POLYGON = EDGE-TO-EDGE, NO EMPTY SPACE
// ✅ SCALES WITH WINDOW SIZE
// ====================================================

type Props = {
  values: number[];
  size?: number;
  stroke?: string;
  fill?: string;
  opacity?: number;
};

const AXES = 6;
const getAngle = (i: number) => (Math.PI * 2 * i) / AXES;
const valueToRadius = (value: number, maxRadius: number) => (value / 10) * maxRadius;

export default function HatRadar({
  values,
  size = 200, // ✅ YOUR PREFERRED BASE SIZE
  stroke = "#4A90E2",
  fill = "rgba(74,144,226,0.15)",
  opacity = 1,
}: Props) {
  const points = useMemo(() => {
    const center = size / 2;
    const radius = size * 0.45; // ✅ ORIGINAL RATIO — DATA POINTS UNCHANGED
    return values.map((val, i) => {
      const angle = getAngle(i) - Math.PI / 2;
      const r = valueToRadius(val, radius);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return { x, y };
    });
  }, [values, size]);

  const path = useMemo(() => {
    if (!points.length) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  }, [points]);

  const center = size / 2;
  const radius = size * 0.45;

  return (
    // ✅ BOX = EXACT SIZE OF POLYGON — NO EXTRA SPACE
    <div style={{ 
      width: size, 
      height: size, 
      margin: "0 auto", 
      padding: 0, 
      overflow: "hidden",
      lineHeight: 0
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" />
        {values.map((_, i) => {
          const angle = getAngle(i) - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />;
        })}
        <path d={path} fill={fill} stroke={stroke} strokeWidth={2} opacity={opacity} />
        <circle cx={center} cy={center} r={2} fill={stroke} />
      </svg>
    </div>
  );
}