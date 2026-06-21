"use client";

import { useMemo, useState, useEffect } from "react";
import { hats } from "../system/registry";
import HatDrawer from "./HatDrawer";
import { useInteractionKernel } from "./interaction/InteractionKernel";

// ==================================================
// iD Gravity Core — Hat Registry v5.2
// FIXED: Mobile viewport height (100dvh) — no more collapse
// FIXED: Flex container sizing + minHeight:0 rule
// FIXED: Full height chain stable for Next.js
// RETAINED: Perfect text alignment, stats bars left→right, interaction kernel
// ==================================================

// ------------------------------
// GLOBAL CSS — CORRECTED FOR NEXT.JS + MOBILE
// ------------------------------
const globalCSS = `
html, body {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* prevent body scroll */
}

/* Remove Next.js #__next reliance — safe for App Router */
#__next {
  height: 100%;
  min-height: 100%;
}
`;

// ------------------------------
// DATA HELPERS
// ------------------------------
function flattenTags(hat: any): string[] {
  if (!hat?.tags) return [];
  return [
    ...(hat.tags.core || []),
    ...(hat.tags.adjacent || []),
    ...(hat.tags.meta || [])
  ];
}

function calculateWeight(hat: any): number {
  const { base = 0, experience = 0, rarity = 0 } = hat.weight || {};
  return (base * 0.5) + (experience * 0.3) + (rarity * 0.2);
}

function getHouseScore(hatsList: any[]): number {
  if (!hatsList.length) return 0;
  const total = hatsList.reduce((sum, hat) => sum + calculateWeight(hat), 0);
  return total / hatsList.length;
}

function getHatStats(hat: any) {
  const profile = hat.profile || {};
  return {
    depth: profile.depth ?? 0.75,
    creativity: profile.creativity ?? 0.65,
    scale: profile.scale ?? 0.85,
    interaction: profile.interaction ?? 0.70,
    structure: profile.structure ?? 0.60
  };
}

