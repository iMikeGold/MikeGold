// ==================================================
// iD Gravity Core — Hat Registry v7.2 — MATCHING DRAWER WIDTH
// Clear Selection BAR FIXED TO BOTTOM (always visible)
// Drawer size synced perfectly with HatDrawer
// NO OVERLAP / NO MASKING
// ==================================================

"use client";

// ------------------------------
// IMPORTS — FIRST
// ------------------------------
import { useMemo, useState, useEffect } from "react";
import { hats, type Hat } from "../system/registry";
import { getHatProfile, PROFILE_AXES } from "../system/profile/hat-profile";
import { findRelatedHatsForSelection, searchHats } from "../system/services/service-engine";
import { calculateWeight } from "../system/services/weights";
import HatDrawer from "./HatDrawer";
import { useInteractionKernel } from "./interaction/InteractionKernel";

// ------------------------------
// GLOBAL CSS — DEFINED HERE
// ------------------------------
const globalCSS = `
html, body {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  position: relative;
  overscroll-behavior-y: auto;
}

#__next {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
  -webkit-user-select: none;
  user-select: none;
}

@supports (-webkit-touch-callout: none) {
  body {
    min-height: -webkit-fill-available;
  }
}

@keyframes shimmer {
  0% {background-position:200% 0;}
  100% {background-position:-200% 0;}
}
`;

// ------------------------------
// DATA HELPERS
// ------------------------------
function getHouseScore(hatsList: Hat[]): number {
  if (!hatsList.length) return 0;
  const total = hatsList.reduce((sum, hat) => sum + calculateWeight(hat), 0);
  return total / hatsList.length;
}

function getHatStats(hat: Hat) {
  const profile = getHatProfile(hat);
  return Object.fromEntries(
    PROFILE_AXES.map((axis, index) => [axis, profile[index] / 10])
  );
}

