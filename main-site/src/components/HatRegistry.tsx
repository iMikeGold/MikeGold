"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hats, type Hat } from "../system/registry";
import { getHatProfile, PROFILE_AXES } from "../system/profile/hat-profile";
import { findRelatedHatsForSelection, searchHats } from "../system/services/service-engine";
import { calculateWeight } from "../system/services/weights";
import { PROFILE_AXIS_COLOURS, resolveContextualDominanceMap } from "../system/services/profile-interpreter";
import { selectPrincipalLayerHats } from "../system/services/polygon-engine";
import HatDrawer from "./HatDrawer";
import HatRadar from "./Polygon/HatRadar";
import { useInteractionKernel } from "./interaction/InteractionKernel";

const HAT_LAYER_COLOURS = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#22d3ee", "#fb7185"] as const;
const POLYGON_SIZE = 200;
const DRAWER_MIN_WIDTH = POLYGON_SIZE + 40;
const DRAWER_MAX_WIDTH = 450;

const globalCSS = `
html, body { margin:0; padding:0; overflow-x:hidden; }
* { box-sizing:border-box; }
@keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@media (prefers-reduced-motion: reduce) {
  [data-hat-tile-face] { transition:none !important; animation:none !important; }
}
[data-hat-tile]:focus-visible { outline:2px solid #fff; outline-offset:2px; }
#hat-registry-root { overscroll-behavior:contain; }
#hat-registry-browser, #hat-registry-profile { -webkit-overflow-scrolling:touch; }
@media (max-width:767px) and (orientation:portrait) {
  #hat-registry-root {
    grid-template-columns:minmax(0,1fr) !important;
    grid-template-rows:minmax(250px,42dvh) 56px minmax(0,1fr) !important;
  }
  #hat-registry-profile { grid-column:1 !important; grid-row:1 !important; border-left:0 !important; border-bottom:1px solid #222; }
  #hat-registry-bottom-bar { grid-column:1 !important; grid-row:2 !important; }
  #hat-registry-left-panel { grid-column:1 !important; grid-row:3 !important; }
}
`;

function getHatStats(hat: Hat) {
  const profile = getHatProfile(hat);
  return PROFILE_AXES.reduce<Record<string, number>>((stats, axis, index) => {
    stats[axis] = profile[index] / 10;
    return stats;
  }, {});
}

