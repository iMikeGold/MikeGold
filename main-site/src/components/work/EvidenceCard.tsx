"use client";

import { useState } from "react";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";

function youtubeId(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
    }
    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function EvidenceCard({
  evidence,
  compact = false,
}: {
  evidence: PublicEvidenceProjection;
  compact?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = evidence.evidenceType === "video" ? youtubeId(evidence.externalUrl) : null;
  const evidenceLabel = evidence.role
    ? `${evidence.role.replaceAll("-", " ")} evidence`
    : evidence.sourceAuthor ?? evidence.evidenceType;
  const identityDescriptor = `${evidence.title} ${evidence.assetPath ?? ""}`;
  const isBjorrIdentityEmblem =
    evidence.role === "identity" && evidence.assetPath?.includes("/projects/bjorr/");
  const needsDarkIdentityStage =
    isBjorrIdentityEmblem &&
    /(white|cream[^/]*(?:gold|shadow)|cream\/gold-shadow|yellow[^/]*(?:stone|silver))/i.test(
      identityDescriptor,
    );

  const imageClassName = [
    "evidence-image",
    `evidence-image-${evidence.role ?? "reference"}`,
    isBjorrIdentityEmblem ? "evidence-image-bjorr-emblem" : "",
    needsDarkIdentityStage ? "evidence-image-dark-stage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={`evidence-card evidence-card-${evidence.role ?? evidence.evidenceType}${
        videoId ? " evidence-card-video" : ""
      }${compact ? " is-compact" : ""}`}
    >
      {videoId && (
        <>
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
          {evidence.externalUrl && (
            <a href={evidence.externalUrl} target="_blank" rel="noreferrer">
              Open video on YouTube ↗
            </a>
          )}
        </>
      )}
      {!videoId && evidence.assetPath && (
        <div className={imageClassName}>
          <img src={evidence.assetPath} alt={evidence.title} loading="lazy" />
        </div>
      )}
      <span>
        {evidence.placeholder
          ? "Evidence being collated"
          : [evidence.period, evidence.phase, evidenceLabel].filter(Boolean).join(" · ")}
      </span>
      <strong>{evidence.title}</strong>
      {!compact && evidence.description && <p>{evidence.description}</p>}
    </article>
  );
}
