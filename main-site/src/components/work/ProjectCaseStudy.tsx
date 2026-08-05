import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import type {
  ProjectCaseStudyImage,
  ProjectCaseStudyRecord,
} from "@/system/projects/project-case-study.types";
import styles from "./ProjectCaseStudy.module.css";

const identityToneClasses = {
  cream: styles.identityCream,
  light: styles.identityLight,
  dark: styles.identityDark,
};

function evidenceGallery(
  evidence: PublicEvidenceProjection[],
  heroSrc?: string,
): ProjectCaseStudyImage[] {
  return evidence
    .filter((item) => {
      if (item.placeholder || (!item.assetPath && !item.thumbnailUrl)) return false;
      if (item.presentation?.displayRoles?.length === 1
        && item.presentation.displayRoles[0] === "archive") return false;
      return (item.assetPath ?? item.thumbnailUrl) !== heroSrc;
    })
    .slice(0, 3)
    .flatMap((item) => {
      const src = item.assetPath ?? item.thumbnailUrl;
      return src
        ? [{
            src,
            alt: item.description ?? item.title,
            caption: item.title,
          }]
        : [];
    });
}

export default function ProjectCaseStudy({
  caseStudy,
  evidence,
}: {
  caseStudy: ProjectCaseStudyRecord;
  evidence: PublicEvidenceProjection[];
}) {
  if (caseStudy.showcase === false || !caseStudy.definition) return null;

  const gallery = caseStudy.gallery?.length
    ? caseStudy.gallery
    : evidenceGallery(evidence, caseStudy.heroImage?.src);

  return (
    <div className={styles.caseStudy} data-project={caseStudy.projectSlug}>
      <section className={styles.feature} aria-labelledby={`showcase-${caseStudy.projectSlug}`}>
        <div className={styles.featureCopy}>
          <p className="work-kicker">{caseStudy.eyebrow ?? "SELECTED PROJECT WORK"}</p>
          <h2 id={`showcase-${caseStudy.projectSlug}`}>
            {caseStudy.title ?? "Selected project work"}
          </h2>
          <p className={styles.definition}>{caseStudy.definition}</p>
          {caseStudy.roleSummary && (
            <p className={styles.roleSummary}>{caseStudy.roleSummary}</p>
          )}
          {!!caseStudy.responsibilities?.length && (
            <div className={styles.responsibilityList} aria-label="Areas of work">
              {caseStudy.responsibilities.map((responsibility) => (
                <span key={responsibility}>{responsibility}</span>
              ))}
            </div>
          )}
        </div>

        {caseStudy.heroImage && (
          <figure className={styles.heroFigure}>
            <img src={caseStudy.heroImage.src} alt={caseStudy.heroImage.alt} />
            {caseStudy.heroImage.caption && (
              <figcaption>{caseStudy.heroImage.caption}</figcaption>
            )}
          </figure>
        )}
      </section>

      {!!caseStudy.highlights?.length && (
        <section className={styles.highlights} aria-label="Project highlights">
          <div className={styles.highlightGrid}>
            {caseStudy.highlights.map((highlight, index) => (
              <article key={highlight.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!!caseStudy.identityMarks?.length && (
        <section className={styles.identitySection}>
          <header>
            <p className="work-kicker">SELECTED IDENTITY DEVELOPMENT</p>
            <h3>Compact mark family</h3>
          </header>
          <div className={styles.identityGrid}>
            {caseStudy.identityMarks.map((mark) => (
              <figure
                className={identityToneClasses[mark.tone ?? "dark"]}
                key={mark.src}
              >
                <img src={mark.src} alt={mark.alt} loading="lazy" />
                {mark.caption && <figcaption>{mark.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {!!gallery.length && (
        <section className={styles.gallerySection}>
          <header>
            <p className="work-kicker">SELECTED PROJECT VIEWS</p>
            <h3>Interfaces and applications</h3>
          </header>
          <div className={styles.galleryGrid}>
            {gallery.map((image) => (
              <figure key={image.src}>
                <img src={image.src} alt={image.alt} loading="lazy" />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {caseStudy.note && <p className={styles.note}>{caseStudy.note}</p>}
    </div>
  );
}