export default function HatRegistry({
  initialSearchQuery = "",
  initialHatId = "",
}: {
  initialSearchQuery?: string;
  initialHatId?: string;
}) {
  const initialHat = hats.find((hat) => hat.slug === initialHatId || hat.id === initialHatId) ?? null;
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_MIN_WIDTH);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedHats, setSelectedHats] = useState<Hat[]>(initialHat ? [initialHat] : []);
  const [activeHat, setActiveHat] = useState<Hat | null>(initialHat);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({ creative: true, design: true, engineering: true });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});
  const [colourSlots, setColourSlots] = useState<Record<string, number>>({});
  const tileBrowserRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const portrait = height > width;
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch || width < 768);
      setIsPortrait(portrait);
      setDrawerWidth(Math.max(portrait ? DRAWER_MIN_WIDTH : 280, Math.min(DRAWER_MAX_WIDTH, width * 0.4)));
    };
    checkLayout();
    window.addEventListener("resize", checkLayout);
    window.addEventListener("orientationchange", checkLayout);
    return () => {
      window.removeEventListener("resize", checkLayout);
      window.removeEventListener("orientationchange", checkLayout);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedQuery = params.get("q")?.trim();
    if (requestedQuery) setSearchQuery(requestedQuery);
    const requestedHatId = params.get("hat")?.trim();
    if (!requestedHatId) return;
    const requestedHat = hats.find((hat) => hat.slug === requestedHatId || hat.id === requestedHatId);
    if (!requestedHat) return;
    setSelectedHats([requestedHat]);
    setActiveHat(requestedHat);
    setCollapsedSections((previous) => ({ ...previous, [requestedHat.category]: true }));
  }, []);

  const interaction = useInteractionKernel(flippedTiles, { isMobile, isCompact: false, isPortrait });
  const filteredHats = useMemo(() => searchHats(hats, searchQuery).map(({ hat }) => hat), [searchQuery]);
  const hatsByHouse = useMemo(() => {
    const groups: Record<string, Hat[]> = { creative: [], design: [], engineering: [] };
    filteredHats.forEach((hat) => groups[hat.category]?.push(hat));
    return groups;
  }, [filteredHats]);
  const registryHouseCounts = useMemo(() => hats.reduce<Record<string, number>>((counts, hat) => {
    counts[hat.category] = (counts[hat.category] ?? 0) + 1;
    return counts;
  }, {}), []);
  const relatedHats = useMemo(() => findRelatedHatsForSelection(selectedHats.length ? selectedHats : activeHat ? [activeHat] : [], hats), [activeHat, selectedHats]);
  const principalLayerHats = useMemo(() => selectPrincipalLayerHats(selectedHats, 7), [selectedHats]);
  const contextualDominance = useMemo(() => resolveContextualDominanceMap(selectedHats), [selectedHats]);

  useEffect(() => {
    setColourSlots((previous) => {
      const visibleIds = new Set(principalLayerHats.map((hat) => hat.id));
      const next = Object.entries(previous).reduce<Record<string, number>>((slots, [id, slot]) => {
        if (visibleIds.has(id)) slots[id] = slot;
        return slots;
      }, {});
      const occupied = new Set(Object.values(next));
      principalLayerHats.forEach((hat) => {
        if (Number.isInteger(next[hat.id])) return;
        const slot = [0, 1, 2, 3, 4, 5, 6].find((candidate) => !occupied.has(candidate));
        if (slot === undefined) return;
        next[hat.id] = slot;
        occupied.add(slot);
      });
      return next;
    });
  }, [principalLayerHats]);

  const toggleSelectHat = (hat: Hat) => {
    setSelectedHats((previous) => {
      const exists = previous.some((item) => item.id === hat.id);
      if (exists) {
        const updated = previous.filter((item) => item.id !== hat.id);
        if (activeHat?.id === hat.id) setActiveHat(updated.at(-1) ?? null);
        return updated;
      }
      setActiveHat(hat);
      if (isMobile) setCollapsedSections((sections) => ({ ...sections, [hat.category]: true }));
      return [...previous, hat];
    });
  };

  const handleSelectRelated = (hat: Hat) => {
    setActiveHat(hat);
    setSelectedHats((previous) => previous.some((item) => item.id === hat.id) ? previous : [...previous, hat]);
    setFlippedTiles((previous) => ({ ...previous, [hat.id]: true }));
    setSearchQuery("");
    setCollapsedSections((previous) => ({ ...previous, [hat.category]: true }));
  };

  const portraitMobile = isMobile && isPortrait;
  const gridColumns = portraitMobile ? "minmax(0,1fr)" : `minmax(0,1fr) ${drawerWidth}px`;
  const gridRows = portraitMobile ? "minmax(250px,42dvh) 56px minmax(0,1fr)" : "minmax(0,1fr) 56px";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <div id="hat-registry-root" style={{
        height: "calc(100dvh - 56px)", minHeight: 0, display: "grid", gridTemplateColumns: gridColumns,
        gridTemplateRows: gridRows, background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", overflow: "hidden",
      }}>
        <div id="hat-registry-left-panel" style={{ gridColumn: 1, gridRow: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <form action="/registry" method="get" style={{ flexShrink: 0, background: "#0a0a0a", padding: "8px 12px 10px", borderBottom: "1px solid #222", display: "flex", gap: 6 }}>
            <input type="text" name="q" enterKeyHint="search" placeholder="Search hats, tags, capabilities..." value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{ width: "100%", minWidth: 0, padding: "8px 12px", background: "#151515", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13 }} />
            <button type="submit" aria-label="Search Hats" style={{ minWidth: 44, minHeight: 38, border: "1px solid #333", borderRadius: 6, background: "#202020", color: "#fff" }}>Go</button>
          </form>

          <div id="hat-registry-browser" ref={tileBrowserRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 12px 18px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {searchQuery.trim() && filteredHats.length === 0 && <div style={{ padding: 18, border: "1px solid #292929", color: "#888" }}>Add a specialist term such as media, web, audio, PCB or deployment. Generic role words such as engineer are ignored.</div>}
            {Object.entries(hatsByHouse).map(([house, hatsList]) => {
              if (!hatsList.length) return null;
              const registryCount = registryHouseCounts[house] ?? hatsList.length;
              const registryShare = hats.length ? registryCount / hats.length : 0;
              const expanded = Boolean(searchQuery.trim()) || !collapsedSections[house];
              return <section key={house}>
                <button type="button" aria-expanded={expanded} onClick={() => setCollapsedSections((previous) => ({ ...previous, [house]: !previous[house] }))}
                  style={{ width: "100%", padding: "8px 12px", background: "#121212", color: "#fff", border: "1px solid #222", borderRadius: 8, cursor: "pointer", marginBottom: 6, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <h3 style={{ margin: 0, textTransform: "capitalize", fontSize: 15 }}>{house} <span style={{ opacity: 0.5, fontSize: 12 }}>({registryCount})</span></h3>
                    <span style={{ opacity: 0.6 }}>{expanded ? "▲" : "▼"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 6, flex: 1, background: "#242424", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${registryShare * 100}%`, height: "100%", background: "#3b82f6" }} /></div>
                    <span style={{ opacity: 0.72, fontSize: 11, minWidth: 78, textAlign: "right" }}>{registryCount} / {hats.length} · {(registryShare * 100).toFixed(1)}%</span>
                  </div>
                </button>
                {expanded && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(86px,1fr))", gap: 4, width: "100%" }}>
                  {hatsList.map((hat) => {
                    const isSelected = selectedHats.some((item) => item.id === hat.id);
                    const weightScore = calculateWeight(hat);
                    const stats = getHatStats(hat);
                    const isFlipped = flippedTiles[hat.id] || false;
                    const overlayText = interaction.getOverlay(hat.id);
                    const dominance = contextualDominance.get(hat.id);
                    const layerColour = HAT_LAYER_COLOURS[colourSlots[hat.id] ?? 0];
                    const activate = () => interaction.click(
                      () => setFlippedTiles((previous) => ({ ...previous, [hat.id]: !previous[hat.id] })),
                      () => toggleSelectHat(hat),
                    );
                    return <a key={hat.id} href={`/registry?hat=${encodeURIComponent(hat.slug)}`} data-hat-tile
                      onMouseEnter={() => interaction.enter(hat.id, hat)} onMouseLeave={interaction.leave}
                      onTouchStart={() => interaction.touchStart(hat.id, hat)} onTouchEnd={() => interaction.touchEnd()}
                      onClick={(event) => { event.preventDefault(); activate(); }}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }}
                      style={{ aspectRatio: "1/1", cursor: "pointer", width: "100%", position: "relative", overflow: "hidden", borderRadius: 6, isolation: "isolate", color: "inherit", textDecoration: "none" }}>
                      <div data-hat-tile-face style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", transition: "transform .42s cubic-bezier(.4,0,.2,1)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", boxShadow: isSelected ? `0 0 10px ${layerColour}, inset 0 0 15px ${layerColour}55` : "none", backgroundImage: isSelected ? `linear-gradient(90deg,${layerColour}22,${layerColour}55,${layerColour}22)` : "none", backgroundSize: "200% 100%", animation: isSelected ? "shimmer .6s linear infinite" : "none" }}>
                        <div style={{ position: "absolute", inset: 0, background: isSelected ? `${layerColour}22` : "#151515", border: isSelected ? `1px solid ${layerColour}` : "1px solid #333", borderRadius: 6, padding: 3, display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", backfaceVisibility: "hidden", zIndex: 2 }}>
                          <strong style={{ fontSize: 10, lineHeight: 1.1, overflowWrap: "anywhere" }}>{hat.name}</strong>
                          {isSelected && dominance && <span style={{ position: "absolute", left: 3, bottom: 2, fontSize: 6.5, color: dominance.colour, textTransform: "uppercase" }}>{dominance.confidence === "balanced" ? "Visual: balanced" : dominance.primaryAxis}</span>}
                          <div style={{ position: "absolute", bottom: 2, right: 2, fontSize: 8, opacity: 0.5 }}>{weightScore.toFixed(2)}</div>
                        </div>
                        <div style={{ position: "absolute", inset: 0, background: "#1a1a1a", border: isSelected ? `1px solid ${layerColour}` : "1px solid #444", borderRadius: 6, padding: 4, backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>
                          {Object.entries(stats).map(([key, value], index) => <div key={key} style={{ width: "88%" }}><div style={{ fontSize: 6, opacity: .68, textTransform: "capitalize" }}>{key}</div><div style={{ height: 3, background: "#222", overflow: "hidden" }}><div style={{ width: `${Math.round(value * 100)}%`, height: "100%", background: PROFILE_AXIS_COLOURS[index] }} /></div></div>)}
                        </div>
                      </div>
                      {overlayText && !isFlipped && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.88)", border: "1px solid #666", borderRadius: 6, zIndex: 5, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 3 }}>{overlayText}</div>}
                    </a>;
                  })}
                </div>}
              </section>;
            })}
          </div>
        </div>

        <div id="hat-registry-bottom-bar" style={{ gridColumn: 1, gridRow: 2, minWidth: 0, background: "#0a0a0a", padding: "6px 12px", borderTop: "1px solid #222", zIndex: 20 }}>
          <div style={{ padding: "6px 10px", background: "#151515", border: "1px solid #222", borderRadius: 8, height: 44, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, opacity: .7, flexShrink: 0 }}>Selected ({selectedHats.length})</div>
            <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: 6, minWidth: 0 }}>{selectedHats.map((hat) => {
              const colour = HAT_LAYER_COLOURS[colourSlots[hat.id] ?? 0];
              return <div key={hat.id} style={{ background: `${colour}18`, border: `1px solid ${colour}`, padding: "3px 8px", borderRadius: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><i style={{ width: 6, height: 6, borderRadius: "50%", background: colour }} />{hat.name}<button onClick={() => toggleSelectHat(hat)} style={{ background: "none", border: 0, color: "#fff", fontSize: 14 }}>×</button></div>;
            })}</div>
            <button onClick={() => { setSelectedHats([]); setActiveHat(null); setFlippedTiles({}); setColourSlots({}); }} style={{ fontSize: 12, opacity: .6, background: "none", border: 0, color: "#fff", flexShrink: 0 }}>Clear All</button>
          </div>
        </div>

        <aside id="hat-registry-profile" style={{ gridColumn: 2, gridRow: "1 / span 2", minWidth: 0, minHeight: 0, overflow: "hidden", background: "#111", borderLeft: "1px solid #222" }}>
          {activeHat ? <HatDrawer hat={activeHat} selectedHats={selectedHats} relatedHats={relatedHats} onSelectHat={handleSelectRelated} onClose={() => setActiveHat(null)} drawerWidth={portraitMobile ? DRAWER_MAX_WIDTH : drawerWidth} POLYGON_SIZE={POLYGON_SIZE} colourSlots={colourSlots} /> :
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}><div style={{ padding: "14px 18px 9px", borderBottom: "1px solid #222" }}><h2 style={{ margin: 0, fontSize: 17 }}>Capability profile</h2><p style={{ margin: "5px 0 0", color: "#777", fontSize: 11 }}>Select a Hat to shape the profile.</p></div><div style={{ minHeight: POLYGON_SIZE + 8, display: "flex", alignItems: "center", justifyContent: "center" }}><HatRadar values={[0,0,0,0,0,0]} layers={[]} size={POLYGON_SIZE} /></div></div>}
        </aside>
      </div>
    </>
  );
}
