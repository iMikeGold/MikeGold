// ==================================================
// iD Gravity CORE v2.1 — Hat Registry (HARDENED CANONICAL)
// SCHEMA: Weighted Semantic Graph | Directed Multigraph
// STANDARD: Machine-Interpretable Ontology + Human Layer
// UPDATED: 2026-06-20
// ==================================================

export const GRAVITY_META = {
  version: "2.1",
  schema: "iD-Gravity-Core",
  scale: "0–1 Normalized",
  weight_model: {
    base: "Inherent importance / core value",
    experience: "Capability depth / mastery potential",
    rarity: "Scarcity / uniqueness factor",
    formula: "finalWeight = (base * 0.5) + (experience * 0.3) + (rarity * 0.2)"
  },
  relationship_rules: {
    dependency: "Directional → Required upstream condition",
    supports: "Directional → Enhances but not required",
    overlap: "Bidirectional → Shared capability space",
    adjacent: "Bidirectional → Conceptual proximity only"
  },
  taxonomy: {
    categories: ["creative", "design", "engineering"],
    types: ["audio", "visual", "interface", "web", "systems", "software"]
  }
};

export type Hat = {
  id: string;
  name: string;
  description?: string;

  category?: "creative" | "design" | "engineering";
  type?: string;

  tags: {
    core: string[];
    adjacent: string[];
    meta?: string[];
  };

  weight?: {
    base?: number;
    experience?: number;
    rarity?: number;
  };
};

