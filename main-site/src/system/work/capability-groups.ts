export const CAPABILITY_GROUPS = [
  {
    id: "physical-technical-engineering",
    code: "01",
    name: "Physical and Technical Engineering",
    summary:
      "Audio, electrical, electronics, embedded, communications, test and signal-distribution systems.",
  },
  {
    id: "system-product-definition",
    code: "02",
    name: "System and Product Definition",
    summary:
      "Architecture, discovery, data and content models, product boundaries and service definition.",
  },
  {
    id: "software-web-engineering",
    code: "03",
    name: "Software and Web Engineering",
    summary:
      "Front-end, back-end and application engineering, integrations and data-driven digital experiences.",
  },
  {
    id: "infrastructure-operations",
    code: "04",
    name: "Infrastructure and Operations",
    summary:
      "Cloud delivery, DevOps, release workflows, servers, environments, domains, DNS and automation.",
  },
  {
    id: "brand-experience-systems",
    code: "05",
    name: "Brand and Experience Systems",
    summary:
      "Strategy, language, identity, interface direction, design systems and web experience design.",
  },
  {
    id: "media-asset-systems",
    code: "06",
    name: "Media and Asset Systems",
    summary:
      "Media engineering, digital assets, product visualisation, processing, production and distribution.",
  },
] as const;

export type CapabilityGroupId = (typeof CAPABILITY_GROUPS)[number]["id"];