// ------------------------------
// COMPONENT — WIDTH SYNCED WITH DRAWER
// ------------------------------
export default function HatRegistry() {
  // ------------------------------
  // MATCH DRAWER'S POLYGON SIZE EXACTLY
  // ------------------------------
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const POLYGON_SIZE = 200; // SAME AS DRAWER
  const DRAWER_MIN_WIDTH = POLYGON_SIZE + 40; // 220px — SAME AS DRAWER'S CONTENT_WIDTH
  const DRAWER_MAX_WIDTH = 450;
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_MIN_WIDTH);
  const [isMounted, setIsMounted] = useState(false);

  // ------------------------------
  // STATE
  // ------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHats, setSelectedHats] = useState<Hat[]>([]);
  const [activeHat, setActiveHat] = useState<Hat | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creative: true,
    design: true,
    engineering: true
  });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});

  // ------------------------------
  // INTERACTION — NOW PASS LAYOUT (NO ERRORS)
  // ------------------------------
  const interaction = useInteractionKernel(flippedTiles, {
    isMobile,
    isCompact: false,
    isPortrait
  });

  // ------------------------------
  // RESPONSIVE — FULL MOBILE/PORTRAIT LOGIC
  // ------------------------------
  useEffect(() => {
    const checkLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const touchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
      setIsMobile(touchDevice || w < 768);
      setIsPortrait(h > w);

      const newW = Math.max(DRAWER_MIN_WIDTH, Math.min(DRAWER_MAX_WIDTH, w * 0.38));
      setDrawerWidth(newW);

      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
    };

    checkLayout();
    const initialHat = new URLSearchParams(window.location.search).get("hat");
    if (initialHat) {
      const match = hats.find((hat) => hat.slug === initialHat || hat.id === initialHat);
      if (match) {
        setSelectedHats([match]); setActiveHat(match);
        window.setTimeout(() => document.getElementById("hat-registry-root")?.scrollIntoView({ block: "start" }), 0);
      }
    }
    window.addEventListener("resize", checkLayout);
    window.addEventListener("orientationchange", checkLayout);
    setIsMounted(true);
    return () => {
      window.removeEventListener("resize", checkLayout);
      window.removeEventListener("orientationchange", checkLayout);
    };
  }, [DRAWER_MIN_WIDTH, DRAWER_MAX_WIDTH]);

  // ------------------------------
  // DATA
  // ------------------------------
  const filteredHats = useMemo(() => {
    return searchHats(hats, searchQuery).map(({ hat }) => hat);
  }, [searchQuery]);

  const hatsByHouse = useMemo(() => {
    const groups: Record<string, Hat[]> = { creative: [], design: [], engineering: [] };
    filteredHats.forEach((hat) => {
      if (groups[hat.category]) groups[hat.category].push(hat);
    });
    return groups;
  }, [filteredHats]);

  const relatedHats = useMemo(() => {
    return findRelatedHatsForSelection(selectedHats.length ? selectedHats : activeHat ? [activeHat] : [], hats);
  }, [activeHat, selectedHats]);

  // ------------------------------
  // ACTIONS — NO BUGS
  // ------------------------------
  const toggleSelectHat = (hat: Hat) => {
    setSelectedHats(prev => {
      const exists = prev.some(h => h.id === hat.id);
      if (exists) {
        const updated = prev.filter(h => h.id !== hat.id);
        if (activeHat?.id === hat.id) setActiveHat(updated.at(-1) || null);
        return updated;
      } else {
        setActiveHat(hat);
        return [...prev, hat];
      }
    });
  };

  const handleSelectRelated = (hat: Hat) => {
    setActiveHat(hat);
    setSelectedHats(prev => prev.some(h => h.id === hat.id) ? prev : [...prev, hat]);
  };

  // ------------------------------
  // RENDER — PERFECT ALIGNMENT
  // ------------------------------
  if (!isMounted) {
    return <div style={{ color: "#fff", padding: 20, background:"#0a0a0a", height:"100dvh" }}>Loading...</div>;
  }

  return (
    <>
      {/* 1. VIEWPORT TAG — FIXES MOBILE ZOOM / SNAPS TO SCREEN */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

      {/* 2. GLOBAL CSS — NOW DEFINED ABOVE, NO ERROR */}
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

      {/* 3. REST OF YOUR EXACT CODE — NO CHANGES */}
      <div id="hat-registry-root" style={{
        position: "relative",
        height: isMobile ? "100dvh" : "calc(100dvh - 56px)",
        minHeight: isMobile ? "100dvh" : "calc(100dvh - 56px)",
        display: isPortrait && isMobile ? "flex" : "block",
        flexDirection: "column",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "sans-serif",
        overflow: "hidden"
      }}>

        {/* LEFT PANEL */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: activeHat && isMobile && isPortrait ? "58dvh" : "56px",
          width: isPortrait && isMobile ? "100%" : (activeHat ? `calc(100% - ${drawerWidth}px)` : "100%"),
          height: "auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 10,
          transition: "width 0.2s ease"
        }}>

          {/* SEARCH BAR */}
          <div style={{
            flexShrink: 0,
            background: "#0a0a0a",
            padding: "8px 12px 10px",
            borderBottom: "1px solid #222",
            zIndex: 20
          }}>
            <input
              type="text"
              placeholder="Search hats, tags, capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width:"100%", padding:"8px 12px",
                background:"#151515", border:"1px solid #333",
                borderRadius:6, color:"#fff", fontSize:13
              }}
            />
          </div>

          {/* SCROLL AREA */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: 0,
              zIndex: 10
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            {searchQuery.trim() && filteredHats.length === 0 && (
              <div style={{ padding: "18px", border: "1px solid #292929", color: "#888" }}>
                Add a specialist term such as media, web, audio, PCB or deployment.
                Generic role words such as engineer are ignored.
              </div>
            )}
            {Object.entries(hatsByHouse).map(([house, hatsList]) => {
              if (hatsList.length === 0) return null;
              const housePercent = Math.round(getHouseScore(hatsList) * 100);

              return (
                <div key={house}>
                  <div
                    onClick={() => setCollapsedSections(prev => ({ ...prev, [house]: !prev[house] }))}
                    style={{
                      padding:"8px 12px", background:"#121212",
                      border:"1px solid #222", borderRadius:8,
                      cursor:"pointer", marginBottom:6
                    }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <h3 style={{ margin:0, textTransform:"capitalize", fontSize:15 }}>
                        {house} <span style={{ opacity:0.5, fontSize:12 }}>({hatsList.length})</span>
                      </h3>
                      <span style={{ opacity:0.6 }}>{collapsedSections[house] ? "▼" : "▲"}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:6, background:"#222", borderRadius:3, overflow:"hidden" }}>
                        <div style={{
                          width:`${housePercent}%`, height:"100%",
                          background:"linear-gradient(90deg, #2563eb, #3b82f6)", borderRadius:3, transition:"width 0.3s"
                        }} />
                      </div>
                      <span style={{ fontSize:12, opacity:0.7, minWidth:32 }}>{housePercent}%</span>
                    </div>
                  </div>

                  {!collapsedSections[house] && (
                    <div style={{
                      display:"grid",
                      gridTemplateColumns:"repeat(auto-fill, minmax(80px, 1fr))",
                      gap:4,
                      width:"100%"
                    }}>
                      {hatsList.map((hat) => {
                        const isSelected = selectedHats.some(h => h.id === hat.id);
                        const weightScore = calculateWeight(hat);
                        const stats = getHatStats(hat);
                        const isFlipped = flippedTiles[hat.id] || false;
                        const overlayText = interaction.getOverlay(hat.id);

                        return (
                          <div
                            key={hat.id}
                            onMouseEnter={() => interaction.enter(hat.id, hat)}
                            onMouseLeave={interaction.leave}
                            onTouchStart={() => interaction.touchStart(hat.id, hat)}
                            onTouchEnd={() => interaction.touchEnd()}
                            onClick={() =>
                              interaction.click(
                                () => setFlippedTiles((previous) => ({
                                  ...previous,
                                  [hat.id]: !previous[hat.id],
                                })),
                                () => toggleSelectHat(hat)
                              )
                            }
                            style={{
                              aspectRatio:"1/1", cursor:"pointer",
                              width:"100%", position:"relative",
                              overflow:"hidden", borderRadius:6, isolation:"isolate"
                            }}
                          >
                            <div style={{
                              width:"100%", height:"100%", position:"relative",
                              transformStyle:"preserve-3d", transformOrigin:"center",
                              transition:"transform 0.42s cubic-bezier(0.4,0,0.2,1)",
                              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                              boxShadow: isSelected ? "0 0 10px #2563eb, inset 0 0 15px rgba(37,99,235,0.4)" : "none",
                              backgroundImage: isSelected ? "linear-gradient(90deg, #2563eb33, #3b82f655, #2563eb33)" : "none",
                              backgroundSize:"200% 100%", backgroundPosition:"0% 0%",
                              backgroundRepeat:"no-repeat",
                              animation: isSelected ? "shimmer 0.6s linear infinite" : "none"
                            }}>

                              {/* FRONT FACE */}
                              <div style={{
                                position:"absolute", inset:0,
                                background: isSelected ? "#2563eb22" : "#151515",
                                border: isSelected ? "1px solid #2563eb" : "1px solid #333",
                                borderRadius:6, padding:3,
                                display:"flex", flexDirection:"column",
                                justifyContent:"center", alignItems:"center",
                                textAlign:"center", fontSize:10, lineHeight:1.1,
                                backfaceVisibility:"hidden", zIndex:2,
                                width:"100%", height:"100%"
                              }}>
                                <strong style={{
                                  fontSize:10, textAlign:"center", width:"100%",
                                  whiteSpace:"normal", wordWrap:"break-word", display:"block"
                                }}>
                                  {hat.name}
                                </strong>
                                <div style={{ position:"absolute", bottom:2, right:2, fontSize:8, opacity:0.5 }}>
                                  {weightScore.toFixed(2)}
                                </div>
                              </div>

                              {/* BACK FACE */}
                              <div style={{
                                position:"absolute", inset:0,
                                background:"#1a1a1a",
                                border: isSelected ? "1px solid #2563eb" : "1px solid #444",
                                borderRadius:6, padding:4,
                                backfaceVisibility:"hidden", transform:"rotateY(180deg)",
                                display:"flex", flexDirection:"column",
                                justifyContent:"space-around", alignItems:"center",
                                textAlign:"center", zIndex:1,
                                width:"100%", height:"100%", overflow:"hidden"
                              }}>
                                {Object.entries(stats).map(([key, value]) => (
                                  <div key={key} style={{ width:"88%", minWidth:0 }}>
                                    <div style={{
                                      fontSize:6, opacity:0.68, marginBottom:1,
                                      overflow:"hidden", textOverflow:"ellipsis",
                                      textTransform:"capitalize", whiteSpace:"nowrap"
                                    }}>
                                      {key}
                                    </div>
                                    <div style={{ height:3, background:"#222", borderRadius:1, overflow:"hidden", width:"100%" }}>
                                      <div style={{
                                        width:`${Math.round(value * 100)}%`, height:"100%",
                                        background:"linear-gradient(90deg, #2563eb, #3b82f6)", borderRadius:1
                                      }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {overlayText && !isFlipped && (
                              <div style={{
                                position:"absolute", inset:0,
                                background:"rgba(0,0,0,0.88)", border:"1px solid #666",
                                borderRadius:6, zIndex:5, fontSize:9,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                textAlign:"center", padding:3,
                                overflow:"hidden",
                                whiteSpace:"normal", width:"100%", height:"100%"
                              }}>
                                <span style={{
                                  display:"-webkit-box", overflow:"hidden",
                                  WebkitBoxOrient:"vertical", WebkitLineClamp:5
                                }}>
                                  {overlayText}
                                </span>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM BAR — FULL LOGIC, SHIFTS CORRECTLY */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: activeHat && !(isPortrait && isMobile) ? `${drawerWidth}px` : "0",
          background: "#0a0a0a",
          padding: "8px 12px 12px",
          borderTop: "1px solid #222",
          zIndex: 55,
          height: "56px",
          transition: "right 0.2s ease"
        }}>
          <div style={{
            padding:"8px 12px", 
            background:"#151515",
            border:"1px solid #222", 
            borderRadius:8,
            height:44, display:"flex", 
            alignItems:"center", gap:8
          }}>
            <div style={{ fontSize:13, opacity:0.7, flexShrink:0 }}>Selected ({selectedHats.length})</div>
            <div style={{ flex:1, overflowX:"auto", display:"flex", gap:6, paddingBottom:2, minWidth:0 }}>
              {selectedHats.map(hat => (
                <div key={hat.id} style={{
                  background:"#2563eb22", border:"1px solid #2563eb66",
                  padding:"3px 8px", borderRadius:12, fontSize:12,
                  display:"flex", alignItems:"center", gap:4, flexShrink:0
                }}>
                  {hat.name}
                  <button onClick={() => {
                    setFlippedTiles((previous) => ({ ...previous, [hat.id]: false }));
                    toggleSelectHat(hat);
                  }} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:14 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedHats([]); setActiveHat(null); setFlippedTiles({}); }} style={{ fontSize:12, opacity:0.6, background:"none", border:"none", color:"#fff", cursor:"pointer", flexShrink:0 }}>Clear All</button>
          </div>
        </div>

        {/* DRAWER — RECEIVES WIDTH FROM REGISTRY, NO CONFLICT */}
        {activeHat && (
          <div style={{
            position: "fixed",
            top: isPortrait && isMobile ? "42dvh" : "56px",
            right: 0,
            width: isPortrait && isMobile ? "100%" : `${drawerWidth}px`,
            height: isPortrait && isMobile ? "58dvh" : "calc(100dvh - 56px)",
            minWidth: DRAWER_MIN_WIDTH,
            maxWidth: DRAWER_MAX_WIDTH,
            overflowY: "hidden",
            background: "#111",
            borderLeft: isMobile && !isPortrait ? "none" : "1px solid #222",
            borderTop: isPortrait && isMobile ? "1px solid #222" : "none",
            zIndex: 70
          }}>
            <HatDrawer
              hat={activeHat}
              selectedHats={selectedHats}
              relatedHats={relatedHats}
              onSelectHat={handleSelectRelated}
              onClose={() => setActiveHat(null)}
              drawerWidth={drawerWidth}
              POLYGON_SIZE={POLYGON_SIZE}
            />
          </div>
        )}

      </div>
    </>
  );
}
