"use client";

import { useState } from "react";
import Footer from "@/components/sections/Footer";

type Project = {
  title: string;
  category: string;
  description: string;
  content: string;
  accent?: string;
};

const SYSTEM_PROJECTS: Project[] = [
  {
    title: "PCB R&D Pipeline",
    category: "Engineering Systems",
    description: "How circuit ideas move from concept to board.",
    content:
      "This system maps ideation → schematic → prototyping → validation. It connects electrical design thinking with iterative testing loops, reducing cognitive overhead during hardware development.",
    accent: "#ff4d6d",
  },
  {
    title: "Cognitive Mapping",
    category: "Systems Architecture",
    description: "How ideas are structured across domains.",
    content:
      "Explore how design, engineering, and strategy interact as weighted systems. Each decision becomes a node in a relational graph, similar to the logic engine behind the Hat Registry System.",
    accent: "#4dd4ff",
  },
];



const VIDEO_PROJECTS = [
  {
    title: "Field Comms & Telecom Redundacny Systems",
    url: "https://www.youtube.com/embed/H0jTge4APYs?si",
  },


  {
    title: "Sound System Design & Installation Engineer",
    url: "https://www.youtube.com/embed/3GlBmy-Vxak?si",
  },

  {
    title: "Sound Design & Audio Systems",
    url: "https://www.youtube.com/embed/n2usGeet2Gk?si",
  },
   
  {
    title: "Camera Systems & Setup",
    url: "https://www.youtube.com/embed/yivx4Q2bVBU?si",
  },

   {
    title: "Management Systems Overview",
    url: "https://www.youtube.com/embed/4-WMTSVORa0?si",
  },

   {
    title: "Camera Operation & Workflow",
    url: "https://www.youtube.com/embed/ydEox4TatF8?si",
  },

   {
    title: "Media Management Systems",
    url: "https://www.youtube.com/embed/0WSuxDHcnf4?si",
  },

   {
    title: "Playout Systems Setup",
    url: "https://www.youtube.com/embed/JC-sHp5Xakk?si"
   },

      {
    title: "Mulicamera Setup & Operation",
    url: "https://www.youtube.com/embed/w9eP13qq_zA?si",
   },

  {
    title: "Sensor Test & Manufacturing Engineer",
    url: "https://www.youtube.com/embed/0Ckjmo1ayb0?si",
  },

   {
    title: "Electronics Systems Engineer",
    url: "https://www.youtube.com/embed/OanbAm_4KvM?si",
   },

   {
    title: "Distribution Systems",
    url: "https://www.youtube.com/embed/36WtEUKCctU?si",
   },
    {
    title: "Distribution Systems & Signal Flow",
    url: "https://www.youtube.com/embed/I61Y9Pb3XFY?si",
   },
 

    {
    title: "Scientific Equipment & Test Systems Engineer",
    url: "https://www.youtube.com/embed/DE_s7ocmI9E?si"
   },

   {
    title: "Modem Firmware Build and Installation Engineer",
    url: "https://www.youtube.com/embed/Vhir8baUfkA?si"
   },

   {
    title: "Embedded Firmware & Deployment Engineer",
    url: "https://www.youtube.com/embed/vfgFpD2qS4g?si"
   },

   {
    title: "R&D and Systems Thinking",
    url: "https://www.youtube.com/embed/eJsG3XKKhhkU?si"
   },
   {
    title: "Server Systems & Configuration",
    url: "https://www.youtube.com/embed/eJsG3XKKhhkU?si"
   },
     {
    title: "PCB Prototyping & Design",
    url: "https://www.youtube.com/embed//joaYOliIrG0?si",
   },
   {
    title: "Mulimedia Distribution",
    url: "https://www.youtube.com/embed/e_YYiedWe8s?si",
   }
];

const LINKS = [
  {
    title: "GitHub Repository",
    url: "https://www.linkedin.com/in/imikegold/",
  },
  {
    title: "Research Notes",
    url: "https://library.protosynthesis.co.uk/",
  },
];


export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <main>
      <div className="page">

        {/* ================= TOP SYSTEM LAYER ================= */}
        <header className="page-header">
          <h1>PROJECTS</h1>
          <p>Outputs generated from system configurations.</p>
          <p>These projects represent applied combinations of engineering, design, and systems thinking.</p>
        </header>

        <section className="system-projects">
          <h2>System Work (R&D / Engineering / Thinking Models)</h2>

          <div className="system-grid">
            {SYSTEM_PROJECTS.map((p, i) => (
              <div
                key={i}
                className="system-card"
                style={{ borderColor: p.accent }}
                onClick={() => setActiveProject(p)}
              >
                <h3>{p.title}</h3>
                <p className="meta">{p.category}</p>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= MODAL POPUP ================= */}
        {activeProject && (
          <div className="modal-overlay" onClick={() => setActiveProject(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{activeProject.title}</h2>
              <p className="meta">{activeProject.category}</p>
              <p>{activeProject.content}</p>

              <button onClick={() => setActiveProject(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ================= VIDEO GRID ================= */}
        <section className="video-section">
          <h2>Media Outputs</h2>

          <div className="video-grid">
            {VIDEO_PROJECTS.map((v, i) => (
              <div key={i} className="video-tile">
                <iframe
                  src={v.url}
                  title={v.title}
                  allowFullScreen
                />
                <p>{v.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= LINKS ================= */}
        <section className="links-section">
          <h2>Reference Work</h2>

          <ul>
            {LINKS.map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank">
                  {l.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

      </div>

      <Footer />
    </main>
  );
}