export const hats = [

// ==================================================
// CREATIVE CATEGORY
// ==================================================

  // --- Audio Systems ---

  {
    id: "audio-engineer",
    name: "Audio Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.60
    },

    tags: {
      core: ["sound", "audio", "mixing", "signal"],
      adjacent: [],
      meta: ["studio", "precision"]
    },

    relationships: [
      { targetId: "sound-engineer", type: "overlap", strength: 0.80 },
      { targetId: "recording-engineer", type: "supports", strength: 0.75 },
      { targetId: "mix-engineer", type: "supports", strength: 0.75 }
    ],

    description: "Capture, balance and refine audio systems.",

    details: {
      overview: "Specialising in capturing and controlling sound with precision. Focused on clarity, balance, and spatial accuracy in both studio and live environments.",
      capabilities: ["audio capture", "mixing", "signal balancing"],
      usedFor: ["studio production", "live sound environments", "media systems"]
    }
  },

  {
    id: "sound-engineer",
    name: "Sound Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.90,
      experience: 0.90,
      rarity: 0.55
    },

    tags: {
      core: ["studio", "sound", "live", "audio"],
      adjacent: ["branding"],
      meta: ["acoustics", "environments"]
    },

    relationships: [
      { targetId: "audio-engineer", type: "overlap", strength: 0.80 },
      { targetId: "foh-engineer", type: "dependency", strength: 0.85 },
      { targetId: "acoustic-engineer", type: "dependency", strength: 0.70 }
    ],

    description: "Design and manage sound systems in physical environments.",

    details: {
      overview: "Focus on the behaviour of sound in real-world environments. Working with acoustics, system placement, and tuning to achieve consistent output across spaces.",
      capabilities: ["acoustic tuning", "live system setup", "sound distribution"],
      usedFor: ["venues", "events", "installations"]
    }
  },

  {
    id: "recording-engineer",
    name: "Recording Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.65
    },

    tags: {
      core: ["recording", "capture", "quality"],
      adjacent: [],
      meta: ["fidelity", "archiving"]
    },

    relationships: [
      { targetId: "audio-engineer", type: "overlap", strength: 0.75 },
      { targetId: "mix-engineer", type: "dependency", strength: 0.90 }
    ],

    description: "Capturing sound with maximum fidelity and detail.",

    details: {
      overview: "Specialised in the art and science of capturing sound — choosing the right equipment and formats to preserve every nuance. Focused on getting it right at source, because what is lost at capture can never be fully restored. Controlling environments, levels and signal path to ensure the recording is clean, detailed and true.",
      capabilities: ["microphone technique", "signal capture", "quality control"],
      usedFor: ["studio recording", "location capture", "archival recording"]
    }
  },

  {
    id: "mix-engineer",
    name: "Mix Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.60
    },

    tags: {
      core: ["mixing", "balance", "blend"],
      adjacent: [],
      meta: ["spatial", "processing"]
    },

    relationships: [
      { targetId: "recording-engineer", type: "dependency", strength: 0.90 },
      { targetId: "mastering-engineer", type: "dependency", strength: 0.90 },
      { targetId: "foh-engineer", type: "overlap", strength: 0.70 }
    ],

    description: "Blending multiple sources into one cohesive whole.",

    details: {
      overview: "Take individual tracks or signals and balance their levels, frequencies, dynamics and position to create a clear, powerful and enjoyable result. Ensuring every element is heard and nothing is lost or overpowering. Using processing tools, spatial effects and automation to shape the sound. The mix is where the separate elements become one.",
      capabilities: ["level balancing", "frequency management", "spatial mixing"],
      usedFor: ["music production", "post-production", "live mixes"]
    }
  },

  {
    id: "mastering-engineer",
    name: "Mastering Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.85,
      experience: 0.90,
      rarity: 0.70
    },

    tags: {
      core: ["mastering", "finalise", "consistency"],
      adjacent: [],
      meta: ["format", "polish"]
    },

    relationships: [
      { targetId: "mix-engineer", type: "dependency", strength: 0.90 },
      { targetId: "broadcast-audio-engineer", type: "supports", strength: 0.65 }
    ],

    description: "Finalising sound for consistent, high‑quality playback.",

    details: {
      overview: "The last stage in audio production — optimise the whole work for the intended format and listening environment. Ensuring balance, tone, volume and dynamics are perfect and consistent across all playback systems. Adding the final polish and ensuring the work translates well everywhere. Mastering gives the work its professional, finished touch.",
      capabilities: ["tonal optimisation", "dynamic control", "format adaptation"],
      usedFor: ["albums", "singles", "broadcast material"]
    }
  },

  {
    id: "acoustic-engineer",
    name: "Acoustic Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.80,
      experience: 0.85,
      rarity: 0.75
    },

    tags: {
      core: ["acoustics", "room", "behaviour"],
      adjacent: [],
      meta: ["physics", "environment"]
    },

    relationships: [
      { targetId: "sound-engineer", type: "dependency", strength: 0.70 },
      { targetId: "environment-architect", type: "overlap", strength: 0.60 }
    ],

    description: "Designing spaces to control how sound behaves.",

    details: {
      overview: "Analyse and shape the physical environment — walls, floors, ceilings, materials — to control reflection, absorption, diffusion and resonance. Ensuring sound is clear, balanced and natural within the space. Working with existing rooms or designing new ones, good acoustics are the foundation of good sound, no matter how good the equipment is.",
      capabilities: ["acoustic analysis", "treatment design", "room optimisation"],
      usedFor: ["studios", "concert halls", "lecture rooms"]
    }
  },

  {
    id: "sound-designer",
    name: "Sound Designer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.70
    },

    tags: {
      core: ["creation", "design", "soundscape"],
      adjacent: [],
      meta: ["synthesis", "texture"]
    },

    relationships: [
      { targetId: "post-production-audio-engineer", type: "overlap", strength: 0.65 }
    ],

    description: "Creating original sounds and soundscapes.",

    details: {
      overview: "Design new sounds — from subtle textures to distinct effects — that do not exist naturally. Using synthesis, processing, recording and manipulation to create exactly what is needed for the brief. Build soundscapes that set mood, location or time. Every sound is chosen or created to carry meaning or feeling.",
      capabilities: ["sound creation", "texture design", "effect development"],
      usedFor: ["film", "games", "installations"]
    }
  },

  {
    id: "foh-engineer",
    name: "FOH Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.55
    },

    tags: {
      core: ["live", "front-of-house", "audience"],
      adjacent: [],
      meta: ["real-time", "performance"]
    },

    relationships: [
      { targetId: "sound-engineer", type: "dependency", strength: 0.85 },
      { targetId: "monitor-engineer", type: "overlap", strength: 0.90 }
    ],

    description: "Mixing sound for the audience in live environments.",

    details: {
      overview: "Responsible for what the audience hears. Balancing every instrument, voice and effect in real time, adapting to the room, the performance and the moment. The goal is to make the live experience feel perfect. Working closely with the system design and monitor engineer; needs excellent ears, fast reaction and deep knowledge of the equipment and the music.",
      capabilities: ["live mixing", "real-time adjustment", "audience focus"],
      usedFor: ["concerts", "festivals", "live events"]
    }
  },

  {
    id: "monitor-engineer",
    name: "Monitor Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.60
    },

    tags: {
      core: ["live", "monitor", "performer"],
      adjacent: [],
      meta: ["stage", "feedback"]
    },

    relationships: [
      { targetId: "foh-engineer", type: "overlap", strength: 0.90 }
    ],

    description: "Mixing sound for performers on stage.",

    details: {
      overview: "Ensure every musician or singer hears exactly what they need to play well. Creating individual mixes for each performer, balancing instruments, vocals and click tracks, adjusting constantly during the show. Working with wedges, in‑ears or side fills. A good monitor mix gives performers confidence and freedom to perform at their best.",
      capabilities: ["personal mixing", "stage audio management", "performer support"],
      usedFor: ["live performances", "rehearsals", "broadcast shows"]
    }
  },

  {
    id: "broadcast-audio-engineer",
    name: "Broadcast Audio Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.65
    },

    tags: {
      core: ["broadcast", "transmission", "standards"],
      adjacent: [],
      meta: ["compliance", "distribution"]
    },

    relationships: [
      { targetId: "mastering-engineer", type: "supports", strength: 0.65 },
      { targetId: "post-production-audio-engineer", type: "overlap", strength: 0.70 }
    ],

    description: "Managing audio for transmission and distribution.",

    details: {
      overview: "Ensure audio meets strict technical standards for broadcast — levels, loudness, format and timing. Handling live or recorded material, switching sources, mixing and monitoring quality continuously. Working with transmission chains, codecs and compliance meters; reliability and adherence to standards are critical here.",
      capabilities: ["broadcast compliance", "transmission management", "quality control"],
      usedFor: ["radio", "television", "streaming services"]
    }
  },

  {
    id: "post-production-audio-engineer",
    name: "Post‑Production Audio Engineer",
    category: "creative",
    type: "audio",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.65
    },

    tags: {
      core: ["post-production", "editing", "polish"],
      adjacent: [],
      meta: ["restoration", "storytelling"]
    },

    relationships: [
      { targetId: "sound-designer", type: "overlap", strength: 0.65 },
      { targetId: "broadcast-audio-engineer", type: "overlap", strength: 0.70 }
    ],

    description: "Editing, repairing and enhancing audio after recording.",

    details: {
      overview: "Working on recorded material to remove noise, fix errors, edit timing, add effects and polish the result. Take what was captured and turn it into a finished, professional product. Work with dialogue, music and effects. Ensure everything lines up, sounds natural and serves the story.",
      capabilities: ["audio editing", "restoration", "enhancement"],
      usedFor: ["film", "video", "podcasts"]
    }
  },