// ------------------------------
// COMPONENT
// ------------------------------
export default function HatRegistry() {
  // ------------------------------
  // STATE — ONLY DATA
  // ------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHats, setSelectedHats] = useState<any[]>([]);
  const [activeHat, setActiveHat] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creative: true,
    design: true,
    engineering: true
  });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  // ------------------------------
  // INTERACTION KERNEL — SINGLE SOURCE
  // ------------------------------
  const interaction = useInteractionKernel(flippedTiles);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ------------------------------
  // DATA PROCESSING
  // ------------------------------
  const filteredHats = useMemo(() => {
    return hats.filter((hat) => {
      const matchesCategory = selectedCategory === "all" || hat.category === selectedCategory;
      const matchesSearch = searchQuery === "" ||
        hat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flattenTags(hat).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        hat.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const hatsByHouse = useMemo(() => {
    const groups: Record<string, any[]> = { creative: [], design: [], engineering: [] };
    filteredHats.forEach((hat) => {
      if (groups[hat.category]) groups[hat.category].push(hat);
    });
    return groups;
  }, [filteredHats]);

  const relatedHats = useMemo(() => {
    if (!activeHat) return [];
    const hatTags = new Set(flattenTags(activeHat));
    return hats
      .filter(h => h.id !== activeHat.id)
      .map(h => ({
        hat: h,
        strength: flattenTags(h).filter(t => hatTags.has(t)).length
      }))
      .filter(x => x.strength > 0)
      .sort((a, b) => b.strength - a.strength);
  }, [activeHat]);

  // ------------------------------
  // ACTIONS
  // ------------------------------
  const toggleSelectHat = (hat: any) => {
    setSelectedHats(prev => {
      const isSelected = prev.some(h => h.id === hat.id);
      if (isSelected) {
        const updated = prev.filter(h => h.id !== hat.id);
        if (activeHat?.id === hat.id) setActiveHat(updated.at(-1) || null);
        return updated;
      } else {
        setActiveHat(hat);
        return [...prev, hat];
      }
    });
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  if (!isMounted) {
    return <div style={{ color: "#fff", padding: 20, background:"#0a0a0a", height:"100dvh" }}>Loading...</div>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      {/* FIX: Use 100dvh — correct mobile viewport height, no collapse */}
      <div style={{
        position: "relative",
        height: "100dvh",
        minHeight: "100dvh",
        display: "flex",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "sans-serif",
        overflow: "hidden"
      }}>
        {/* FIX: Left panel — flex child with minHeight:0 to prevent collapse */}
        <div style={{
          width: "calc(100% - 400px)",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative"
        }}>
          {/* HEADER */}
          <div style={{
            flexShrink: 0,
            background: "#0a0a0a",
            padding: "12px 12px 8px 12px",
            borderBottom: "1px solid #222",
            zIndex: 20
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:"#151515", overflow:"hidden", border:"1px solid #333" }}>
                <img src="/images/universal-mic.png" alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div>
                <h2 style={{ margin:0, fontSize:16, fontWeight:600 }}>Mike Gold</h2>
                <p style={{ margin:0, fontSize:12, opacity:0.6 }}>Systems / Architect</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search hats, tags, capabilities or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width:"100%", padding:"10px 14px",
                background:"#151515", border:"1px solid #333",
                borderRadius:8, color:"#fff", fontSize:14
              }}
            />
          </div>

          {/* FIX: Scroll area — minHeight:0 critical for flex scroll */}
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
                      gap:4, paddingLeft:0
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
                            onTouchEnd={interaction.touchEnd}
                            onClick={() =>
                              interaction.click(
                                () => setFlippedTiles(prev => ({ ...prev, [hat.id]: !prev[hat.id] })),
                                () => toggleSelectHat(hat)
                              )
                            }
                            style={{
                              aspectRatio:"1/1", perspective:"1200px", cursor:"pointer",
                              width:"100%", height:"100%", position:"relative",
                              overflow:"visible", borderRadius:6, isolation:"isolate"
                            }}
                          >
                            <div style={{
                              width:"100%", height:"100%", position:"relative",
                              transformStyle:"preserve-3d", transformOrigin:"center",
                              transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                              boxShadow: isSelected ? "0 0 10px #2563eb, inset 0 0 15px rgba(37,99,235,0.4)" : "none",
                              backgroundImage: isSelected ? "linear-gradient(90deg, #2563eb33, #3b82f655, #2563eb33)" : "none",
                              backgroundSize:"200% 100%", backgroundPosition:"0% 0%",
                              backgroundRepeat:"no-repeat",
                              animation: isSelected ? "shimmer 0.6s linear infinite" : "none"
                            }}>
                              <style>{`@keyframes shimmer { 0% {background-position:200% 0;} 100% {background-position:-200% 0;} }`}</style>

                              {/* FRONT FACE — PERFECT CENTER */}
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

                              {/* BACK FACE — STATS LEFT→RIGHT */}
                              <div style={{
                                position:"absolute", inset:0,
                                background:"#1a1a1a", border:"1px solid #444",
                                borderRadius:6, padding:3,
                                backfaceVisibility:"hidden", transform:"rotateY(180deg)",
                                display:"flex", flexDirection:"column",
                                justifyContent:"space-around", alignItems:"center",
                                textAlign:"center", zIndex:1,
                                width:"100%", height:"100%"
                              }}>
                                {Object.entries(stats).map(([key, value]) => (
                                  <div key={key} style={{ width:"90%", textAlign:"center" }}>
                                    <div style={{ fontSize:7, opacity:0.6, marginBottom:1, textTransform:"capitalize" }}>
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

                              {/* OVERLAY */}
                              {overlayText && (
                                <div style={{
                                  position:"absolute", inset:0,
                                  background:"rgba(0,0,0,0.88)", border:"1px solid #666",
                                  borderRadius:6, zIndex:5, fontSize:9,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  textAlign:"center", padding:3,
                                  transform:"inherit", backfaceVisibility:"hidden",
                                  whiteSpace:"normal", width:"100%", height:"100%"
                                }}>
                                  {overlayText}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SELECTED BAR */}
          {selectedHats.length > 0 && (
            <div style={{
              flexShrink: 0,
              background: "#0a0a0a",
              padding: "8px 12px 12px",
              borderTop: "1px solid #222",
              zIndex: 20
            }}>
              <div style={{
                padding:"8px 12px", background:"#151515",
                border:"1px solid #222", borderRadius:8,
                height:44, display:"flex", alignItems:"center", gap:8
              }}>
                <div style={{ fontSize:13, opacity:0.7, flexShrink:0 }}>Selected ({selectedHats.length})</div>
                <div style={{ flex:1, overflowX:"auto", display:"flex", gap:6, paddingBottom:2 }}>
                  {selectedHats.map(hat => (
                    <div key={hat.id} style={{
                      background:"#2563eb22", border:"1px solid #2563eb66",
                      padding:"3px 8px", borderRadius:12, fontSize:12,
                      display:"flex", alignItems:"center", gap:4, flexShrink:0
                    }}>
                      {hat.name}
                      <button onClick={() => toggleSelectHat(hat)} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:14 }}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setSelectedHats([]); setActiveHat(null); }} style={{ fontSize:12, opacity:0.6, background:"none", border:"none", color:"#fff", cursor:"pointer" }}>Clear All</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT DRAWER */}
        <div style={{
          width: 400,
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          flexShrink: 0
        }} onWheel={(e) => e.stopPropagation()}>
          <HatDrawer
            hat={activeHat}
            relatedHats={relatedHats}
            onSelectHat={(hat: any) => { setActiveHat(hat); toggleSelectHat(hat); }}
            onClose={() => setActiveHat(null)}
          />
        </div>
      </div>
    </>
  );
}