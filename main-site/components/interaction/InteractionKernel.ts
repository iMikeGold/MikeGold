import { useEffect, useRef, useState } from "react";

// ====================================================
// iD Gravity Core — Tile Interacttion Kernel v1.0.0
// Addressing mobile issues + separtion of logic
// ====================================================

export type TileState =
  | "idle"
  | "hovered"
  | "selected"
  | "flipped"
  | "preview";

type Mode = "mouse" | "touch";

type Overlay = {
  id: string;
  text: string;
} | null;

export function useInteractionKernel(flippedMap: Record<string, boolean>) {
  const [mode, setMode] = useState<Mode>("mouse");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const longPress = useRef<NodeJS.Timeout | null>(null);

  // Detect device type ONCE on mount
  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    setMode(isTouch ? "touch" : "mouse");
  }, []);

  const clear = () => {
    setActiveId(null);
    setOverlay(null);
  };

  // Desktop: hover logic
  const enter = (id: string, hat: any) => {
    if (mode === "touch") return;

    setActiveId(id);
    setOverlay({
      id,
      text: flippedMap[id] ? hat.name : hat.description || "No description",
    });
  };

  const leave = () => {
    if (mode === "touch") return;
    clear();
  };

  // Mobile: long press = preview
  const touchStart = (id: string, hat: any) => {
    if (mode !== "touch") return;

    longPress.current = setTimeout(() => {
      setActiveId(id);
      setOverlay({
        id,
        text: flippedMap[id] ? hat.name : hat.description || "No description",
      });
    }, 450);
  };

  const touchEnd = () => {
    if (longPress.current) clearTimeout(longPress.current);
    clear();
  };

  // Click = always flip + select (both devices)
  const click = (toggleFlip: () => void, toggleSelect: () => void) => {
    clear();
    toggleFlip();
    toggleSelect();
  };

  // Single source of truth for tile visual state
  const getTileState = (
    id: string,
    isSelected: boolean,
    isFlipped: boolean
  ): TileState => {
    if (activeId !== id) return "idle";
    if (overlay) return "preview";
    if (isFlipped) return "flipped";
    if (isSelected) return "selected";
    return "hovered";
  };

  const getOverlay = (id: string) =>
    overlay?.id === id ? overlay.text : null;

  return {
    mode,
    enter,
    leave,
    touchStart,
    touchEnd,
    click,
    getTileState,
    getOverlay,
  };
}