export const CAPABILITY_GROUPS = [
  {
    id: "physical-systems-engineering",
    code: "01",
    name: "Physical Systems Engineering",
    summary:
      "Hardware, electrical, electronic, embedded and installed signal systems operating in physical environments. Includes equipment, communications, testing, live technical systems and physical signal paths.",
  },
  {
    id: "media-production-distribution",
    code: "02",
    name: "Media Production and Distribution",
    summary:
      "Creating, transforming, managing and delivering media: capture, recording, editing, mixing, broadcast, playout, publishing, archiving and distribution—not physical equipment or signal infrastructure alone.",
  },
  {
    id: "system-product-definition",
    code: "03",
    name: "System and Product Definition",
    summary:
      "Defining what a product, service or system is before and above implementation: requirements, boundaries, architecture, data and content models, workflows and operating principles.",
  },
  {
    id: "brand-experience-systems",
    code: "04",
    name: "Brand and Experience Systems",
    summary:
      "Shaping how a system is recognised, understood and experienced: strategy, language, identity, visual systems, interaction direction and designed experience.",
  },
  {
    id: "software-web-engineering",
    code: "05",
    name: "Software and Web Engineering",
    summary:
      "Building executable digital behaviour: websites, applications, front ends, back ends, APIs, integrations, state systems and interactive interfaces.",
  },
  {
    id: "infrastructure-operations",
    code: "06",
    name: "Infrastructure and Operations",
    summary:
      "Deploying and sustaining live systems: cloud platforms, servers, environments, domains, DNS, CI/CD, automation, monitoring, reliability and operational workflows.",
  },
] as const;

export type CapabilityGroupId = (typeof CAPABILITY_GROUPS)[number]["id"];

export const LEGACY_CAPABILITY_GROUP_ALIASES = {
  "physical-technical-engineering": "physical-systems-engineering",
  "media-asset-systems": "media-production-distribution",
} as const satisfies Record<string, CapabilityGroupId>;

export type LegacyCapabilityGroupId = keyof typeof LEGACY_CAPABILITY_GROUP_ALIASES;

export function resolveCapabilityGroupId(value: string | null | undefined): CapabilityGroupId | undefined {
  if (!value) return undefined;
  const direct = CAPABILITY_GROUPS.find((group) => group.id === value);
  if (direct) return direct.id;
  return LEGACY_CAPABILITY_GROUP_ALIASES[value as LegacyCapabilityGroupId];
}
