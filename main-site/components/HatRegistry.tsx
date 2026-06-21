"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { hats } from "../system/registry";
import HatDrawer from "./HatDrawer";

// ==================================================
// iD Gravity Core — Hat Registry FINAL
// ✅ OVERLAY ON TOP OF THE TILE — exactly where it should be
// ✅ Text normal, no vertical lines
// ✅ Front = description | Flipped = name
// ✅ No red lines, no errors
// ==================================================

// ------------------------------
// Helpers
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
// Component
// ------------------------------
export default function HatRegistry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHats, setSelectedHats] = useState<any[]>([]);
  const [activeHat, setActiveHat] = useState<any>(null);

  type HoverData = { hat: any } | null;
  const [hovered, setHovered] = useState<HoverData>(null);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creative: true,
    design: true,
    engineering: true
  });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const toggleSelectHat = (hat: any) => {
    setSelectedHats(prev => {
      const isAlreadySelected = prev.some(h => h.id === hat.id);
      
      if (isAlreadySelected) {
        const newList = prev.filter(h => h.id !== hat.id);
        if (activeHat?.id === hat.id) {
          setActiveHat(newList.length > 0 ? newList[newList.length - 1] : null);
        }
        return newList;
      } else {
        const newList = [...prev, hat];
        setActiveHat(hat);
        return newList;
      }
    });
  };

  const handleTileClick = (hat: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFlippedTiles(prev => {
      const newState = { ...prev };
      newState[hat.id] = !prev[hat.id];
      return newState;
    });
    toggleSelectHat(hat);
  };

  // ✅ Hover handlers
  const handleTileMouseEnter = (hat: any) => setHovered({ hat });
  const handleTileMouseLeave = () => setHovered(null);

  // ✅ Mobile long‑press
  const handleTouchStart = (hat: any) => {
    longPressTimer.current = setTimeout(() => {
      setHovered({ hat });
      setTimeout(() => setHovered(null), 2500);
    }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  if (!isMounted) return null;

  return (
    <div style={{ 
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      display: "flex", 
      height: "100vh", 
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>
      {/* LEFT PANEL — FULLY SELF‑CONTAINED */}
      <div style={{ 
        width: "calc(100% - 400px)", 
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
      }}>

        {/* FIXED HEADER — NAME + PHOTO + SEARCH — 100% LOCKED */}
        <div style={{
          flexShrink: 0,
          background: "#0a0a0a",
          padding: "12px 12px 8px 12px",
          borderBottom: "1px solid #222",
          position: "relative",
          zIndex: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#151515",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid #333"
            }}>
              <img 
                src="/images/universal-mic.png" 
                alt="Profile" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Mike Gold</h2>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.6 }}>Systems / Architect</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search hats, tags, capabilities or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#151515",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14
            }}
          />
        </div>

        {/* ONLY THIS CONTAINER SCROLLS — ISOLATED SCROLL */}
        <div 
          style={{ 
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minHeight: 0,
            position: "relative",
            zIndex: 10
          }}
          onWheel={(e) => e.stopPropagation()}
        >

          {Object.entries(hatsByHouse).map(([house, hatsList]) => {
            if (hatsList.length === 0) return null;
            const houseScore = getHouseScore(hatsList);
            const housePercent = Math.round(houseScore * 100);

            return (
              <div key={house}>
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, [house]: !prev[house] }))}
                  style={{
                    padding: "8px 12px",
                    background: "#121212",
                    border: "1px solid #222",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <h3 style={{ margin: 0, textTransform: "capitalize", fontSize: 15 }}>
                      {house} <span style={{ opacity: 0.5, fontSize: 12 }}>({hatsList.length})</span>
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

                {!collapsedSections[house] && (
                  <div 
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: 4,
                      paddingLeft: 0,
                      position: "relative"
                    }}
                  >
                    {hatsList.map((hat) => {
                      const isSelected = selectedHats.some(h => h.id === hat.id);
                      const weightScore = calculateWeight(hat);
                      const stats = getHatStats(hat);
                      const isFlipped = flippedTiles[hat.id] || false;
                      const isHovered = hovered?.hat.id === hat.id;

                      return (
                        <div
                          key={hat.id}
                          onMouseEnter={() => handleTileMouseEnter(hat)}
                          onMouseLeave={handleTileMouseLeave}
                          onClick={(e) => handleTileClick(hat, e)}
                          onTouchStart={() => handleTouchStart(hat)}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                          style={{
                            aspectRatio: "1/1",
                            perspective: "1200px",
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                            position: "relative", // ✅ This makes overlay position RELATIVE TO TILE
                            overflow: "hidden",
                            borderRadius: "6px",
                            isolation: "isolate"
                          }}
                        >
                          {/* FLIP CONTAINER */}
                          <div style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            transformStyle: "preserve-3d",
                            transformOrigin: "center center",
                            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            boxShadow: isSelected 
                              ? "0 0 10px #2563eb, inset 0 0 15px rgba(37, 99, 235, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)" 
                              : "none",
                            backgroundColor: "transparent",
                            backgroundImage: isSelected ? "linear-gradient(90deg, #2563eb33 0%, #3b82f655 50%, #2563eb33 100%)" : "none",
                            backgroundSize: "200% 100%",
                            backgroundPosition: "0% 0%",
                            animation: isSelected ? "shimmer 0.6s linear infinite" : "none"
                          }}>
                            <style>{`
                              @keyframes shimmer {
                                0% { background-position: 200% 0; }
                                100% { background-position: -200% 0; }
                              }
                            `}</style>

                            {/* FRONT FACE */}
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: isSelected ? "#2563eb22" : "#151515",
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
                              backfaceVisibility: "hidden",
                              overflow: "hidden",
                              wordBreak: "break-word",
                              zIndex: 2,
                              transform: "rotateY(0deg)"
                            }}>
                              <strong style={{ fontSize: 11, marginBottom: 1, width: "100%" }}>
                                {hat.name}
                              </strong>
                              <div style={{ position: "absolute", bottom: 2, right: 2, fontSize: 8, opacity: 0.5 }}>
                                {weightScore.toFixed(2)}
                              </div>
                            </div>

                            {/* BACK FACE */}
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #444",
                              borderRadius: 6,
                              padding: 4,
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-around",
                              zIndex: 1
                            }}>
                              {Object.entries(stats).map(([key, value]) => (
                                <div key={key} style={{ width: "100%" }}>
                                  <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 1, textTransform: "capitalize" }}>
                                    {key}
                                  </div>
                                  <div style={{ height: 3, backgroundColor: "#222", borderRadius: 1, overflow: "hidden" }}>
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

                          {/* ✅ OVERLAY — ON TOP OF THE TILE, FIXED POSITION */}
                          {isHovered && (
                            <div
                              style={{
                                position: "absolute", // ✅ RELATIVE TO TILE — always on it
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.85)",
                                border: "1px solid #555",
                                borderRadius: "6px",
                                zIndex: 10, // ✅ On top of everything
                                fontSize: "9px",
                                lineHeight: "1.2",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                padding: "4px",
                                boxSizing: "border-box",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {!isFlipped ? hat.description || "No description" : hat.name}
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

        {/* FIXED CLEAR SELECTION — BOTTOM, LOCKED */}
        {selectedHats.length > 0 && (
          <div style={{ 
            flexShrink: 0,
            background: "#0a0a0a",
            padding: "8px 12px 12px 12px",
            borderTop: "1px solid #222",
            position: "relative",
            zIndex: 20
          }}>
            <div style={{ 
              padding: "8px 12px",   
              background: "#151515", 
              border: "1px solid #222", 
              borderRadius: 8,
              height: "44px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{ fontSize: 13, opacity: 0.7, flexShrink: 0 }}>
                Selected ({selectedHats.length})
              </div>

              <div style={{ 
                flex: 1,
                overflowX: "auto",
                overflowY: "hidden",
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                paddingBottom: "2px"
              }}>
                {selectedHats.map(hat => (
                  <div key={hat.id} style={{
                    backgroundColor: "#2563eb22",
                    border: "1px solid #2563eb66",
                    padding: "3px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0
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

              <button 
                onClick={() => {
                  setSelectedHats([]);
                  setActiveHat(null);
                }} 
                style={{ fontSize: 12, opacity: 0.6, background: "none", border: "none", color: "#fff", cursor: "pointer", flexShrink: 0 }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER — ISOLATED SCROLL */}
      <div 
        style={{ 
          width: "400px", 
          height: "100vh", 
          overflow: "hidden",
          flexShrink: 0 
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <HatDrawer
          hat={activeHat}
          relatedHats={relatedHats}
          onSelectHat={(hat: any) => {
            setActiveHat(hat);
            toggleSelectHat(hat);
          }}
          onClose={() => setActiveHat(null)}
        />
      </div>
    </div>
  );
}