"use client";

import React, { useMemo } from "react";

/**
 * 6-axis polygon renderer
 * Input: [Depth, Creativity, Scale, Interaction, Structure, Influence]
 */

type Props = {
  values: number[]; // must be length 6, 0–10 scale
  size?: number; // width/height of SVG
  stroke?: string;
  fill?: string;
  opacity?: number;
};

const AXES = 6;

// Fixed layout (evenly spaced angles)
const getAngle = (i: number) => (Math.PI * 2 * i) / AXES;

// Convert value → radius distance
const valueToRadius = (value: number, maxRadius: number) => {
  return (value / 10) * maxRadius;
};

export default function HatRadar({
  values,
  size = 260,
  stroke = "#4A90E2",
  fill = "rgba(74,144,226,0.15)",
  opacity = 1,
}: Props) {
  const points = useMemo(() => {
    const center = size / 2;
    const radius = size * 0.38; // leave padding

    return values.map((val, i) => {
      const angle = getAngle(i) - Math.PI / 2; // rotate so first axis is top
      const r = valueToRadius(val, radius);

      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;

      return { x, y };
    });
  }, [values, size]);

  const path = useMemo(() => {
    if (!points.length) return "";

    return (
      points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ") + " Z"
    );
  }, [points]);

  const center = size / 2;
  const radius = size * 0.38;

  return (
    <div style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* OPTIONAL: subtle grid circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
        />

        {/* Axis lines */}
        {values.map((_, i) => {
          const angle = getAngle(i) - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;

          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
            />
          );
        })}

        {/* Polygon shape */}
        <path
          d={path}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          opacity={opacity}
        />

        {/* Center dot (optional anchor) */}
        <circle cx={center} cy={center} r={2} fill={stroke} />
      </svg>
    </div>
  );
}