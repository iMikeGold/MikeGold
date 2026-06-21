"use client";

// ====================================================
// iD Gravity Core — Tile Interaction Kernel v1.6
// NOW LAYOUT AWARE: Desktop / Compact / Mobile
// DIFFERENT BEHAVIOR PER MODE
// ====================================================

import { useEffect, useRef, useState } from "react";

export type TileState = "idle" | "hovered" | "selected" | "flipped" | "preview";
type Mode = "mouse" | "touch";
type LayoutMode = "desktop" | "compact" | "mobile";
type Overlay = { id: string; text: string } | null;

// Make layout optional + safe fallback
export function useInteractionKernel(
  flippedMap: Record<string, boolean>,
  layout?: { isMobile: boolean; isCompact: boolean; isPortrait: boolean }
) {
  const [mode, setMode] = useState<Mode>("mouse");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const longPress = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setMode(isTouch ? "touch" : "mouse");

    // Safe check: if layout is missing, default to desktop
    if (!layout) {
      setLayoutMode("desktop");
      return;
    }

    if (layout.isMobile || layout.isPortrait) setLayoutMode("mobile");
    else if (layout.isCompact) setLayoutMode("compact");
    else setLayoutMode("desktop");
  }, [layout]);

  const clear = () => {
    setActiveId(null);
    setOverlay(null);
  };

  const enter = (id: string, hat: any) => {
    if (mode === "touch") return;
    if (layoutMode === "desktop") {
      setActiveId(id);
      setOverlay({
        id,
        text: flippedMap[id] ? hat.name : hat.description || hat.name
      });
    }
  };

  const leave = () => {
    if (mode === "touch") return;
    clear();
  };

  const touchStart = (id: string, hat: any, e: React.TouchEvent) => {
    if (mode !== "touch") return;
    e.preventDefault();
    longPress.current = setTimeout(() => {
      setActiveId(id);
      setOverlay({ id, text: flippedMap[id] ? hat.name : hat.description || hat.name });
    }, 450);
  };

  const touchEnd = (e: React.TouchEvent) => {
    if (longPress.current) clearTimeout(longPress.current);
    clear();
  };

  const click = (toggleFlip: () => void, toggleSelect: () => void) => {
    clear();
    requestAnimationFrame(() => {
      if (layoutMode === "desktop") {
        toggleFlip();
        toggleSelect();
      } else if (layoutMode === "compact") {
        toggleSelect();
      } else {
        toggleSelect();
      }
    });
  };

  const getTileState = (id: string, isSelected: boolean, isFlipped: boolean): TileState => {
    if (activeId !== id) return "idle";
    if (overlay) return "preview";
    if (isFlipped) return "flipped";
    if (isSelected) return "selected";
    return "hovered";
  };

  const getOverlay = (id: string) => (overlay?.id === id ? overlay.text : null);

  return { mode, layoutMode, enter, leave, touchStart, touchEnd, click, getTileState, getOverlay };
}