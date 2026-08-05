"use client";

import { useEffect, useMemo, useState } from "react";
import HatRadar from "@/components/Polygon/HatRadar";
import {
  combineHatProfiles,
  composeCombinedHatDescription,
  selectPrincipalLayerHats,
} from "@/system/services/polygon-engine";
import { getHatProfile, PROFILE_AXES, type HatProfile } from "@/system/profile/hat-profile";
import { calculateWeight } from "@/system/services/weights";
import {
  PROFILE_AXIS_COLOURS,
  PROFILE_AXIS_MEANINGS,
} from "@/system/services/profile-interpreter";
import type { Hat } from "@/system/registry";

type RelatedHat = {
  hat: Hat;
  strength: number;
};

type DrawerSection = "role" | "capabilities" | "applications" | "related";

type Props = {
  hat: Hat | null;
  selectedHats: Hat[];
  relatedHats: RelatedHat[];
  onSelectHat: (hat: Hat) => void;
  drawerWidth: number;
  POLYGON_SIZE: number;
  colourSlots?: Record<string, number>;
};

const LAYER_COLOURS = [
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
] as const;

const SECTION_LABELS: Record<DrawerSection, string> = {
  role: "Role",
  capabilities: "Capabilities",
  applications: "Used for",
  related: "Related",
};

function flattenTags(hat: Hat | null): string[] {
  if (!hat?.tags) return [];
  return [
    ...(hat.tags.core ?? []),
    ...(hat.tags.adjacent ?? []),
    ...(hat.tags.meta ?? []),
  ];
}

