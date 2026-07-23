#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectDirectory = join(projectRoot, "records", "projects");
const workDirectory = join(projectRoot, "records", "work");
const evidenceDirectory = join(projectRoot, "records", "evidence");
const relationshipDirectory = join(projectRoot, "records", "relationships");
const hatMap = JSON.parse(
  readFileSync(join(projectRoot, "records", "migrations", "hat-id-map.v1.json"), "utf8"),
);
const timestamp = "2026-07-20T00:00:00.000Z";

const catalogue = [
  {
    project: "houston-texans-london-game",
    name: "Houston Texans — London Game",
    context: "Houston Texans",
    summary: "Field communications and telecoms resilience work associated with the Texans' London fixture.",
    work: "Field communications and telecom redundancy systems",
    workSummary: "Communications-path and redundancy engineering supporting live field operations.",
    hats: ["network-engineer", "systems-engineer", "reliability-engineer"],
    videoId: "H0jTge4APYs",
    sourceTitle: "Relive It || Texans take down the Jaguars across the pond",
    sourceAuthor: "Houston Texans",
  },
  {
    project: "bluedot-festival-the-orb",
    name: "bluedot festival — The Orb",
    context: "bluedot festival",
    summary: "Live sound-system work supporting The Orb's 2018 bluedot festival performance.",
    work: "Live sound-system design and installation",
    workSummary: "System preparation and live audio engineering for a festival performance environment.",
    hats: ["sound-systems-designer", "foh-engineer", "live-systems-designer"],
    videoId: "3GlBmy-Vxak",
    sourceTitle: "The Orb · Live from bluedot 2018",
    sourceAuthor: "bluedot festival",
  },
  {
    project: "playstation-croatia-ps5-sound-tour",
    name: "PlayStation Croatia — PS5 Sound Tour",
    context: "PlayStation Croatia",
    summary: "Sound-design and audio-system work associated with a Croatian musical tour of the PlayStation 5 startup sound.",
    work: "Sound design and audio systems",
    workSummary: "Audio-system and sound-design contribution for a location-based musical presentation.",
    hats: ["sound-designer", "audio-engineer", "experiential-engineer"],
    videoId: "n2usGeet2Gk",
    sourceTitle: "Početni zvuk PlayStation 5 konzole | Glazbena turneja po Hrvatskoj | PS5",
    sourceAuthor: "PlayStation Hrvatska",
  },
  {
    project: "croydon-womens-network-iwd",
    name: "Croydon Women's Network — International Women's Day",
    context: "Croydon Women's Network / Baltar Media",
    summary: "Camera-system setup work supporting an International Women's Day promotional production.",
    work: "Camera systems and setup",
    workSummary: "Preparation and setup of camera systems for promotional video production.",
    hats: ["media-engineer", "media-workflow-designer"],
    videoId: "yivx4Q2bVBU",
    sourceTitle: "International Women's Day - Croydon Women's Network Promo Video",
    sourceAuthor: "Baltar Media",
  },
  {
    project: "malaria-hotspot-production",
    name: "Malaria — Hotspot",
    context: "Supple Nam",
    summary: "Creative-technical management work associated with the Hotspot choreography production.",
    work: "Creative production management systems",
    workSummary: "Coordination and management of interdependent production requirements.",
    hats: ["creative-project-engineer", "operations-engineer"],
    videoId: "4-WMTSVORa0",
    sourceTitle: "Malaria \"Hotspot\" (Choreographer - Supple Nam)",
    sourceAuthor: "Supple Nam",
  },
  {
    project: "rockett-home-rentals-company-film",
    name: "Rockett Home Rentals — Company Film",
    context: "Rockett Home Rentals",
    summary: "Camera operation and production-workflow contribution to a company film.",
    work: "Camera operation and workflow",
    workSummary: "Camera operation within a structured company-video production workflow.",
    hats: ["media-engineer", "media-workflow-designer"],
    videoId: "ydEox4TatF8",
    sourceTitle: "Rockett Home Rentals Company Video",
    sourceAuthor: "Rockett Home Rentals",
  },
  {
    project: "mars-delight-kung-fu",
    name: "Mars Delight — Kung Fu",
    context: "Supple Nam",
    summary: "Media-management work associated with the Kung Fu performance production.",
    work: "Media management systems",
    workSummary: "Organisation and management of media within a creative production workflow.",
    hats: ["media-workflow-designer", "media-archiving-engineer"],
    videoId: "0WSuxDHcnf4",
    sourceTitle: "Mars Delight “Kung Fu” (Choreographer/Actor: Supple Nam)",
    sourceAuthor: "Supple Nam",
  },
  {
    project: "fbc-london-shopping-with-grant",
    name: "FBC London — Shopping with Grant",
    context: "London Property / FBC London",
    summary: "Media playout and presentation-system work associated with an interior-design feature.",
    work: "Playout systems setup",
    workSummary: "Setup and preparation of media playout for the finished feature.",
    hats: ["media-distribution-engineer", "media-engineer"],
    videoId: "JC-sHp5Xakk",
    sourceTitle: "London Property presents Shopping with Grant, an Interior Design Experience - FBC London",
    sourceAuthor: "London Property",
  },
  {
    project: "the-frisbys-you-are",
    name: "The Frisbys — You Are",
    context: "The Frisbys / Baltar Media",
    summary: "Multicamera setup and operation associated with The Frisbys' You Are production.",
    work: "Multicamera setup and operation",
    workSummary: "Coordination and operation of multiple camera sources within a music-production workflow.",
    hats: ["media-engineer", "media-workflow-designer", "live-systems-designer"],
    videoId: "w9eP13qq_zA",
    sourceTitle: "The Frisbys - You Are",
    sourceAuthor: "Baltar Media",
  },
  {
    project: "delmatic-connected-lighting",
    name: "Delmatic — Connected Lighting Management",
    context: "Delmatic Lighting Management",
    summary: "Sensor-test and manufacturing-engineering work associated with connected lighting controls.",
    work: "Sensor test and manufacturing engineering",
    workSummary: "Testing and production-oriented engineering around connected control-system hardware.",
    hats: ["control-systems-designer", "lighting-systems-designer", "repeatability-engineer"],
    videoId: "0Ckjmo1ayb0",
    sourceTitle: "Connected Lighting Management",
    sourceAuthor: "Delmatic Lighting Management",
  },
  {
    project: "bristow-operational-excellence",
    name: "Bristow — Operational Excellence",
    context: "Bristow Group",
    summary: "Electronics-systems engineering work associated with an operational-excellence programme.",
    work: "Electronics systems engineering",
    workSummary: "Systems-level electronics contribution in an operational environment.",
    hats: ["systems-engineer", "reliability-engineer", "operations-engineer"],
    videoId: "OanbAm_4KvM",
    sourceTitle: "Bristow Operational Excellence Video",
    sourceAuthor: "Bristow Group",
  },
  {
    project: "2xu-wetsuit-testing",
    name: "2XU — Wetsuit Testing",
    context: "2XU",
    summary: "Distribution-system work associated with comparative wetsuit testing.",
    work: "Distribution systems",
    workSummary: "Engineering of reliable distribution paths supporting the test environment.",
    hats: ["systems-engineer", "signal-flow-designer"],
    videoId: "36WtEUKCctU",
    sourceTitle: "Testing 2XU Wetsuits | Propel P:1 P:2 Propel Pro",
    sourceAuthor: "2XU",
  },
  {
    project: "crystal-palace-overground-festival",
    name: "Crystal Palace Overground Festival",
    context: "Crystal Palace Overground Festival",
    summary: "Signal-flow and distribution-system preparation for a live festival site.",
    work: "Distribution systems and signal flow",
    workSummary: "Planning and preparation of signal distribution for a multi-area event environment.",
    hats: ["signal-flow-designer", "live-systems-designer", "systems-engineer"],
    videoId: "I61Y9Pb3XFY",
    sourceTitle: "Crystal Palace Overground Festival Westow Park the Day Before",
    sourceAuthor: "John Edwards",
  },
  {
    project: "stanhope-seta-flash-point-testing",
    name: "Stanhope-Seta — Flash Point Testing",
    context: "Stanhope-Seta",
    summary: "Scientific-equipment and test-system engineering associated with Setaflash testing.",
    work: "Scientific equipment and test systems",
    workSummary: "Test-system work supporting repeatable small-scale flash-point measurement.",
    hats: ["systems-engineer", "repeatability-engineer", "process-lifecycle-engineer"],
    videoId: "DE_s7ocmI9E",
    sourceTitle: "ASTM D3828 Setaflash Small Scale Flash Point Testing by Seta Series 3",
    sourceAuthor: "Stanhope-Seta",
  },
  {
    project: "delta-elektronika-power-systems",
    name: "Delta Elektronika — Power Systems",
    context: "Delta Elektronika",
    summary: "Firmware, installation and deployment work associated with programmable high-power supply systems.",
    work: "Firmware build and installation engineering",
    workSummary: "Build and installation work within an electronically controlled power-system context.",
    hats: ["configuration-engineer", "install-onboarding-engineer", "systems-engineer"],
    videoId: "Vhir8baUfkA",
    sourceTitle: "Delta Elektronika Video",
    sourceAuthor: "Delta Elektronika",
  },
  {
    project: "delta-elektronika-power-systems",
    name: "Delta Elektronika — Power Systems",
    context: "Delta Elektronika",
    summary: "Firmware, installation and deployment work associated with programmable high-power supply systems.",
    work: "Embedded firmware and deployment engineering",
    workSummary: "Deployment-oriented systems work supporting a high-power electronic supply system.",
    hats: ["deployment-engineer", "configuration-engineer", "systems-engineer"],
    videoId: "vfgFpD2qS4g",
    sourceTitle: "Delta High Power Supply System",
    sourceAuthor: "Delta Elektronika",
  },
  {
    project: "five9-customer-story-systems",
    name: "Five9 — Customer Story Systems",
    context: "Five9 / Teladoc / Microsoft",
    summary: "Research and systems-thinking work associated with customer-story and contact-centre environments.",
    work: "Research and systems thinking",
    workSummary: "Analysis of connected operational and communication requirements within a customer-experience system.",
    hats: ["concept-engineer", "systems-engineer", "narrative-systems-thinker"],
    videoId: "rxSlR6tmW-8",
    sourceTitle: "Five9 Customer Heroes | Teladoc: Transforming Virtual Healthcare with Contact Center Innovation",
    sourceAuthor: "Five9",
  },
  {
    project: "five9-customer-story-systems",
    name: "Five9 — Customer Story Systems",
    context: "Five9 / Teladoc / Microsoft",
    summary: "Research and systems-thinking work associated with customer-story and contact-centre environments.",
    work: "Server systems and configuration",
    workSummary: "Configuration-oriented systems work supporting a connected media and communications environment.",
    hats: ["server-engineer", "configuration-engineer", "systems-engineer"],
    videoId: "p2QKbXG02pw",
    sourceTitle: "Five9 and Microsoft: Creating Memorable Stories",
    sourceAuthor: "Five9",
  },
  {
    project: "living-control-media-servers",
    name: "Living Control — Media Servers",
    context: "Living Control / CEDIA",
    summary: "Hardware prototyping and multimedia-distribution work associated with Living Control media-server systems.",
    work: "PCB prototyping and design",
    workSummary: "Hardware prototyping and design work within a dedicated media-server product environment.",
    hats: ["systems-engineer", "repeatability-engineer"],
    videoId: "joaYOliIrG0",
    sourceTitle: "Living Control Studio6 & Studio3 Media Server (CEDIA Expo)",
    sourceAuthor: "Cinenow UK",
  },
  {
    project: "living-control-media-servers",
    name: "Living Control — Media Servers",
    context: "Living Control / CEDIA",
    summary: "Hardware prototyping and multimedia-distribution work associated with Living Control media-server systems.",
    work: "Multimedia distribution",
    workSummary: "Media distribution work supporting dual-output high-definition server delivery.",
    hats: ["media-distribution-engineer", "server-engineer", "signal-flow-designer"],
    videoId: "e_YYiedWe8s",
    sourceTitle: "Living Control Media Server with dual 1080p outputs",
    sourceAuthor: "Cinenow UK",
  },
];

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const classifyWork = (title) => {
  const value = title.toLowerCase();
  const groups = new Set();
  if (/management|research|systems thinking/.test(value)) {
    groups.add("system-product-definition");
  }
  if (/firmware|deployment|server|configuration|installation/.test(value)) {
    groups.add("infrastructure-operations");
  }
  if (/camera|multicamera|media|playout|sound|audio|distribution/.test(value)) {
    groups.add("media-production-distribution");
  }
  if (
    /communications|telecom|sound|audio|camera|multicamera|sensor|manufacturing|electronics|distribution|scientific|test|firmware|embedded|pcb/.test(
      value,
    )
  ) {
    groups.add("physical-systems-engineering");
  }
  if (!groups.size) groups.add("system-product-definition");
  return [...groups];
};
const read = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null);
const write = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
for (const directory of [projectDirectory, workDirectory, evidenceDirectory, relationshipDirectory]) {
  mkdirSync(directory, { recursive: true });
}

