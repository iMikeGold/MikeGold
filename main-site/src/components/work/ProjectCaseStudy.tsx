import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import type { ProjectCaseStudyRecord } from "@/system/projects/project-case-study.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import styles from "./ProjectCaseStudy.module.css";

const lensLabels: Record<string, string> = {
  "physical-systems-engineering": "Physical systems engineering",
  "system-product-definition": "System and product definition",
  "software-web-engineering": "Software and web engineering",
  "infrastructure-operations": "Infrastructure and operations",
  "brand-experience-systems": "Brand and experience systems",
  "media-production-distribution": "Media production and distribution",
};

type CaseStudyHat = {
  slug: string;
  name: string;
};

function TextSection({
  kicker,
  title,
  paragraphs,
}: {
  kicker: string;
  title: string;
  paragraphs: string[];
}) {
  if (!paragraphs.length) return null;

  return (
    <section className={styles.proseSection}>
      <header>
        <p className="work-kicker">{kicker}</p>
        <h2>{title}</h2>
      </header>
      <div className={styles.proseColumns}>
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
  );
}

function BlockSection({
  kicker,
  title,
  blocks,
}: {
  kicker: string;
  title: string;
  blocks: Array<{ title: string; description: string }>;
}) {
  if (!blocks.length) return null;

  return (
    <section className={styles.blockSection}>
      <header>
        <p className="work-kicker">{kicker}</p>
        <h2>{title}</h2>
      </header>
      <div className={styles.blockGrid}>
        {blocks.map((block, index) => (
          <article key={`${block.title}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{block.title}</h3>
            <p>{block.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ProjectCaseStudy({
  caseStudy,
  work,
  hats,
  evidence,
}: {
  caseStudy: ProjectCaseStudyRecord;
  work: PublicWorkProjection[];
  hats: CaseStudyHat[];
  evidence: PublicEvidenceProjection[];
}) {
  const hero = caseStudy.heroImage;
  const galleryLimit = caseStudy.evidence?.galleryLimit ?? 4;
  const gallery = evidence
    .filter((item) => {
      if (item.placeholder) return false;
      if (!item.assetPath && !item.thumbnailUrl) return false;
      if (item.presentation?.displayRoles?.length === 1
        && item.presentation.displayRoles[0] === "archive") return false;
      return (item.assetPath ?? item.thumbnailUrl) !== hero?.src;
    })
    .slice(0, galleryLimit);

  const stateSections = [
    caseStudy.currentState
      ? { kicker: "CURRENT IMPLEMENTATION", title: "What exists now", value: caseStudy.currentState }
      : null,
    caseStudy.plannedDevelopment
      ? { kicker: "PLANNED DEVELOPMENT", title: "What follows", value: caseStudy.plannedDevelopment }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className={styles.caseStudy}>
      <section className={styles.introduction} aria-labelledby="case-study-definition">
        <div className={styles.introductionCopy}>
          <p className="work-kicker">{caseStudy.eyebrow ?? "EXPANDED PROJECT CASE STUDY"}</p>
          <h2 id="case-study-definition">Engineering definition</h2>
          <p>{caseStudy.definition}</p>
          <span className={styles.maturity}>{caseStudy.maturity.replaceAll("-", " ")}</span>
        </div>
        {hero && (
          <figure className={styles.heroFigure}>
            <img src={hero.src} alt={hero.alt} />
            {hero.caption && <figcaption>{hero.caption}</figcaption>}
          </figure>
        )}
      </section>

      <TextSection
        kicker="01 · CONTEXT"
        title="Why this project exists"
        paragraphs={caseStudy.context ?? []}
      />
      <TextSection
        kicker="02 · THE CHALLENGE"
        title="What an ordinary implementation could not solve"
        paragraphs={caseStudy.challenge ?? []}
      />
      <TextSection
        kicker="03 · ENGINEERING PROPOSITION"
        title="The response"
        paragraphs={caseStudy.proposition ?? []}
      />

      {caseStudy.role && (
        <section className={styles.roleSection}>
          <header>
            <p className="work-kicker">04 · MY ROLE</p>
            <h2>Responsibilities across the system</h2>
            {caseStudy.role.summary && <p>{caseStudy.role.summary}</p>}
          </header>
          <div className={styles.responsibilityGrid}>
            {caseStudy.role.responsibilities.map((responsibility) => (
              <span key={responsibility}>{responsibility}</span>
            ))}
          </div>
        </section>
      )}

      <BlockSection
        kicker="05 · SYSTEM ARCHITECTURE"
        title="How the project is organised"
        blocks={caseStudy.architecture ?? []}
      />
      <BlockSection
        kicker="06 · IMPORTANT DECISIONS"
        title="Choices that shape the build"
        blocks={caseStudy.decisions ?? []}
      />
      <BlockSection
        kicker="07 · CONSTRAINTS AND BOUNDARIES"
        title="What must remain explicit"
        blocks={caseStudy.constraints ?? []}
      />

      {!!stateSections.length && (
        <section className={styles.stateGrid}>
          {stateSections.map((section) => (
            <article key={section.kicker}>
              <p className="work-kicker">{section.kicker}</p>
              <h2>{section.title}</h2>
              <p>{section.value.summary}</p>
              {!!section.value.capabilities?.length && (
                <ul>
                  {section.value.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      <section className={styles.systemRecord}>
        <header>
          <p className="work-kicker">DOCUMENTED SYSTEM RECORD</p>
          <h2>{work.length} contribution{work.length === 1 ? "" : "s"} · {hats.length} applied Hats</h2>
          <p>
            The case study explains the parent system. These records preserve the
            individual responsibilities and capabilities evidenced within it.
          </p>
        </header>
        <div className={styles.workGrid}>
          {work.map((item) => (
            <article key={item.slug}>
              <span>
                {item.capabilityGroupIds.map((lensId) => lensLabels[lensId] ?? lensId).join(" · ")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
        {!!hats.length && (
          <div className={styles.hatList} aria-label="Applied engineering Hats">
            {hats.map((hat) => <span key={hat.slug}>{hat.name}</span>)}
          </div>
        )}
      </section>

      {!!gallery.length && (
        <section className={styles.evidenceSection}>
          <header>
            <p className="work-kicker">SELECTED EVIDENCE</p>
            <h2>Interfaces, identity and development states</h2>
            {caseStudy.evidence?.note && <p>{caseStudy.evidence.note}</p>}
          </header>
          <div className={styles.evidenceGrid}>
            {gallery.map((item) => {
              const src = item.assetPath ?? item.thumbnailUrl;
              if (!src) return null;
              return (
                <figure key={item.slug}>
                  <img src={src} alt={item.description ?? item.title} loading="lazy" />
                  <figcaption>
                    <strong>{item.title}</strong>
                    {item.phase && <span>{item.phase}</span>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {caseStudy.significance && (
        <section className={styles.significance}>
          <p className="work-kicker">SIGNIFICANCE</p>
          <p>{caseStudy.significance}</p>
        </section>
      )}
    </div>
  );
}
