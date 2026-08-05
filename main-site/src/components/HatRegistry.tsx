"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { hats, type Hat } from "../system/registry";
import { getHatProfile, PROFILE_AXES } from "../system/profile/hat-profile";
import {
  findRelatedHatsForSelection,
  searchHats,
} from "../system/services/service-engine";
import { calculateWeight } from "../system/services/weights";
import {
  PROFILE_AXIS_COLOURS,
  resolveContextualDominanceMap,
} from "../system/services/profile-interpreter";
import { selectPrincipalLayerHats } from "../system/services/polygon-engine";
import HatDrawer from "./HatDrawer";
import { useInteractionKernel } from "./interaction/InteractionKernel";

const HAT_LAYER_COLOURS = [
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
] as const;

const HOUSES = ["creative", "design", "engineering"] as const;
type House = (typeof HOUSES)[number];

const globalCSS = `
* { box-sizing: border-box; }

@keyframes hat-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  [data-hat-tile-face] {
    transition: none !important;
    animation: none !important;
  }
}

[data-hat-tile]:focus-visible,
.hat-category-toggle:focus-visible,
.hat-console button:focus-visible,
.hat-selected-chip button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

#hat-registry-root {
  --hat-profile-width: 420px;
  width: 100%;
  height: max(620px, calc(100dvh - 250px));
  min-height: 620px;
  max-height: 920px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, var(--hat-profile-width));
  grid-template-rows: minmax(0, 1fr) 58px;
  grid-template-areas:
    "browser profile"
    "selection profile";
  overflow: hidden;
  overscroll-behavior: contain;
  border: 1px solid #1b1b1b;
  background: #090909;
  color: #fff;
  font-family: sans-serif;
}

#hat-registry-left-panel {
  grid-area: browser;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  background: #090909;
}

.hat-registry-search {
  display: flex;
  gap: 7px;
  padding: 8px 10px 10px;
  border-bottom: 1px solid #222;
  background: #0a0a0a;
}

.hat-registry-search input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #151515;
  color: #fff;
  font-size: 13px;
}

.hat-registry-search button {
  min-width: 46px;
  min-height: 40px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #202020;
  color: #fff;
  cursor: pointer;
}

.hat-registry-browser {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 8px 10px 18px;
  scrollbar-gutter: stable;
}

.hat-registry-house + .hat-registry-house { margin-top: 12px; }

.hat-category-toggle {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #282828;
  border-radius: 8px;
  background: #121212;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.hat-category-toggle__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
}

.hat-category-toggle__heading strong {
  font-size: 15px;
  font-weight: 500;
  text-transform: capitalize;
}

.hat-category-toggle__heading small {
  opacity: 0.5;
  font-size: 12px;
}

.hat-category-toggle__arrow {
  opacity: 0.7;
  transition: transform 160ms ease;
}

.hat-category-toggle[aria-expanded="true"] .hat-category-toggle__arrow {
  transform: rotate(180deg);
}

.hat-category-meter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.hat-category-meter > span:first-child {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #242424;
}

.hat-category-meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #3b82f6;
}

.hat-category-meter small {
  min-width: 92px;
  opacity: 0.72;
  font-size: 10px;
  text-align: right;
}

.hat-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 5px;
  width: 100%;
  padding-top: 6px;
}

.hat-tile {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  isolation: isolate;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

#hat-registry-bottom-bar {
  grid-area: selection;
  min-width: 0;
  padding: 6px 10px 8px;
  border-top: 1px solid #222;
  background: #0a0a0a;
}

.hat-selected-bar {
  height: 44px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid #292929;
  border-radius: 8px;
  background: #151515;
}

.hat-selected-bar > span {
  flex-shrink: 0;
  opacity: 0.72;
  font-size: 12px;
}

.hat-selected-list {
  min-width: 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: thin;
}

.hat-selected-chip {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--chip-colour);
  border-radius: 999px;
  background: color-mix(in srgb, var(--chip-colour) 10%, #151515);
}

.hat-selected-chip > button:first-of-type {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 2px 4px 8px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
}

.hat-selected-chip i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chip-colour);
}

.hat-selected-chip > button:last-child {
  padding: 3px 7px 3px 3px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.hat-clear-selection {
  border: 0;
  background: transparent;
  color: #fff;
  opacity: 0.65;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

#hat-registry-drawer {
  grid-area: profile;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid #222;
  background: #111;
}

.hat-console {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto auto auto minmax(0, 1fr);
  overflow: hidden;
  background: #111;
}

.hat-console__header {
  padding: 13px 16px 9px;
  border-bottom: 1px solid #242424;
}

.hat-console__title-block h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
}

.hat-console__title-block p {
  margin: 0;
  opacity: 0.72;
  font-size: 11px;
}

.hat-console__title-block small {
  display: block;
  margin-top: 4px;
  color: #f472b6;
  font-size: 10px;
}

.hat-console__visual {
  display: grid;
  grid-template-columns: minmax(150px, 0.9fr) minmax(150px, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 0;
  padding: 8px 12px;
  border-bottom: 1px solid #242424;
}

.hat-console__radar {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hat-console__axis-inspector {
  min-width: 0;
  display: grid;
  gap: 7px;
}

.hat-console__axis-focus {
  min-width: 0;
  padding: 8px 9px;
  border: 1px solid #292929;
  border-radius: 6px;
  background: #151515;
}

.hat-console__axis-focus > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hat-console__axis-focus i,
.hat-console__axis-list i {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.hat-console__axis-focus span {
  opacity: 0.72;
  font-size: 10px;
}

.hat-console__axis-focus strong {
  display: block;
  margin-top: 3px;
  font-size: 19px;
}

.hat-console__axis-focus p {
  margin: 3px 0 0;
  color: #8f8f8f;
  font-size: 8.5px;
  line-height: 1.3;
}

.hat-console__axis-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
}

.hat-console__axis-list button {
  min-width: 0;
  display: grid;
  grid-template-columns: 7px minmax(0, 1fr) auto;
  align-items: center;
  gap: 4px;
  padding: 4px 5px;
  border: 1px solid #252525;
  border-radius: 4px;
  background: #131313;
  color: #aaa;
  font-size: 8px;
  cursor: pointer;
}

.hat-console__axis-list button.is-active {
  border-color: #565656;
  color: #fff;
  background: #1a1a1a;
}

.hat-console__axis-list span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hat-console__axis-list strong { font-size: 8px; }

.hat-console__summary {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 0;
  padding: 9px 14px;
  border-bottom: 1px solid #242424;
  color: #ddd;
  font-size: 11px;
  line-height: 1.45;
}

.hat-console__tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid #242424;
  background: #101010;
}

.hat-console__tabs button {
  min-width: 0;
  padding: 9px 4px;
  border: 0;
  border-right: 1px solid #222;
  background: transparent;
  color: #858585;
  font-size: 9px;
  cursor: pointer;
}

.hat-console__tabs button:last-child { border-right: 0; }

.hat-console__tabs button.is-active {
  color: #fff;
  background: #181818;
  box-shadow: inset 0 -2px #60a5fa;
}

.hat-console__content {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 12px 14px 18px;
  color: #ddd;
  font-size: 11px;
  line-height: 1.5;
  scrollbar-gutter: stable;
}

.hat-console__content-section > p { margin: 0; }

.hat-console__content-section ul {
  margin: 0;
  padding-left: 18px;
}

.hat-console__content-section li + li { margin-top: 4px; }

.hat-console__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
}

.hat-console__tags span {
  padding: 3px 7px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #181818;
  font-size: 9px;
}

.hat-console__related {
  display: grid;
  gap: 7px;
}

.hat-console__related > p { margin: 0; }

.hat-console__related button {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #151515;
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.hat-console__related small {
  opacity: 0.6;
  font-size: 9px;
}

.hat-registry-empty {
  padding: 18px;
  border: 1px solid #292929;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}

#hat-registry-root[data-mobile="true"][data-portrait="false"] {
  height: max(520px, calc(100dvh - 150px));
  min-height: 520px;
  max-height: none;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 42%);
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] {
  height: max(680px, calc(100dvh - 215px));
  min-height: 680px;
  max-height: none;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: clamp(390px, 46dvh, 470px) 58px minmax(230px, 1fr);
  grid-template-areas:
    "profile"
    "selection"
    "browser";
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] #hat-registry-drawer {
  border-left: 0;
  border-bottom: 1px solid #222;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__header {
  padding: 10px 14px 7px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__visual {
  grid-template-columns: minmax(138px, 0.82fr) minmax(126px, 1fr);
  gap: 7px;
  padding: 6px 8px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__axis-focus {
  padding: 6px 7px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__axis-focus strong {
  font-size: 16px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__axis-focus p {
  font-size: 7.5px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__axis-list button {
  padding: 3px 4px;
  font-size: 7.5px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__summary {
  padding: 7px 12px;
  font-size: 10px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__tabs button {
  padding: 7px 3px;
  font-size: 8px;
}

#hat-registry-root[data-mobile="true"][data-portrait="true"] .hat-console__content {
  padding: 9px 12px 14px;
  font-size: 10px;
}

@media (max-width: 720px) {
  .hat-tile-grid {
    grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  }
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
  const initialHat =
    hats.find((hat) => hat.slug === initialHatId || hat.id === initialHatId) ?? null;
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const POLYGON_SIZE = 200;
  const DRAWER_MIN_WIDTH = 340;
  const DRAWER_MAX_WIDTH = 460;
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_MIN_WIDTH);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedHats, setSelectedHats] = useState<Hat[]>(initialHat ? [initialHat] : []);
  const [activeHat, setActiveHat] = useState<Hat | null>(initialHat);
  const [collapsedSections, setCollapsedSections] = useState<Record<House, boolean>>({
    creative: true,
    design: true,
    engineering: true,
  });
  const [flippedTiles, setFlippedTiles] = useState<Record<string, boolean>>({});
  const [colourSlots, setColourSlots] = useState<Record<string, number>>({});
  const [pendingRevealHatId, setPendingRevealHatId] = useState<string | null>(null);

  const tileBrowserRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef(new Map<string, HTMLElement>());
  const houseRefs = useRef(new Map<House, HTMLElement>());

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.visualViewport?.height ?? window.innerHeight;
      const portrait = height > width;
      const touchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || width < 768;
      const mobile = touchDevice || width < 768;

      setIsMobile(mobile);
      setIsPortrait(portrait);
      setDrawerWidth(
        mobile && portrait
          ? width
          : Math.max(DRAWER_MIN_WIDTH, Math.min(DRAWER_MAX_WIDTH, width * 0.38)),
      );
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);
    window.addEventListener("orientationchange", checkLayout);
    window.visualViewport?.addEventListener("resize", checkLayout);
    return () => {
      window.removeEventListener("resize", checkLayout);
      window.removeEventListener("orientationchange", checkLayout);
      window.visualViewport?.removeEventListener("resize", checkLayout);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedQuery = params.get("q")?.trim();
    if (requestedQuery) setSearchQuery(requestedQuery);

    const requestedHatId = params.get("hat")?.trim();
    if (!requestedHatId) return;

    const requestedHat = hats.find(
      (hat) => hat.slug === requestedHatId || hat.id === requestedHatId,
    );
    if (!requestedHat) return;

    setSelectedHats([requestedHat]);
    setActiveHat(requestedHat);
    setCollapsedSections((previous) => ({
      ...previous,
      [requestedHat.category]: false,
    }));
    setPendingRevealHatId(requestedHat.id);
  }, []);

  const interaction = useInteractionKernel(flippedTiles, {
    isMobile,
    isCompact: drawerWidth >= 400,
    isPortrait,
  });

  const filteredHats = useMemo(
    () => searchHats(hats, searchQuery).map(({ hat }) => hat),
    [searchQuery],
  );

  const hatsByHouse = useMemo(() => {
    const groups: Record<House, Hat[]> = {
      creative: [],
      design: [],
      engineering: [],
    };
    filteredHats.forEach((hat) => groups[hat.category].push(hat));
    return groups;
  }, [filteredHats]);

  const registryHouseCounts = useMemo(
    () =>
      hats.reduce<Record<House, number>>(
        (counts, hat) => {
          counts[hat.category] += 1;
          return counts;
        },
        { creative: 0, design: 0, engineering: 0 },
      ),
    [],
  );

  const relatedHats = useMemo(
    () =>
      findRelatedHatsForSelection(
        selectedHats.length ? selectedHats : activeHat ? [activeHat] : [],
        hats,
      ),
    [activeHat, selectedHats],
  );
  const principalLayerHats = useMemo(
    () => selectPrincipalLayerHats(selectedHats, 7),
    [selectedHats],
  );
  const contextualDominance = useMemo(
    () => resolveContextualDominanceMap(selectedHats),
    [selectedHats],
  );

  useEffect(() => {
    setColourSlots((previous) => {
      const visibleIds = new Set(principalLayerHats.map((hat) => hat.id));
      const next = Object.entries(previous).reduce<Record<string, number>>(
        (slots, [id, slot]) => {
          if (visibleIds.has(id)) slots[id] = slot;
          return slots;
        },
        {},
      );
      const occupied = new Set(Object.values(next));
      principalLayerHats.forEach((hat) => {
        if (Number.isInteger(next[hat.id])) return;
        const slot = HAT_LAYER_COLOURS.findIndex((_, index) => !occupied.has(index));
        if (slot < 0) return;
        next[hat.id] = slot;
        occupied.add(slot);
      });
      return next;
    });
  }, [principalLayerHats]);

  useLayoutEffect(() => {
    if (!pendingRevealHatId) return;
    const tile = tileRefs.current.get(pendingRevealHatId);
    const browser = tileBrowserRef.current;
    if (!tile || !browser) return;

    const frame = window.requestAnimationFrame(() => {
      const browserBox = browser.getBoundingClientRect();
      const tileBox = tile.getBoundingClientRect();
      const top =
        browser.scrollTop +
        tileBox.top -
        browserBox.top -
        Math.max(8, (browserBox.height - tileBox.height) / 2);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      browser.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      tile.focus({ preventScroll: true });
      setPendingRevealHatId(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [collapsedSections, filteredHats, pendingRevealHatId]);

  const focusHouseHeader = (house: House) => {
    window.requestAnimationFrame(() => {
      houseRefs.current.get(house)?.scrollIntoView({ block: "nearest" });
    });
  };

  const toggleSelectHat = (hat: Hat) => {
    const exists = selectedHats.some((selected) => selected.id === hat.id);

    if (exists) {
      const updated = selectedHats.filter((selected) => selected.id !== hat.id);
      setSelectedHats(updated);
      setFlippedTiles((previous) => ({ ...previous, [hat.id]: false }));
      if (activeHat?.id === hat.id) setActiveHat(updated.at(-1) ?? null);
      return;
    }

    setSelectedHats((previous) => [...previous, hat]);
    setActiveHat(hat);

    if (isMobile) {
      setCollapsedSections((previous) => ({ ...previous, [hat.category]: true }));
      focusHouseHeader(hat.category);
    }
  };

  const handleSelectRelated = (hat: Hat) => {
    setActiveHat(hat);
    setSelectedHats((previous) =>
      previous.some((selected) => selected.id === hat.id) ? previous : [...previous, hat],
    );
    setFlippedTiles((previous) => ({ ...previous, [hat.id]: true }));
    setCollapsedSections((previous) => ({ ...previous, [hat.category]: false }));
    setSearchQuery("");
    setPendingRevealHatId(hat.id);
  };

  const clearSelection = () => {
    setSelectedHats([]);
    setActiveHat(null);
    setFlippedTiles({});
    setPendingRevealHatId(null);
    setColourSlots({});
  };

  const rootStyle = {
    "--hat-profile-width": `${drawerWidth}px`,
  } as CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

      <div
        id="hat-registry-root"
        data-mobile={String(isMobile)}
        data-portrait={String(isPortrait)}
        style={rootStyle}
      >
        <div id="hat-registry-left-panel">
          <form
            className="hat-registry-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="search"
              enterKeyHint="search"
              placeholder="Search hats, tags, capabilities..."
              value={searchQuery}
              onChange={(event) => {
                setPendingRevealHatId(null);
                setSearchQuery(event.target.value);
              }}
            />
            <button type="submit" aria-label="Search Hats">
              Go
            </button>
          </form>

          <div ref={tileBrowserRef} className="hat-registry-browser">
            {searchQuery.trim() && filteredHats.length === 0 && (
              <div className="hat-registry-empty">
                Add a specialist term such as media, web, audio, PCB or deployment.
                Generic role words such as engineer are ignored.
              </div>
            )}

            {HOUSES.map((house) => {
              const hatsList = hatsByHouse[house];
              if (!hatsList.length) return null;

              const registryCount = registryHouseCounts[house];
              const registryShare = hats.length ? registryCount / hats.length : 0;
              const isOpen = searchQuery.trim() ? true : !collapsedSections[house];

              return (
                <section
                  className="hat-registry-house"
                  key={house}
                  ref={(element) => {
                    if (element) houseRefs.current.set(house, element);
                    else houseRefs.current.delete(house);
                  }}
                >
                  <button
                    type="button"
                    className="hat-category-toggle"
                    aria-expanded={isOpen}
                    onClick={() => {
                      if (searchQuery.trim()) return;
                      setCollapsedSections((previous) => ({
                        ...previous,
                        [house]: !previous[house],
                      }));
                    }}
                  >
                    <span className="hat-category-toggle__heading">
                      <strong>
                        {house} <small>({registryCount})</small>
                      </strong>
                      <span className="hat-category-toggle__arrow" aria-hidden="true">
                        ▼
                      </span>
                    </span>
                    <span className="hat-category-meter">
                      <span>
                        <i style={{ width: `${registryShare * 100}%` }} />
                      </span>
                      <small>
                        {registryCount} / {hats.length} · {(registryShare * 100).toFixed(1)}%
                      </small>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="hat-tile-grid">
                      {hatsList.map((hat) => {
                        const isSelected = selectedHats.some(
                          (selected) => selected.id === hat.id,
                        );
                        const weightScore = calculateWeight(hat);
                        const stats = getHatStats(hat);
                        const isFlipped = flippedTiles[hat.id] ?? false;
                        const overlayText = interaction.getOverlay(hat.id);
                        const dominance = contextualDominance.get(hat.id);
                        const layerColour =
                          HAT_LAYER_COLOURS[colourSlots[hat.id] ?? 0];

                        return (
                          <a
                            key={hat.id}
                            id={`hat-tile-${hat.id}`}
                            href={`/registry?hat=${encodeURIComponent(hat.slug)}`}
                            ref={(element) => {
                              if (element) tileRefs.current.set(hat.id, element);
                              else tileRefs.current.delete(hat.id);
                            }}
                            className="hat-tile"
                            data-hat-tile
                            aria-label={`${hat.name}, score ${weightScore.toFixed(2)}`}
                            onMouseEnter={() => interaction.enter(hat.id, hat)}
                            onMouseLeave={interaction.leave}
                            onTouchStart={() => interaction.touchStart(hat.id, hat)}
                            onTouchEnd={interaction.touchEnd}
                            onClick={(event) => {
                              event.preventDefault();
                              interaction.click(
                                () =>
                                  setFlippedTiles((previous) => ({
                                    ...previous,
                                    [hat.id]: !previous[hat.id],
                                  })),
                                () => toggleSelectHat(hat),
                              );
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              interaction.click(
                                () =>
                                  setFlippedTiles((previous) => ({
                                    ...previous,
                                    [hat.id]: !previous[hat.id],
                                  })),
                                () => toggleSelectHat(hat),
                              );
                            }}
                          >
                            <div
                              data-hat-tile-face
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                transformStyle: "preserve-3d",
                                transformOrigin: "center",
                                transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                boxShadow: isSelected
                                  ? `0 0 10px ${layerColour}, inset 0 0 15px ${layerColour}55`
                                  : "none",
                                backgroundImage: isSelected
                                  ? `linear-gradient(90deg, ${layerColour}22, ${layerColour}55, ${layerColour}22)`
                                  : "none",
                                backgroundSize: "200% 100%",
                                animation: isSelected
                                  ? "hat-shimmer 0.6s linear infinite"
                                  : "none",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 5,
                                  border: isSelected
                                    ? `1px solid ${layerColour}`
                                    : "1px solid #333",
                                  borderRadius: 6,
                                  background: isSelected ? `${layerColour}22` : "#151515",
                                  textAlign: "center",
                                  backfaceVisibility: "hidden",
                                }}
                              >
                                <strong
                                  style={{
                                    width: "100%",
                                    fontSize: 10,
                                    lineHeight: 1.1,
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {hat.name}
                                </strong>
                                {isSelected && dominance && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      left: 4,
                                      bottom: 3,
                                      maxWidth: "72%",
                                      overflow: "hidden",
                                      color: dominance.colour,
                                      fontSize: 6.5,
                                      textOverflow: "ellipsis",
                                      textTransform: "uppercase",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {dominance.confidence === "balanced"
                                      ? "balanced"
                                      : dominance.primaryAxis}
                                  </span>
                                )}
                                <span
                                  style={{
                                    position: "absolute",
                                    right: 3,
                                    bottom: 2,
                                    opacity: 0.5,
                                    fontSize: 8,
                                  }}
                                >
                                  {weightScore.toFixed(2)}
                                </span>
                              </div>

                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "space-around",
                                  padding: 5,
                                  border: isSelected
                                    ? `1px solid ${layerColour}`
                                    : "1px solid #444",
                                  borderRadius: 6,
                                  background: "#1a1a1a",
                                  transform: "rotateY(180deg)",
                                  backfaceVisibility: "hidden",
                                  overflow: "hidden",
                                }}
                              >
                                {Object.entries(stats).map(([axis, value], axisIndex) => (
                                  <div key={axis} style={{ width: "88%", minWidth: 0 }}>
                                    <div
                                      style={{
                                        marginBottom: 1,
                                        overflow: "hidden",
                                        opacity: 0.68,
                                        fontSize: 6,
                                        textOverflow: "ellipsis",
                                        textTransform: "capitalize",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {axis}
                                    </div>
                                    <div
                                      style={{
                                        width: "100%",
                                        height: 3,
                                        overflow: "hidden",
                                        borderRadius: 2,
                                        background: "#222",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: `${Math.round(value * 100)}%`,
                                          height: "100%",
                                          borderRadius: 2,
                                          background: PROFILE_AXIS_COLOURS[axisIndex],
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {overlayText && !isFlipped && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  zIndex: 5,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  padding: 5,
                                  border: "1px solid #666",
                                  borderRadius: 6,
                                  background: "rgba(0,0,0,0.9)",
                                  textAlign: "center",
                                  fontSize: 9,
                                }}
                              >
                                <span
                                  style={{
                                    display: "-webkit-box",
                                    overflow: "hidden",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 5,
                                  }}
                                >
                                  {overlayText}
                                </span>
                              </div>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <div id="hat-registry-bottom-bar">
          <div className="hat-selected-bar">
            <span>Selected ({selectedHats.length})</span>
            <div className="hat-selected-list">
              {selectedHats.map((hat) => {
                const chipColour = HAT_LAYER_COLOURS[colourSlots[hat.id] ?? 0];
                return (
                  <div
                    className="hat-selected-chip"
                    key={hat.id}
                    style={{ "--chip-colour": chipColour } as CSSProperties}
                  >
                    <button type="button" onClick={() => setActiveHat(hat)}>
                      <i aria-hidden="true" />
                      {hat.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${hat.name}`}
                      onClick={() => toggleSelectHat(hat)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <button type="button" className="hat-clear-selection" onClick={clearSelection}>
              Clear All
            </button>
          </div>
        </div>

        <div id="hat-registry-drawer">
          <HatDrawer
            hat={activeHat}
            selectedHats={selectedHats}
            relatedHats={relatedHats}
            onSelectHat={handleSelectRelated}
            drawerWidth={drawerWidth}
            POLYGON_SIZE={POLYGON_SIZE}
            colourSlots={colourSlots}
          />
        </div>
      </div>
    </>
  );
}
