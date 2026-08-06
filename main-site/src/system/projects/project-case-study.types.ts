export type ProjectCaseStudyMaturity = "full" | "developing" | "summary";
export type ProjectCaseStudyLayout =
  | "split"
  | "media-led"
  | "gallery-led"
  | "editorial";

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
  layout?: ProjectCaseStudyLayout;
  featuredOrder?: number;
  showcase?: boolean;
  eyebrow?: string;
  title?: string;
  definition?: string;
  roleSummary?: string;
  responsibilities?: string[];
  highlightEyebrow?: string;
  highlightTitle?: string;
  highlights?: ProjectCaseStudyTextBlock[];
  heroImage?: ProjectCaseStudyImage;
  galleryEyebrow?: string;
  galleryTitle?: string;
  gallery?: ProjectCaseStudyImage[];
  identityEyebrow?: string;
  identityTitle?: string;
  identityMarks?: ProjectCaseStudyIdentityMark[];
  note?: string;
}
