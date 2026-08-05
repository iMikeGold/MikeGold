export type ProjectCaseStudyMaturity = "full" | "developing" | "summary";

export interface ProjectCaseStudyTextBlock {
  title: string;
  description: string;
}

export interface ProjectCaseStudyState {
  summary: string;
  capabilities?: string[];
}

export interface ProjectCaseStudyRecord {
  projectSlug: string;
  maturity: ProjectCaseStudyMaturity;
  featuredOrder?: number;
  eyebrow?: string;
  definition: string;
  context?: string[];
  challenge?: string[];
  proposition?: string[];
  role?: {
    summary?: string;
    responsibilities: string[];
  };
  architecture?: ProjectCaseStudyTextBlock[];
  decisions?: ProjectCaseStudyTextBlock[];
  constraints?: ProjectCaseStudyTextBlock[];
  currentState?: ProjectCaseStudyState;
  plannedDevelopment?: ProjectCaseStudyState;
  significance?: string;
  heroImage?: {
    src: string;
    alt: string;
    caption?: string;
  };
  evidence?: {
    galleryLimit?: number;
    note?: string;
  };
}
