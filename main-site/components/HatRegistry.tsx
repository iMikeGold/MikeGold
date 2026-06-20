"use client";

import { useMemo, useState } from "react";
import { hats } from "../system/registry";
import HatDrawer from "./HatDrawer";

// ==================================================
// iD Gravity Core — Hat Registry v2.85
// FIXED SELECTION / ACTIVE STATE BEHAVIOUR
// Deselecting last clicked item → graph reverts to previous selected item
// All overlay/position logic from v2.84 PRESERVED
// ==================================================

// ------------------------------
// Helpers (EXACT same as yours)
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

/** Calculate house average score for meter bar */
function getHouseScore(hatsList: any[]): number {
  if (!hatsList.length) return 0;
  const total = hatsList.reduce((sum, hat) => sum + calculateWeight(hat), 0);
  return total / hatsList.length;
}

/** Get profile stats for mini bars */
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
// Component
// ------------------------------
export default function HatRegistry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHats, setSelectedHats] = useState<any[]>([]);
  const [activeHat, setActiveHat] = useState<any>(null);
  const [hovered, setHovered] = useState<{ hat: any; rect: DOMRect } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creative: true,
    design: true,
    engineering: true
  });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});

  // Filter hats (EXACT same as yours)
  const filteredHats = useMemo(() => {
    return hats.filter((hat) => {
      const matchesCategory = selectedCategory === "all" || hat.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        hat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flattenTags(hat).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        hat.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [hats, selectedCategory, searchQuery]);

  // Group by Skill House (EXACT same as yours)
  const hatsByHouse = useMemo(() => {
    const groups: Record<string, any[]> = { creative: [], design: [], engineering: [] };
    filteredHats.forEach((hat) => {
      if (groups[hat.category]) groups[hat.category].push(hat);
    });
    return groups;
  }, [filteredHats]);

  // Related hats (EXACT same as yours)
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

  // UPDATED: Toggle selection + manage active state properly
  const toggleSelectHat = (hat: any) => {
    setSelectedHats(prev => {
      const isAlreadySelected = prev.some(h => h.id === hat.id);
      
      if (isAlreadySelected) {
        // --- DESELECT CASE ---
        const newList = prev.filter(h => h.id !== hat.id);
        // If this was the active hat → set active to LAST item in new list, or null
        if (activeHat?.id === hat.id) {
          setActiveHat(newList.length > 0 ? newList[newList.length - 1] : null);
        }
        return newList;
      } else {
        // --- SELECT CASE ---
        const newList = [...prev, hat];
        // Always make newly selected item the active one
        setActiveHat(hat);
        return newList;
      }
    });
  };

  const handleTileClick = (hat: any) => {
    setFlippedTiles(prev => ({ ...prev, [hat.id]: !prev[hat.id] }));
    toggleSelectHat(hat);
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      overflow: "hidden",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>
      {/* LEFT PANEL — EXACT same sizing */}
      <div style={{ 
        width: "calc(100% - 420px)", 
        padding: "20px", 
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        {/* SEARCH — EXACT same */}
        <div>
          <input
            type="text"
            placeholder="Search hats, tags, capabilities or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#151515",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14
            }}
          />
        </div>

        {/* SKILL HOUSES — EXACT same */}
        {Object.entries(hatsByHouse).map(([house, hatsList]) => {
          if (hatsList.length === 0) return null;
          const houseScore = getHouseScore(hatsList);
          const housePercent = Math.round(houseScore * 100);

          return (
            <div key={house}>
              {/* HOUSE HEADER + METER BAR — EXACT same */}
              <div 
                onClick={() => setCollapsedSections(prev => ({ ...prev, [house]: !prev[house] }))}
                style={{
                  padding: "12px 16px",
                  background: "#121212",
                  border: "1px solid #222",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 12
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ margin: 0, textTransform: "capitalize", fontSize: 16 }}>
                    {house} <span style={{ opacity: 0.5, fontSize: 13 }}>({hatsList.length})</span>
                  </h3>
                  <span style={{ opacity: 0.6 }}>{collapsedSections[house] ? "▼" : "▲"}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: "#222",
                    borderRadius: 3,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${housePercent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                      borderRadius: 3,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.7, minWidth: 32 }}>{housePercent}%</span>
                </div>
              </div>

              {/* TILE GRID */}
              {!collapsedSections[house] && (
                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: 8,
                    paddingLeft: 4,
                    position: "relative"
                  }}
                >
                  {hatsList.map((hat) => {
                    const isSelected = selectedHats.some(h => h.id === hat.id);
                    const weightScore = calculateWeight(hat);
                    const stats = getHatStats(hat);
                    const isFlipped = flippedTiles[hat.id];

                    return (
                      <div
                        key={hat.id}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHovered({ hat, rect });
                        }}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleTileClick(hat)}
                        style={{
                          aspectRatio: "1/1",
                          perspective: "1000px",
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          zIndex: hovered?.hat.id === hat.id ? 30 : 1 // Hovered always on top
                        }}
                      >
                        {/* FLIP CARD */}
                        <div style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transition: "transform 0.4s ease",
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                        }}>
                          {/* FRONT */}
                          <div style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background: isSelected ? "#2563eb33" : "#151515",
                            border: isSelected ? "1px solid #2563eb" : "1px solid #333",
                            borderRadius: 6,
                            padding: 4,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: 10,
                            lineHeight: 1.2,
                            backfaceVisibility: "hidden"
                          }}>
                            <strong style={{ fontSize: 11, marginBottom: 1 }}>{hat.name.split(" ")[0]}</strong>
                            <span style={{ opacity: 0.7 }}>{hat.name.split(" ").slice(1).join(" ")}</span>
                            <div style={{ position: "absolute", bottom: 2, right: 2, fontSize: 8, opacity: 0.5 }}>
                              {weightScore.toFixed(2)}
                            </div>
                          </div>

                          {/* BACK — attribute bars */}
                          <div style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background: "#1a1a1a",
                            border: "1px solid #444",
                            borderRadius: 6,
                            padding: 4,
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-around"
                          }}>
                            {Object.entries(stats).map(([key, value]) => (
                              <div key={key} style={{ width: "100%" }}>
                                <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 1, textTransform: "capitalize" }}>
                                  {key}
                                </div>
                                <div style={{ height: 3, background: "#222", borderRadius: 1, overflow: "hidden" }}>
                                  <div 
                                    style={{ 
                                      width: `${Math.round(Number(value) * 100)}%`, 
                                      height: "100%", 
                                      background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                                      borderRadius: 1
                                    }} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ✅ EXACT SAME OVERLAY LOGIC FROM v2.84 — NO CHANGES */}
                        {hovered && hovered.hat.id === hat.id && typeof window !== "undefined" && (() => {
                          const { rect } = hovered;
                          const overlayWidth = 160;  // Narrow / vertical
                          const DRAWER_WIDTH = 420;  // Fixed right panel width
                          const spaceLeft = rect.left;
                          const spaceRight = window.innerWidth - rect.right;
                          const spaceToDrawer = window.innerWidth - DRAWER_WIDTH - rect.right;

                          let position: any = {};

                          // ------------------------------
                          // RULES (exactly what you want):
                          // ------------------------------
                          // 1. FAR LEFT: open RIGHT (away from edge)
                          if (spaceLeft < 80 && spaceRight >= overlayWidth) {
                            position = {
                              left: "100%",
                              top: "50%",
                              transform: "translateY(-50%)",
                              marginLeft: 6
                            };
                          }
                          // 2. FAR RIGHT: open LEFT (away from edge + AWAY FROM DRAWER — never behind)
                          else if (spaceToDrawer < overlayWidth && spaceLeft >= overlayWidth) {
                            position = {
                              right: "100%",
                              top: "50%",
                              transform: "translateY(-50%)",
                              marginRight: 6
                            };
                          }
                          // 3. MIDDLE: open BELOW (centred, no side)
                          else {
                            position = {
                              top: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              marginTop: 6
                            };
                          }

                          return (
                            <div
                              style={{
                                position: "absolute",
                                width: overlayWidth,
                                height: 120,
                                padding: 8,
                                background: "#000",
                                border: "1px solid #444",
                                borderRadius: 6,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                                zIndex: 40,
                                fontSize: 10,
                                lineHeight: 1.3,
                                pointerEvents: "none",
                                overflow: "hidden",
                                ...position
                              }}
                            >
                              <strong style={{ display: "block", marginBottom: 3, fontSize: 11 }}>{hat.name}</strong>
                              <p style={{ margin: 0, opacity: 0.8 }}>{hat.description?.slice(0, 60)}...</p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* SELECTED HATS BAR — EXACT same */}
        {selectedHats.length > 0 && (
          <div style={{ 
            marginTop: "auto",
            padding: "12px 16px", 
            background: "#151515", 
            border: "1px solid #222", 
            borderRadius: 8
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, opacity: 0.7 }}>Selected ({selectedHats.length})</span>
              <button 
                onClick={() => {
                  setSelectedHats([]);
                  setActiveHat(null); // Also clear active when clearing all
                }} 
                style={{ fontSize: 12, opacity: 0.6, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              >
                Clear All
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedHats.map(hat => (
                <div key={hat.id} style={{
                  background: "#2563eb22",
                  border: "1px solid #2563eb66",
                  padding: "4px 8px",
                  borderRadius: 12,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  {hat.name}
                  <button 
                    onClick={() => toggleSelectHat(hat)} 
                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER — EXACT same as yours */}
      <HatDrawer
        hat={activeHat}
        relatedHats={relatedHats}
        onSelectHat={(hat) => {
          setActiveHat(hat);
          toggleSelectHat(hat);
        }}
        onClose={() => setActiveHat(null)}
      />
    </div>
  );
}