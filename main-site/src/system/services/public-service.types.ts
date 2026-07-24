export type PublicServiceCapability = {
  hatSlug: string;
  name: string;
  role: "lead" | "core" | "supporting" | "recommended";
  state: "previously-applied" | "configured-recommendation";
  reason: string;
};

export type PublicServiceProject = {
  projectSlug: string;
  name: string;
  connectionLabel: string;
  headline: string;
  summary: string;
  additionalContributions: Array<{ title: string; summary: string }>;
};

export type PublicServiceResult = {
  status: "direct-match" | "broad-match" | "exploratory-route" | "provisional-route" | "clarification-required";
  understood: { title: string; summary: string };
  route: {
    concepts: string[];
    unresolvedTerms: string[];
    objective?: string;
  };
  capabilities: PublicServiceCapability[];
  projects: PublicServiceProject[];
  refinement?: string;
};
