"use client";

import { useServiceEngineSession } from "./ServiceEngineSession";

export default function HomeSuggestions() {
  const { submittedResult } = useServiceEngineSession();
  if (submittedResult) return null;
  return (
    <div className="hero-suggestions">
      Suggestions:
      <ul>
        <li>Audio system for live performance</li>
        <li>Backend infrastructure for media</li>
        <li>Interactive installation</li>
        <li>Hardware + software product</li>
      </ul>
    </div>
  );
}
