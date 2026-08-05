"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PROFILE_AXIS_COLOURS } from "@/system/services/profile-interpreter";
import { PROFILE_AXES } from "@/system/profile/hat-profile";

type Props = {
  values: number[];
  layers?: { values: number[]; color: string }[];
  size?: number;
  stroke?: string;
  fill?: string;
  opacity?: number;
  activeAxis?: number | null;
  onAxisFocus?: (index: number) => void;
  interactive?: boolean;
};

const AXES = 6;
const getAngle = (index: number) => (Math.PI * 2 * index) / AXES;
const valueToRadius = (value: number, maxRadius: number) => (value / 10) * maxRadius;

export default function HatRadar({
  values,
  layers = [],
  size = 200,
  stroke = "#4A90E2",
  fill = "rgba(74,144,226,0.38)",
  opacity = 1,
  activeAxis = null,
  onAxisFocus,
  interactive = false,
}: Props) {
  const normalisedValues = useMemo(
    () => Array.from({ length: AXES }, (_, index) => values[index] ?? 0),
    [values],
  );
  const [displayValues, setDisplayValues] = useState(normalisedValues);
  const displayedRef = useRef(normalisedValues);

  useEffect(() => {
    const start = displayedRef.current;
    const startedAt = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 420);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = normalisedValues.map((target, index) => {
        const initial = start[index] ?? 0;
        return initial + (target - initial) * eased;
      });
      displayedRef.current = next;
      setDisplayValues(next);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [normalisedValues]);

  const center = size / 2;
  const radius = size * 0.43;
  const maxValue = Math.max(...normalisedValues);
  const strongestAxis = maxValue > 0 ? normalisedValues.indexOf(maxValue) : -1;

  const points = useMemo(
    () =>
      displayValues.map((value, index) => {
        const angle = getAngle(index) - Math.PI / 2;
        const axisRadius = valueToRadius(value, radius);
        return {
          x: center + Math.cos(angle) * axisRadius,
          y: center + Math.sin(angle) * axisRadius,
        };
      }),
    [center, displayValues, radius],
  );

  const path = useMemo(() => {
    if (!points.length) return "";
    return `${points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")} Z`;
  }, [points]);

  return (
    <div
      style={{
        width: size,
        height: size,
        margin: "0 auto",
        padding: 0,
        overflow: "hidden",
        lineHeight: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Capability profile graph"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
        />
        <circle
          cx={center}
          cy={center}
          r={radius + 3}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeDasharray="2 7"
        />

        {displayValues.map((_, index) => {
          const angle = getAngle(index) - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={`axis-${PROFILE_AXES[index]}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.09)"
            />
          );
        })}

        {layers.map((layer, layerIndex) => {
          const layerPath = `${Array.from({ length: AXES }, (_, index) => {
            const angle = getAngle(index) - Math.PI / 2;
            const axisRadius = valueToRadius(layer.values[index] ?? 0, radius);
            const x = center + Math.cos(angle) * axisRadius;
            const y = center + Math.sin(angle) * axisRadius;
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ")} Z`;
          return (
            <path
              key={`${layer.color}-${layerIndex}`}
              d={layerPath}
              fill="none"
              stroke={layer.color}
              strokeWidth={0.9}
              opacity={0.38}
            />
          );
        })}

        <path d={path} fill={fill} stroke={stroke} strokeWidth={3} opacity={opacity} />
        <circle cx={center} cy={center} r={2} fill={stroke} />

        {PROFILE_AXIS_COLOURS.map((colour, index) => {
          const angle = getAngle(index) - Math.PI / 2;
          const x = center + Math.cos(angle) * (radius + 3);
          const y = center + Math.sin(angle) * (radius + 3);
          const isActive = activeAxis === index;
          const isStrongest = strongestAxis === index;
          const label = `${PROFILE_AXES[index]}: ${normalisedValues[index].toFixed(1)}`;

          return (
            <g key={PROFILE_AXES[index]}>
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill="none"
                  stroke={colour}
                  strokeWidth={1.2}
                  opacity={0.72}
                />
              )}
              {interactive && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={label}
                  style={{ cursor: "pointer", outline: "none" }}
                  onMouseEnter={() => onAxisFocus?.(index)}
                  onFocus={() => onAxisFocus?.(index)}
                  onClick={() => onAxisFocus?.(index)}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 4 : isStrongest ? 3.4 : 2.4}
                fill={colour}
                pointerEvents="none"
              >
                <title>{label}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
