"use client";

import { useState } from "react";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";

function youtubeId(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}

export default function EvidenceCard({
  evidence,
}: {
  evidence: PublicEvidenceProjection;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = evidence.evidenceType === "video" ? youtubeId(evidence.externalUrl) : null;
  const evidenceLabel = evidence.role
    ? `${evidence.role.replaceAll("-", " ")} evidence`
    : evidence.sourceAuthor ?? evidence.evidenceType;

  return (
    <article className={`evidence-card evidence-card-${evidence.role ?? evidence.evidenceType}${videoId ? " evidence-card-video" : ""}`}>
      {videoId && (
        <div className="evidence-media">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={evidence.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setIsPlaying(true)}>
              {evidence.thumbnailUrl && (
                <img src={evidence.thumbnailUrl} alt="" loading="lazy" />
              )}
              <span>PLAY EVIDENCE</span>
            </button>
          )}
        </div>
      )}
      {!videoId && evidence.assetPath && (
        <div className={`evidence-image evidence-image-${evidence.role ?? "reference"}`}>
          <img src={evidence.assetPath} alt={evidence.title} loading="lazy" />
        </div>
      )}
      <span>
        {evidence.placeholder
          ? "Evidence being collated"
          : evidenceLabel}
      </span>
      <strong>{evidence.title}</strong>
      {evidence.description && <p>{evidence.description}</p>}
    </article>
  );
}
