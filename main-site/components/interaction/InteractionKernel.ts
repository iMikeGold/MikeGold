"use client";

import { useEffect, useRef, useState } from "react";

// ====================================================
// iD Gravity Core — Tile Interaction Kernel v1.4
// ✅ BLUE DOT / STUCK STATE 100% FIXED
// ====================================================

export type TileState = "idle" | "hovered" | "selected" | "flipped" | "preview";
type Mode = "mouse" | "touch";
type Overlay = { id: string; text: string } | null;

export function useInteractionKernel(flippedMap: Record<string, boolean>) {
  const [mode, setMode] = useState<Mode>("mouse");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const longPress = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setMode(isTouch ? "touch" : "mouse");
  }, []);

  const clear = () => {
    setActiveId(null);
    setOverlay(null);
  };

  const enter = (id: string, hat: any) => {
    if (mode === "touch") return;
    setActiveId(id);
    setOverlay({
      id,
      text: flippedMap[id] ? hat.name : hat.description || hat.name
    });
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
      toggleFlip();
      toggleSelect();
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

  return { mode, enter, leave, touchStart, touchEnd, click, getTileState, getOverlay };
}