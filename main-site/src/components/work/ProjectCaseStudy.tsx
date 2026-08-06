import type {
  ProjectCaseStudyChapterKey,
  ProjectCaseStudyLayout,
  ProjectCaseStudyMediaLayout,
  ProjectCaseStudyMediaSection,
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

const mediaLayoutClasses: Record<ProjectCaseStudyMediaLayout, string> = {
  grid: styles.mediaLayoutGrid,
  feature: styles.mediaLayoutFeature,
  split: styles.mediaLayoutSplit,
  strip: styles.mediaLayoutStrip,
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
  const mediaSections = caseStudy.mediaSections ?? [];
  const layout = caseStudy.layout ?? "split";
  const hasHighlights = !!caseStudy.highlights?.length;
  const hasIdentity = !!identityMarks.length;
  const hasGallery = !!gallery.length;
  const hasMedia = !!mediaSections.length;

  const availableChapters = new Set<ProjectCaseStudyChapterKey>();
  if (hasHighlights) availableChapters.add("highlights");
  if (hasMedia) availableChapters.add("media");
  if (hasIdentity) availableChapters.add("identity");
  if (hasGallery) availableChapters.add("gallery");

  const defaultOrder: ProjectCaseStudyChapterKey[] =
    layout === "gallery-led"
      ? ["gallery", "highlights", "media", "identity"]
      : ["highlights", "media", "identity", "gallery"];

  const requestedOrder = caseStudy.chapterOrder ?? defaultOrder;
  const chapterOrder = [
    ...requestedOrder,
    ...defaultOrder.filter((chapter) => !requestedOrder.includes(chapter)),
  ].filter(
    (chapter, index, chapters) =>
      availableChapters.has(chapter) && chapters.indexOf(chapter) === index,
  );

  let nextChapter = 1;

  function renderHighlights() {
    if (!hasHighlights) return null;
    const chapter = nextChapter++;

    return (
      <section className={styles.highlights} aria-label="Project highlights" key="highlights">
        <header className={styles.chapterHeader}>
          <p className="work-kicker">
            {chapterNumber(chapter)} · {caseStudy.highlightEyebrow ?? "PROJECT STRUCTURE"}
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
    );
  }

  function renderMediaSection(
    section: ProjectCaseStudyMediaSection,
    sectionIndex: number,
  ) {
    const chapter = nextChapter++;
    const mediaLayout = section.layout ?? "grid";

    return (
      <section
        className={`${styles.mediaSection} ${mediaLayoutClasses[mediaLayout]}`}
        key={`media-${sectionIndex}-${section.title}`}
      >
        <header className={styles.chapterHeader}>
          <p className="work-kicker">
            {chapterNumber(chapter)} · {section.eyebrow ?? "SELECTED DEVELOPMENT"}
          </p>
          <h3>{section.title}</h3>
          {section.description && (
            <p className={styles.chapterDescription}>{section.description}</p>
          )}
        </header>
        <div className={styles.mediaSectionGrid}>
          {section.images.map((image) => (
            <figure key={image.src}>
              <div className={styles.mediaSectionMedia}>
                <img src={image.src} alt={image.alt} loading="lazy" />
              </div>
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </section>
    );
  }

  function renderIdentity() {
    if (!hasIdentity) return null;
    const chapter = nextChapter++;

    return (
      <section className={styles.identitySection} key="identity">
        <header className={styles.chapterHeader}>
          <p className="work-kicker">
            {chapterNumber(chapter)} · {caseStudy.identityEyebrow ?? "IDENTITY DEVELOPMENT"}
          </p>
          <h3>{caseStudy.identityTitle ?? "Selected mark family"}</h3>
        </header>
        <div className={styles.identityGrid} data-count={identityMarks.length}>
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
    );
  }

  function renderGallery() {
    if (!hasGallery) return null;
    const chapter = nextChapter++;

    return (
      <section className={styles.gallerySection} key="gallery">
        <header className={styles.chapterHeader}>
          <p className="work-kicker">
            {chapterNumber(chapter)} · {caseStudy.galleryEyebrow ?? "SELECTED PROJECT VIEWS"}
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
    );
  }

  const chapters = chapterOrder.flatMap((chapter) => {
    if (chapter === "highlights") return [renderHighlights()];
    if (chapter === "media") {
      return mediaSections.map((section, sectionIndex) =>
        renderMediaSection(section, sectionIndex),
      );
    }
    if (chapter === "identity") return [renderIdentity()];
    return [renderGallery()];
  });

  const projectSpecificStyles = caseStudy.projectSlug === "mickz" ? `
    .${styles.caseStudy}[data-project="mickz"] .${styles.identityGrid} {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .${styles.caseStudy}[data-project="mickz"] .${styles.identityGrid} figure:first-child {
      grid-column: 1 / -1;
    }
    .${styles.caseStudy}[data-project="mickz"] .${styles.identityGrid} figure:first-child .${styles.identityMedia} {
      min-height: 250px;
    }
    .${styles.caseStudy}[data-project="mickz"] .${styles.mediaLayoutGrid} .${styles.mediaSectionGrid} {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .${styles.caseStudy}[data-project="mickz"] .${styles.mediaLayoutGrid} .${styles.mediaSectionGrid} figure {
      grid-column: auto;
    }
    @media (max-width: 760px) {
      .${styles.caseStudy}[data-project="mickz"] .${styles.identityGrid},
      .${styles.caseStudy}[data-project="mickz"] .${styles.mediaLayoutGrid} .${styles.mediaSectionGrid} {
        grid-template-columns: minmax(0, 1fr);
      }
      .${styles.caseStudy}[data-project="mickz"] .${styles.identityGrid} figure:first-child {
        grid-column: auto;
      }
    }
  ` : null;

  return (
    <div
      className={`${styles.caseStudy} ${layoutClasses[layout]}`}
      data-layout={layout}
      data-project={caseStudy.projectSlug}
    >
      {projectSpecificStyles && <style>{projectSpecificStyles}</style>}
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

      {chapters}

      {caseStudy.note && <p className={styles.note}>{caseStudy.note}</p>}
    </div>
  );
}