const projectIds = new Map();
for (const item of catalogue) {
  const projectPath = join(projectDirectory, `${item.project}.json`);
  const existing = read(projectPath);
  const projectId = existing?.id ?? randomUUID();
  projectIds.set(item.project, projectId);
  write(projectPath, {
    id: projectId,
    recordType: "project",
    schemaVersion: 1,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: existing?.updatedAt ?? timestamp,
    slug: item.project,
    name: item.name,
    summary: item.summary,
    status: "archived",
    visibility: "public",
    featured: false,
    context: item.context,
  });
}

for (const item of catalogue) {
  const workSlug = `${item.project}-${slugify(item.work)}`;
  const workPath = join(workDirectory, `${workSlug}.json`);
  const existingWork = read(workPath);
  const workId = existingWork?.id ?? randomUUID();
  write(workPath, {
    id: workId,
    recordType: "work",
    schemaVersion: 1,
    createdAt: existingWork?.createdAt ?? timestamp,
    updatedAt: existingWork?.updatedAt ?? timestamp,
    projectId: projectIds.get(item.project),
    slug: workSlug,
    title: item.work,
    summary: item.workSummary,
    status: "historical",
    visibility: "public",
    capabilityGroupIds: classifyWork(item.work),
  });

  const evidenceSlug = `${workSlug}-video`;
  const evidencePath = join(evidenceDirectory, `${evidenceSlug}.json`);
  const existingEvidence = read(evidencePath);
  const evidenceId = existingEvidence?.id ?? randomUUID();
  write(evidencePath, {
    id: evidenceId,
    recordType: "evidence",
    schemaVersion: 1,
    createdAt: existingEvidence?.createdAt ?? timestamp,
    updatedAt: existingEvidence?.updatedAt ?? timestamp,
    slug: evidenceSlug,
    title: item.sourceTitle,
    description: `Supporting video published by ${item.sourceAuthor}.`,
    evidenceType: "video",
    visibility: "public",
    externalUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
    sourceTitle: item.sourceTitle,
    sourceAuthor: item.sourceAuthor,
    placeholder: false,
  });

  const evidenceRelationshipPath = join(
    relationshipDirectory,
    `${workSlug}-evidence.json`,
  );
  const existingEvidenceRelationship = read(evidenceRelationshipPath);
  write(evidenceRelationshipPath, {
    id: existingEvidenceRelationship?.id ?? randomUUID(),
    recordType: "relationship",
    schemaVersion: 1,
    createdAt: existingEvidenceRelationship?.createdAt ?? timestamp,
    updatedAt: existingEvidenceRelationship?.updatedAt ?? timestamp,
    sourceId: workId,
    sourceType: "work",
    relationshipType: "evidenced-by",
    targetId: evidenceId,
    targetType: "evidence",
  });

  for (const hatSlug of item.hats) {
    const hatId = hatMap[hatSlug];
    if (!hatId) throw new Error(`Unknown Hat legacy key: ${hatSlug}`);
    const relationshipPath = join(
      relationshipDirectory,
      `${workSlug}-${hatSlug}.json`,
    );
    const existingRelationship = read(relationshipPath);
    write(relationshipPath, {
      id: existingRelationship?.id ?? randomUUID(),
      recordType: "relationship",
      schemaVersion: 1,
      createdAt: existingRelationship?.createdAt ?? timestamp,
      updatedAt: existingRelationship?.updatedAt ?? timestamp,
      sourceId: hatId,
      sourceType: "hat",
      relationshipType: "applied-in",
      targetId: workId,
      targetType: "work",
      role: item.hats.indexOf(hatSlug) === 0 ? "primary" : "supporting",
    });
  }
}

console.log(
  JSON.stringify(
    {
      projectFamilies: new Set(catalogue.map((item) => item.project)).size,
      workRecords: catalogue.length,
      videoEvidenceRecords: catalogue.length,
      note: "Public metadata establishes project context; contribution wording retains the existing portfolio classifications.",
    },
    null,
    2,
  ),
);