export default function HatDrawer({
  hat,
  selectedHats,
  relatedHats,
  onSelectHat,
  drawerWidth,
  POLYGON_SIZE,
  colourSlots = {},
}: Props) {
  const [activeAxis, setActiveAxis] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<DrawerSection>("role");

  const polygonHats = selectedHats.length ? selectedHats : hat ? [hat] : [];
  const hasProfile = polygonHats.length > 0;
  const polygonValues = useMemo<HatProfile>(() => {
    if (!polygonHats.length) return [0, 0, 0, 0, 0, 0];
    return combineHatProfiles(polygonHats) as HatProfile;
  }, [polygonHats]);

  const principalLayerHats = useMemo(
    () => selectPrincipalLayerHats(polygonHats, 7),
    [polygonHats],
  );
  const polygonLayers = useMemo(
    () =>
      principalLayerHats.map((item, index) => ({
        values: getHatProfile(item),
        color: LAYER_COLOURS[colourSlots[item.id] ?? index],
      })),
    [colourSlots, principalLayerHats],
  );

  const dominantAxis = useMemo(() => {
    if (!hasProfile) return null;
    const highestValue = Math.max(...polygonValues);
    return polygonValues.indexOf(highestValue);
  }, [hasProfile, polygonValues]);

  const polygonSignature = polygonValues.join(":");
  useEffect(() => {
    setActiveAxis(dominantAxis);
  }, [dominantAxis, polygonSignature]);

  const effectivePolygonSize = useMemo(() => {
    const widthAllowance = drawerWidth < 380 ? drawerWidth * 0.46 : drawerWidth * 0.48;
    return Math.round(Math.max(148, Math.min(POLYGON_SIZE, widthAllowance, 210)));
  }, [drawerWidth, POLYGON_SIZE]);

  const title = hat?.name ?? "Capability profile";
  const weightScore = hat ? calculateWeight(hat) : null;
  const tags = flattenTags(hat);
  const combinedDescription = hasProfile
    ? composeCombinedHatDescription(polygonHats)
    : "Select a Hat to shape the same capability graph and inspect its connected role profile.";
  const axisIndex = activeAxis ?? dominantAxis;
  const axisName = axisIndex === null ? null : PROFILE_AXES[axisIndex];
  const axisValue = axisIndex === null ? null : polygonValues[axisIndex];
  const axisColour = axisIndex === null ? "#777" : PROFILE_AXIS_COLOURS[axisIndex];
  const axisMeaning = axisName
    ? PROFILE_AXIS_MEANINGS[axisName]
    : "Select or hover over any coloured point to read that axis directly.";
  const polygonStroke = dominantAxis === null ? "#4A90E2" : PROFILE_AXIS_COLOURS[dominantAxis];

  const overview =
    hat?.details?.overview ??
    hat?.description ??
    "Choose a Hat from the registry to inspect its role, capabilities, applications and related nodes.";
  const capabilities = hat?.details?.capabilities ?? [];
  const usedFor = hat?.details?.usedFor ?? [];

  return (
    <section className="hat-console" aria-label="Capability profile inspector">
      <header className="hat-console__header">
        <div className="hat-console__title-block">
          <h2>{title}</h2>
          {hat ? (
            <p>
              {hat.category} · {hat.type} · Score {weightScore?.toFixed(2)}
            </p>
          ) : (
            <p>Select a Hat to shape the profile.</p>
          )}
          {selectedHats.length > 1 && (
            <small>
              {selectedHats.length} selected Hats · combined profile
              {polygonHats.length > polygonLayers.length
                ? ` · ${polygonLayers.length} principal layers visible`
                : ""}
            </small>
          )}
        </div>
      </header>

      <div className="hat-console__visual">
        <div className="hat-console__radar">
          <HatRadar
            values={polygonValues}
            layers={polygonLayers}
            size={effectivePolygonSize}
            stroke={polygonStroke}
            fill={`${polygonStroke}61`}
            activeAxis={axisIndex}
            onAxisFocus={setActiveAxis}
            interactive
          />
        </div>

        <div className="hat-console__axis-inspector" aria-live="polite">
          <div className="hat-console__axis-focus">
            <div>
              <i style={{ background: axisColour }} />
              <span>{axisName ?? "Graph axis"}</span>
            </div>
            <strong>{axisValue === null ? "—" : axisValue.toFixed(1)}</strong>
            <p>{axisMeaning}</p>
          </div>

          <div className="hat-console__axis-list" aria-label="Capability graph axes">
            {PROFILE_AXES.map((axis, index) => (
              <button
                type="button"
                key={axis}
                className={axisIndex === index ? "is-active" : undefined}
                onMouseEnter={() => setActiveAxis(index)}
                onFocus={() => setActiveAxis(index)}
                onClick={() => setActiveAxis(index)}
              >
                <i style={{ background: PROFILE_AXIS_COLOURS[index] }} />
                <span>{axis}</span>
                <strong>{polygonValues[index].toFixed(1)}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="hat-console__summary">{combinedDescription}</p>

      <nav className="hat-console__tabs" aria-label="Capability information sections">
        {(Object.keys(SECTION_LABELS) as DrawerSection[]).map((section) => (
          <button
            type="button"
            key={section}
            className={activeSection === section ? "is-active" : undefined}
            aria-pressed={activeSection === section}
            onClick={() => setActiveSection(section)}
          >
            {SECTION_LABELS[section]}
            {section === "related" && relatedHats.length > 0 ? ` ${relatedHats.length}` : ""}
          </button>
        ))}
      </nav>

      <div className="hat-console__content" tabIndex={0}>
        {activeSection === "role" && (
          <div className="hat-console__content-section">
            {selectedHats.length > 1 && (
              <p style={{ marginBottom: 10 }}>{combinedDescription}</p>
            )}
            <p>{overview}</p>
            {tags.length > 0 && (
              <div className="hat-console__tags" aria-label="Hat tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "capabilities" && (
          <div className="hat-console__content-section">
            {capabilities.length ? (
              <ul>
                {capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            ) : (
              <p>No separate capability list is recorded for this Hat yet.</p>
            )}
          </div>
        )}

        {activeSection === "applications" && (
          <div className="hat-console__content-section">
            {usedFor.length ? (
              <ul>
                {usedFor.map((application) => (
                  <li key={application}>{application}</li>
                ))}
              </ul>
            ) : (
              <p>No separate application list is recorded for this Hat yet.</p>
            )}
          </div>
        )}

        {activeSection === "related" && (
          <div className="hat-console__related">
            {relatedHats.length ? (
              relatedHats.map((related) => (
                <button
                  type="button"
                  key={related.hat.id}
                  onClick={() => onSelectHat(related.hat)}
                >
                  <span>{related.hat.name}</span>
                  <small>Affinity {Math.round(related.strength * 100)}%</small>
                </button>
              ))
            ) : (
              <p>Select a Hat to reveal its strongest connected nodes.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