// ==================================================
// DESIGN CATEGORY
// ==================================================

  // --- Visual & Brand Systems ---

  {
    id: "graphic-design-engineer",
    name: "Graphic Design Engineer",
    category: "design",
    type: "visual",

    weight: {
      base: 0.75,
      experience: 0.80,
      rarity: 0.50
    },

    tags: {
      core: ["layout", "visual", "systems"],
      adjacent: ["branding"],
      meta: ["structure", "communication"]
    },

    relationships: [
      { targetId: "brand-systems-engineer", type: "overlap", strength: 0.85 },
      { targetId: "web-design-engineer", type: "supports", strength: 0.75 }
    ],

    description: "Building structured visual systems for communication.",

    details: {
      overview: "Create structured visual systems that communicate ideas clearly and consistently across platforms. Focusing on scalable design logic rather than one-off visuals.",
      capabilities: ["layout systems", "visual hierarchy", "branding structure"],
      usedFor: ["web interfaces", "branding systems", "content presentation"]
    }
  },

  {
    id: "brand-systems-engineer",
    name: "Brand Systems Engineer",
    category: "design",
    type: "visual",

    weight: {
      base: 0.85,
      experience: 0.85,
      rarity: 0.70
    },

    tags: {
      core: ["brand", "scalability", "logic"],
      adjacent: [],
      meta: ["guidelines", "identity"]
    },

    relationships: [
      { targetId: "graphic-design-engineer", type: "overlap", strength: 0.85 },
      { targetId: "identity-architect", type: "dependency", strength: 0.90 }
    ],

    description: "Building reusable, scalable visual logic for brands.",

    details: {
      overview: "Translate brand identity into a complete system of rules — colours, typography, spacing, imagery, usage — that anyone can follow. Ensuring the brand looks and feels the same whether on a business card, a website or a large installation. Design flexibility into the system so it can adapt to new uses without losing identity. Turning style into a structured, manageable asset.",
      capabilities: ["brand logic design", "style system engineering", "consistency framework"],
      usedFor: ["brand guidelines", "multi-channel identity", "enterprise branding"]
    }
  },

  {
    id: "identity-architect",
    name: "Identity Architect",
    category: "design",
    type: "visual",

    weight: {
      base: 0.90,
      experience: 0.90,
      rarity: 0.80
    },

    tags: {
      core: ["identity", "language", "foundation"],
      adjacent: [],
      meta: ["strategy", "meaning"]
    },

    relationships: [
      { targetId: "brand-systems-engineer", type: "dependency", strength: 0.90 },
      { targetId: "logo-systems-designer", type: "dependency", strength: 0.90 }
    ],

    description: "Defining the base language of visual identity.",

    details: {
      overview: "Create the core building blocks — logo, colour palette, typefaces, shapes — and decide exactly how they relate to each other. Establish the character and tone that everything else must follow. Work from the core purpose or message outward. Every choice is intentional and carries meaning, so the identity becomes a clear communication tool.",
      capabilities: ["core identity design", "visual language definition", "character alignment"],
      usedFor: ["new brand creation", "identity refresh", "organisation identity"]
    }
  },

  {
    id: "logo-systems-designer",
    name: "Logo Systems Designer",
    category: "design",
    type: "visual",

    weight: {
      base: 0.80,
      experience: 0.80,
      rarity: 0.70
    },

    tags: {
      core: ["logo", "adaptation", "marks"],
      adjacent: [],
      meta: ["scalability", "application"]
    },

    relationships: [
      { targetId: "identity-architect", type: "dependency", strength: 0.90 }
    ],

    description: "Adapting marks for every size and background.",

    details: {
      overview: "Design not just one logo, but a complete family of marks — full version, simplified icon, monogram, symbol — that work perfectly at every size, from tiny icon to huge signage. Define clear rules for spacing, minimum size and correct use. Ensure recognition remains strong no matter where or how it appears. A good system protects and strengthens the mark.",
      capabilities: ["logo adaptation", "usage rule design", "scalability engineering"],
      usedFor: ["brand assets", "signage systems", "digital platforms"]
    }
  },

  {
    id: "visual-language-engineer",
    name: "Visual Language Engineer",
    category: "design",
    type: "visual",

    weight: {
      base: 0.85,
      experience: 0.85,
      rarity: 0.75
    },

    tags: {
      core: ["colour", "typography", "rules"],
      adjacent: [],
      meta: ["tokens", "standardisation"]
    },

    relationships: [
      { targetId: "brand-systems-engineer", type: "overlap", strength: 0.80 },
      { targetId: "graphic-systems-designer", type: "dependency", strength: 0.85 }
    ],

    description: "Coding colour, weight and spacing as strict rules.",

    details: {
      overview: "Define exactly how colour, typography, line weight, corner radius and spacing are used — no exceptions. Turning subjective style into objective, code‑ready values that can be applied in design tools or software. Create a shared vocabulary so designers, developers and producers all speak the same visual language. Removing ambiguity and drift.",
      capabilities: ["visual rule definition", "token system design", "standardisation"],
      usedFor: ["design systems", "digital products", "publication suites"]
    }
  },

  {
    id: "graphic-systems-designer",
    name: "Graphic Systems Designer",
    category: "design",
    type: "visual",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.60
    },

    tags: {
      core: ["graphics", "templates", "structure"],
      adjacent: [],
      meta: ["grids", "production"]
    },

    relationships: [
      { targetId: "visual-language-engineer", type: "dependency", strength: 0.85 }
    ],

    description: "Creating templates and structures for consistent output.",

    details: {
      overview: "Build frameworks, grids and templates that let anyone create new materials that fit perfectly. Define where text goes, how images sit, how headings behave — so every piece looks like part of the same set. Balance freedom and control: enough structure to guarantee consistency, enough flexibility to allow new content to work naturally.",
      capabilities: ["template engineering", "grid system design", "layout frameworks"],
      usedFor: ["marketing materials", "document suites", "content platforms"]
    }
  },

  {
    id: "cognitive-load-designer",
    name: "Cognitive Load Designer",
    category: "design",
    type: "interface",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.80
    },

    tags: {
      core: ["complexity", "simplicity", "focus"],
      adjacent: [],
      meta: ["ux", "information"]
    },

    relationships: [
      { targetId: "human-system-translator", type: "overlap", strength: 0.90 }
    ],

    description: "Revealing complexity only when needed.",

    details: {
      overview: "Control how much information or choice is shown at once. Start simple, show only what is needed now, and bring forward detail or advanced options only when the user is ready or asks for them. Prevent overwhelm and retain focus on the task. Simplicity is not about removing features — it is about revealing them at the right time.",
      capabilities: ["progressive disclosure", "complexity management", "focus engineering"],
      usedFor: ["professional tools", "control interfaces", "information systems"]
    }
  },

  {
    id: "human-system-translator",
    name: "Human–System Translator",
    category: "design",
    type: "interface",

    weight: {
      base: 0.85,
      experience: 0.85,
      rarity: 0.85
    },

    tags: {
      core: ["translation", "clarity", "communication"],
      adjacent: [],
      meta: ["language", "accessibility"]
    },

    relationships: [
      { targetId: "cognitive-load-designer", type: "overlap", strength: 0.90 },
      { targetId: "application-engineer", type: "supports", strength: 0.75 }
    ],

    description: "Turning raw capability into understandable controls.",

    details: {
      overview: "Take powerful but complex technical functions and present them in language and form people understand. Remove jargon, simplify choices and explain what things do in plain words. Ensure the system speaks the user’s language, not the engineer’s. Power is kept, but confusion is removed.",
      capabilities: ["language simplification", "function presentation", "clarity engineering"],
      usedFor: ["professional tools", "technical systems", "control interfaces"]
    }
  },

  // --- Web & Digital Product ---

  {
    id: "web-design-engineer",
    name: "Web Design Engineer",
    category: "design",
    type: "web",

    weight: {
      base: 0.75,
      experience: 0.80,
      rarity: 0.50
    },

    tags: {
      core: ["web", "implementation", "code"],
      adjacent: [],
      meta: ["frontend", "responsive"]
    },

    relationships: [
      { targetId: "graphic-design-engineer", type: "supports", strength: 0.75 },
      { targetId: "software-engineer", type: "overlap", strength: 0.70 }
    ],

    description: "Code presentations that work everywhere.",

    details: {
      overview: "Translate visual design into clean, efficient, reliable code — HTML, CSS, JavaScript — that looks and behaves exactly as intended on every device and browser. Ensuring layout, type and colour are perfect across screens. Optimise for speed, accessibility and future change. Build the technical foundation that makes design real online.",
      capabilities: ["web implementation", "cross-platform alignment", "responsive engineering"],
      usedFor: ["websites", "web applications", "digital platforms"]
    }
  },

