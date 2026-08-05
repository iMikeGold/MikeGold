export type ProjectCaseStudyMaturity = "full" | "developing" | "summary";

export interface ProjectCaseStudyTextBlock {
  title: string;
  description: string;
}

export interface ProjectCaseStudyImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProjectCaseStudyIdentityMark extends ProjectCaseStudyImage {
  tone?: "cream" | "light" | "dark";
}

export interface ProjectCaseStudyRecord {
  projectSlug: string;
  maturity: ProjectCaseStudyMaturity;
  featuredOrder?: number;
  showcase?: boolean;
  eyebrow?: string;
  title?: string;
  definition?: string;
  roleSummary?: string;
  responsibilities?: string[];
  highlights?: ProjectCaseStudyTextBlock[];
  heroImage?: ProjectCaseStudyImage;
  gallery?: ProjectCaseStudyImage[];
  identityMarks?: ProjectCaseStudyIdentityMark[];
  note?: string;
}
