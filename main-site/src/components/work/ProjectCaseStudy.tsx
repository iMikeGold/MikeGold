import type {
  ProjectCaseStudyLayout,
  ProjectCaseStudyRecord,
} from "@/system/projects/project-case-study.types";
import styles from "./ProjectCaseStudy.module.css";

const identityToneClasses = {
  cream: styles.identityCream,
  light: styles.identityLight,
  dark: styles.identityDark,
};

const layoutClasses: Record<ProjectCaseStudyLayout, string> = {
  split: styles.layoutSplit,
  "media-led": styles.layoutMediaLed,
  "gallery-led": styles.layoutGalleryLed,
  editorial: styles.layoutEditorial,
};

function chapterNumber(index: number) {
  return String(index).padStart(2, "0");
}

export default function ProjectCaseStudy({
  caseStudy,
}: {
  caseStudy: ProjectCaseStudyRecord;
}) {
  if (caseStudy.showcase === false || !caseStudy.definition) return null;

  const gallery = caseStudy.gallery ?? [];
  const identityMarks = caseStudy.identityMarks ?? [];
  const layout = caseStudy.layout ?? "split";
  const hasHighlights = !!caseStudy.highlights?.length;
  const hasIdentity = !!identityMarks.length;
  const hasGallery = !!gallery.length;

  let nextChapter = 1;
  const highlightChapter = hasHighlights ? nextChapter++ : 0;
  const identityChapter = hasIdentity ? nextChapter++ : 0;
  const galleryChapter = hasGallery ? nextChapter++ : 0;

  const highlightsSection = hasHighlights ? (
    <section className={styles.highlights} aria-label="Project highlights">
      <header className={styles.chapterHeader}>
        <p className="work-kicker">
          {chapterNumber(highlightChapter)} · {caseStudy.highlightEyebrow ?? "PROJECT STRUCTURE"}
        </p>
        <h3>{caseStudy.highlightTitle ?? "A connected body of work"}</h3>
      </header>
      <div className={styles.highlightGrid}>
        {caseStudy.highlights?.map((highlight, index) => (
          <article key={highlight.title}>
            <span>{chapterNumber(index + 1)}</span>
            <h4>{highlight.title}</h4>
            <p>{highlight.description}</p>
          </article>
        ))}
      </div>
    </section>
  ) : null;

  const identitySection = hasIdentity ? (
    <section className={styles.identitySection}>
      <header className={styles.chapterHeader}>
        <p className="work-kicker">
          {chapterNumber(identityChapter)} · {caseStudy.identityEyebrow ?? "IDENTITY DEVELOPMENT"}
        </p>
        <h3>{caseStudy.identityTitle ?? "Selected mark family"}</h3>
      </header>
      <div className={styles.identityGrid}>
        {identityMarks.map((mark) => (
          <figure
            className={identityToneClasses[mark.tone ?? "dark"]}
            key={mark.src}
          >
            <div className={styles.identityMedia}>
              <img src={mark.src} alt={mark.alt} loading="lazy" />
            </div>
            {mark.caption && <figcaption>{mark.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  ) : null;

  const gallerySection = hasGallery ? (
    <section className={styles.gallerySection}>
      <header className={styles.chapterHeader}>
        <p className="work-kicker">
          {chapterNumber(galleryChapter)} · {caseStudy.galleryEyebrow ?? "SELECTED PROJECT VIEWS"}
        </p>
        <h3>{caseStudy.galleryTitle ?? "The project in practice"}</h3>
      </header>
      <div className={styles.galleryGrid}>
        {gallery.map((image) => (
          <figure key={image.src}>
            <div className={styles.galleryMedia}>
              <img src={image.src} alt={image.alt} loading="lazy" />
            </div>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <div
      className={`${styles.caseStudy} ${layoutClasses[layout]}`}
      data-layout={layout}
      data-project={caseStudy.projectSlug}
    >
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
            <div className={styles.heroMedia}>
              <img src={caseStudy.heroImage.src} alt={caseStudy.heroImage.alt} />
            </div>
            {caseStudy.heroImage.caption && (
              <figcaption>{caseStudy.heroImage.caption}</figcaption>
            )}
          </figure>
        )}
      </section>

      {layout === "gallery-led" && gallerySection}
      {highlightsSection}
      {identitySection}
      {layout !== "gallery-led" && gallerySection}

      {caseStudy.note && <p className={styles.note}>{caseStudy.note}</p>}
    </div>
  );
}