// ==================================================
// ENGINEERING CATEGORY
// ==================================================

  // --- Systems & Infrastructure ---

  {
    id: "systems-engineer",
    name: "Systems Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.95,
      experience: 0.90,
      rarity: 0.55
    },

    tags: {
      core: ["infrastructure", "logic", "reliability", "systems"],
      adjacent: [],
      meta: ["architecture", "integration"]
    },

    relationships: [
      { targetId: "infrastructure-engineer", type: "dependency", strength: 0.90 },
      { targetId: "platform-engineer", type: "overlap", strength: 0.85 },
      { targetId: "environment-architect", type: "overlap", strength: 0.80 }
    ],

    description: "Design and balance complete system environments.",

    details: {
      overview: "Responsible for the design and coordination of full system environments. Focused on ensuring all components interact reliably under load, without breaking flow between subsystems.",
      capabilities: ["system design", "infrastructure planning", "reliability engineering"],
      usedFor: ["platform architecture", "service stability", "large-scale system coordination"]
    }
  },

  {
    id: "infrastructure-engineer",
    name: "Infrastructure Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.60
    },

    tags: {
      core: ["foundation", "compute", "network"],
      adjacent: [],
      meta: ["hardware", "cloud"]
    },

    relationships: [
      { targetId: "systems-engineer", type: "dependency", strength: 0.90 },
      { targetId: "server-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Build and maintain the core physical and virtual foundation.",

    details: {
      overview: "Construct the base layer upon which everything else runs — servers, storage, networking, power and connectivity. Ensuring the foundation is robust, correctly sized and ready to support the intended workload without bottlenecks or single points of failure. Handle provisioning, layout and ongoing health monitoring, applying standards that keep the environment consistent across development, testing and live states. This layer is invisible but defines every performance limit above it.",
      capabilities: ["hardware layout", "network design", "resource provisioning"],
      usedFor: ["data centre builds", "cloud environments", "core service hosting"]
    }
  },

  {
    id: "platform-engineer",
    name: "Platform Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.70
    },

    tags: {
      core: ["shared", "consistency", "environment"],
      adjacent: [],
      meta: ["devops", "automation"]
    },

    relationships: [
      { targetId: "systems-engineer", type: "overlap", strength: 0.85 },
      { targetId: "deployment-engineer", type: "dependency", strength: 0.80 }
    ],

    description: "Create shared environments that behave identically everywhere.",

    details: {
      overview: "Design and maintain standardised platforms used across projects or teams. Ensuring every instance runs the same configuration, dependencies and rules so behaviour is predictable and integration is simple. Removing custom work by building reusable frameworks. Focus on developer and operator experience, making it fast and safe to deploy or update. The platform becomes a controlled toolset rather than a custom build every time, reducing risk and repetition.",
      capabilities: ["environment standardisation", "shared service design", "platform automation"],
      usedFor: ["development stacks", "multi-tenant systems", "consistent deployment"]
    }
  },

  {
    id: "environment-architect",
    name: "Environment Architect",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.85,
      experience: 0.85,
      rarity: 0.75
    },

    tags: {
      core: ["separation", "boundaries", "rules"],
      adjacent: [],
      meta: ["security", "isolation"]
    },

    relationships: [
      { targetId: "systems-engineer", type: "overlap", strength: 0.80 },
      { targetId: "isolation-engineer", type: "dependency", strength: 0.85 }
    ],

    description: "Defining boundaries, separation and behaviour rules for spaces.",

    details: {
      overview: "Map out exactly how different environments relate — production, staging, development, secure zones. Create rules for data flow, access, and isolation so no state can leak or interfere with another. Ensuring safety and integrity are inherent to the layout. Decide what can move between zones, how promotion works, and where hard limits apply. The architecture ensures that testing does not impact live operation and that sensitive data never crosses unauthorised lines.",
      capabilities: ["zone definition", "isolation strategy", "access mapping"],
      usedFor: ["secure system design", "compliance environments", "multi-stage workflows"]
    }
  },

  {
    id: "linux-systems-administrator",
    name: "Linux Systems Administrator",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.75,
      experience: 0.80,
      rarity: 0.50
    },

    tags: {
      core: ["os", "configuration", "maintenance"],
      adjacent: [],
      meta: ["unix", "shell"]
    },

    relationships: [
      { targetId: "infrastructure-engineer", type: "supports", strength: 0.75 },
      { targetId: "operations-engineer", type: "overlap", strength: 0.80 }
    ],

    description: "Configure, secure and maintain Linux-based operating platforms.",

    details: {
      overview: "Manage the core operating system layer — installation, tuning, security hardening, updates and user management. Ensuring the OS itself is optimised for the specific workload it carries, whether compute-heavy, storage-heavy or real-time processing. Monitor health, logs and performance at kernel and service level. Troubleshoot from command line up, keeping systems running smoothly and securely without unnecessary overhead or risk.",
      capabilities: ["system hardening", "service management", "performance tuning"],
      usedFor: ["server maintenance", "secure hosting", "low-level optimisation"]
    }
  },

  {
    id: "server-engineer",
    name: "Server Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.55
    },

    tags: {
      core: ["hardware", "allocation", "tuning"],
      adjacent: [],
      meta: ["compute", "resource"]
    },

    relationships: [
      { targetId: "infrastructure-engineer", type: "overlap", strength: 0.85 },
      { targetId: "runtime-engineer", type: "overlap", strength: 0.75 }
    ],

    description: "Tune hardware-to-software performance and resource allocation.",

    details: {
      overview: "Match physical or virtual server resources — CPU, memory, storage, I/O — to the exact demands of the software running on it. Optimise BIOS, firmware, OS and service settings to extract maximum stability and throughput without over provisioning. Work with rack layout, cooling and power alongside logical partitioning. Ensuring each workload has exactly what it needs and no resource is wasted or contested unnecessarily.",
      capabilities: ["resource optimisation", "hardware configuration", "workload alignment"],
      usedFor: ["high-performance builds", "media processing servers", "low-latency environments"]
    }
  },

  {
    id: "network-engineer",
    name: "Network-Aware Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.65
    },

    tags: {
      core: ["routing", "latency", "signal"],
      adjacent: [],
      meta: ["transport", "qos"]
    },

    relationships: [
      { targetId: "infrastructure-engineer", type: "supports", strength: 0.80 },
      { targetId: "firewall-engineer", type: "overlap", strength: 0.75 }
    ],

    description: "Designing paths where data and signal travel without loss or delay.",

    details: {
      overview: "Understand how network behaviour affects the application or signal above it. Plan routing, switching, bandwidth allocation and redundancy specifically to preserve timing and integrity — critical for audio, media or real-time control. Work with physical cabling, addressing schemes, QoS and failover logic. Ensuring that even under load or partial failure, delivery remains consistent and errors are contained.",
      capabilities: ["signal path design", "latency management", "resilience planning"],
      usedFor: ["media transport", "live systems", "distributed processing"]
    }
  },

  {
    id: "deployment-engineer",
    name: "Deployment Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.60
    },

    tags: {
      core: ["release", "rollout", "safety"],
      adjacent: [],
      meta: ["ci/cd", "change"]
    },

    relationships: [
      { targetId: "platform-engineer", type: "dependency", strength: 0.80 },
      { targetId: "operations-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Plan safe, repeatable roll-out without disruption.",

    details: {
      overview: "Design exactly how new code, configuration or hardware is introduced into live environments. Build steps that are tested, reversible and observable, so updates happen without downtime or unexpected behaviour. Define staging, canary, phased or full rollout strategies depending on risk. Ensuring every change leaves a clear audit trail and a quick path back if issues appear.",
      capabilities: ["release strategy", "rollback planning", "change management"],
      usedFor: ["software updates", "system upgrades", "infrastructure changes"]
    }
  },

  {
    id: "runtime-engineer",
    name: "Runtime Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.80,
      rarity: 0.70
    },

    tags: {
      core: ["execution", "performance", "lifecycle"],
      adjacent: [],
      meta: ["process", "optimisation"]
    },

    relationships: [
      { targetId: "server-engineer", type: "overlap", strength: 0.75 },
      { targetId: "software-engineer", type: "supports", strength: 0.80 }
    ],

    description: "Optimising exactly how processes behave while active.",

    details: {
      overview: "Focus on what happens while systems are running — process scheduling, memory use, thread management, garbage collection and resource limits. Tune specifically for the workload: real-time, high-throughput, or long-running stability. Observe behaviour under stress, identifying bottlenecks or leaks, and adjust configuration or code to keep operation smooth. Ensuring that over time, performance does not degrade.",
      capabilities: ["execution tuning", "resource limiting", "behaviour analysis"],
      usedFor: ["real-time processing", "long-running services", "high-load applications"]
    }
  },

  {
    id: "operations-engineer",
    name: "Operations Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.55
    },

    tags: {
      core: ["monitoring", "visibility", "maintenance"],
      adjacent: [],
      meta: ["uptime", "alerting"]
    },

    relationships: [
      { targetId: "deployment-engineer", type: "overlap", strength: 0.85 },
      { targetId: "reliability-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Keep running systems visible, monitored and responding.",

    details: {
      overview: "Maintain day-to-day health, monitoring every component for availability, performance and errors. Build dashboards, alerts and log aggregation so status is always clear. Respond to incidents quickly and methodically. Standardise routine tasks, backups and checks so nothing is missed. Work closely with design and build teams to ensure systems are easy to operate and troubleshoot.",
      capabilities: ["monitoring setup", "incident response", "routine maintenance"],
      usedFor: ["24/7 service environments", "critical infrastructure", "long-term system health"]
    }
  },

  {
    id: "reliability-engineer",
    name: "Reliability Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.70
    },

    tags: {
      core: ["resilience", "uptime", "failure"],
      adjacent: [],
      meta: ["fault-tolerance", "recovery"]
    },

    relationships: [
      { targetId: "operations-engineer", type: "overlap", strength: 0.85 },
      { targetId: "fail-safe-systems-designer", type: "overlap", strength: 0.80 }
    ],

    description: "Build resilience so failure becomes rare and contained.",

    details: {
      overview: "Design systems that tolerate faults without total outage. Using redundancy, failover, graceful degradation and error containment to ensure that if one part fails, the rest continues or switches over automatically. Define acceptable risk and build to match. Test failure modes intentionally to prove recovery works. Focus on mean time between failures and mean time to repair, turning reliability into a measurable design target.",
      capabilities: ["fault tolerance", "redundancy design", "recovery testing"],
      usedFor: ["mission-critical systems", "broadcast infrastructure", "high-availability services"]
    }
  },

  {
    id: "permissions-identity-engineer",
    name: "Permissions & Identity Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.75
    },

    tags: {
      core: ["access", "security", "identity"],
      adjacent: [],
      meta: ["authentication", "policy"]
    },

    relationships: [
      { targetId: "access-control-engineer", type: "overlap", strength: 0.90 }
    ],

    description: "Control exactly who and what is allowed access.",

    details: {
      overview: "Design how users, services and devices prove who they are and what they are allowed to do. Create roles, groups and policies that follow least-privilege principles — only enough access to work, nothing more. Integrate authentication, single sign-on, multi-factor checks and audit logs. Ensure access is easy to manage but impossible to abuse or leak.",
      capabilities: ["identity management", "access policy", "security auditing"],
      usedFor: ["secure environments", "multi-user systems", "compliance requirements"]
    }
  },

  {
    id: "access-control-engineer",
    name: "Access-Control Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.75,
      rarity: 0.75
    },

    tags: {
      core: ["boundaries", "security", "zones"],
      adjacent: [],
      meta: ["perimeter", "enforcement"]
    },

    relationships: [
      { targetId: "permissions-identity-engineer", type: "overlap", strength: 0.90 },
      { targetId: "firewall-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Enforcing boundaries between secure and public zones.",

    details: {
      overview: "Build the technical barriers that separate trusted from untrusted areas. Define exactly what can cross, in which direction, and under what rules. Apply restrictions at network, system, data and application levels. Ensure that even if one area is compromised, others remain protected. Work with encryption, filtering and permission checks to enforce policy everywhere.",
      capabilities: ["security boundary design", "traffic filtering", "permission enforcement"],
      usedFor: ["data protection", "public-facing services", "regulated data handling"]
    }
  },

  {
    id: "firewall-engineer",
    name: "Firewall / Exposure-Aware Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.75,
      experience: 0.75,
      rarity: 0.70
    },

    tags: {
      core: ["exposure", "filtering", "security"],
      adjacent: [],
      meta: ["perimeter", "visibility"]
    },

    relationships: [
      { targetId: "network-engineer", type: "overlap", strength: 0.75 },
      { targetId: "access-control-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Defining visible vs protected surfaces precisely.",

    details: {
      overview: "Decide exactly which services, ports and addresses are visible to the outside world and which are hidden. Build filtering rules that allow only intended traffic and blocks everything else — reducing attack surface to the absolute minimum. Monitor exposure continuously, adjusting rules as services change. Ensuring that what should be private stays private, while necessary access remains available securely.",
      capabilities: ["exposure mapping", "rule design", "threat reduction"],
      usedFor: ["internet-facing systems", "secure gateways", "perimeter defence"]
    }
  },

  {
    id: "isolation-engineer",
    name: "Isolation Engineer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.80,
      experience: 0.80,
      rarity: 0.80
    },

    tags: {
      core: ["separation", "containment", "safety"],
      adjacent: [],
      meta: ["partitioning", "multi-tenant"]
    },

    relationships: [
      { targetId: "environment-architect", type: "dependency", strength: 0.85 }
    ],

    description: "Separation of workloads so issues never cascade sideways.",

    details: {
      overview: "Ensure that processes, data or tenants cannot interfere with each other. Using containers, virtualisation, dedicated hardware or network segmentation to keep them strictly apart. A fault or overload in one never affects another. Design isolation appropriate to risk — from soft separation for internal tools to complete physical separation for sensitive or high-value work. Safety is built into the layout.",
      capabilities: ["workload separation", "containment design", "risk partitioning"],
      usedFor: ["multi-tenant platforms", "shared infrastructure", "high-security processing"]
    }
  },

  {
    id: "fail-safe-systems-designer",
    name: "Fail-Safe Systems Designer",
    category: "engineering",
    type: "systems",

    weight: {
      base: 0.85,
      experience: 0.85,
      rarity: 0.85
    },

    tags: {
      core: ["safety", "default", "behaviour"],
      adjacent: [],
      meta: ["reliability", "faults"]
    },

    relationships: [
      { targetId: "reliability-engineer", type: "overlap", strength: 0.80 }
    ],

    description: "Arranging behaviour so if anything shifts, it defaults safely.",

    details: {
      overview: "Ensure that when power is lost, signals drop, or controls fail, the system moves automatically to a safe state — not a dangerous or unpredictable one. Every possible failure mode is analysed and designed for. Use hardware interlocks, fallback logic and passive safety where possible. Safety is not an add-on feature but the fundamental way the system behaves when not actively controlled.",
      capabilities: ["safety logic design", "failure mode analysis", "default-state engineering"],
      usedFor: ["live environments", "audio systems", "physical control systems"]
    }
  },

  // --- Software & Runtime ---

  {
    id: "software-engineer",
    name: "Software Engineer",
    category: "engineering",
    type: "software",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.55
    },

    tags: {
      core: ["code", "logic", "function"],
      adjacent: [],
      meta: ["development", "algorithms"]
    },

    relationships: [
      { targetId: "backend-engineer", type: "overlap", strength: 0.85 },
      { targetId: "application-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Structuring logic and function into usable code form.",

    details: {
      overview: "Translate requirements into working software. Design clear, maintainable structures that do exactly what is intended, no more, no less. Focus on correctness, readability and efficiency. Work across languages and paradigms, always choosing the right tool for the job. Build components that are reusable, testable and integrate cleanly with other parts.",
      capabilities: ["software design", "coding", "component building"],
      usedFor: ["custom tools", "control systems", "processing logic"]
    }
  },

  {
    id: "backend-engineer",
    name: "Backend Engineer",
    category: "engineering",
    type: "software",

    weight: {
      base: 0.90,
      experience: 0.85,
      rarity: 0.60
    },

    tags: {
      core: ["core", "logic", "services"],
      adjacent: [],
      meta: ["api", "data"]
    },

    relationships: [
      { targetId: "software-engineer", type: "overlap", strength: 0.85 },
      { targetId: "service-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Building the working logic that never appears on the front panel.",

    details: {
      overview: "Construct the invisible engine — data processing, business rules, calculations, storage and communication between systems. Ensure that every action taken at the interface is handled reliably, securely and fast below. Design APIs, data flows and service interactions so the front end remains simple while the back handles complexity, scale and change. Everything is built to be monitored, updated and scaled independently.",
      capabilities: ["service logic", "api design", "data processing"],
      usedFor: ["application backends", "media processing cores", "control systems"]
    }
  },

  {
    id: "application-engineer",
    name: "Application Engineer",
    category: "engineering",
    type: "software",

    weight: {
      base: 0.85,
      experience: 0.80,
      rarity: 0.65
    },

    tags: {
      core: ["purpose", "workflow", "function"],
      adjacent: [],
      meta: ["usability", "integration"]
    },

    relationships: [
      { targetId: "software-engineer", type: "overlap", strength: 0.85 }
    ],

    description: "Bridges software capabilities into usable applications.",

    details: {
      overview: "Turns raw software capability into structured application-level functionality.",
      capabilities: ["application design", "integration", "workflow structuring"],
      usedFor: ["end-user applications", "system interfaces", "tooling layers"]
    }
  }
];