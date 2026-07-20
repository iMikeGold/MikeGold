"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PROFILE_AXIS_COLOURS } from "@/system/services/profile-interpreter";
import { PROFILE_AXES } from "@/system/profile/hat-profile";

// ====================================================
// iD Gravity Core — Hat Radar v1.2
// ORIGINAL DATA VALUES — NO CHANGES
// BOX AROUND POLYGON = EDGE-TO-EDGE, NO EMPTY SPACE
// SCALES WITH WINDOW SIZE
// ====================================================

type Props = {
  values: number[];
  layers?: { values: number[]; color: string }[];
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
  layers = [],
  size = 200, // YOUR PREFERRED BASE SIZE
  stroke = "#4A90E2",
  fill = "rgba(74,144,226,0.38)",
  opacity = 1,
}: Props) {
  const [displayValues, setDisplayValues] = useState(values);
  const displayedRef = useRef(values);

  useEffect(() => {
    const start = displayedRef.current;
    const startedAt = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 420);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = values.map((target, index) => {
        const initial = start[index] ?? 0;
        return initial + (target - initial) * eased;
      });
      displayedRef.current = next;
      setDisplayValues(next);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [values]);

  const points = useMemo(() => {
    const center = size / 2;
    const radius = size * 0.45; // ORIGINAL RATIO — DATA POINTS UNCHANGED
    return displayValues.map((val, i) => {
      const angle = getAngle(i) - Math.PI / 2;
      const r = valueToRadius(val, radius);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return { x, y };
    });
  }, [displayValues, size]);

  const path = useMemo(() => {
    if (!points.length) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  }, [points]);

  const center = size / 2;
  const radius = size * 0.45;
  const strongestAxis = values.indexOf(Math.max(...values));
  const wheelColours = PROFILE_AXIS_COLOURS;

  return (
    // BOX = EXACT SIZE OF POLYGON — NO EXTRA SPACE
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
        <circle cx={center} cy={center} r={radius + 3} fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="2 7" />
        {wheelColours.map((colour, index) => {
          const angle = getAngle(index) - Math.PI / 2;
          return (
            <circle
              key={colour}
              cx={center + Math.cos(angle) * (radius + 3)}
              cy={center + Math.sin(angle) * (radius + 3)}
              r={index === strongestAxis ? 3.6 : 2.2}
              fill={colour}
            >
              <title>{PROFILE_AXES[index]}: {values[index].toFixed(1)}</title>
            </circle>
          );
        })}
        {displayValues.map((_, i) => {
          const angle = getAngle(i) - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />;
        })}
        {layers.map((layer, layerIndex) => {
          const layerPoints = layer.values.map((value, index) => {
            const angle = getAngle(index) - Math.PI / 2;
            const r = valueToRadius(value, radius);
            return `${index === 0 ? "M" : "L"} ${center + Math.cos(angle) * r} ${center + Math.sin(angle) * r}`;
          }).join(" ") + " Z";
          return <path key={layerIndex} d={layerPoints} fill="none" stroke={layer.color} strokeWidth={0.8} opacity={0.34} />;
        })}
        <path d={path} fill={fill} stroke={stroke} strokeWidth={3} opacity={opacity} />
        <circle cx={center} cy={center} r={2} fill={stroke} />
      </svg>
    </div>
  );
}
