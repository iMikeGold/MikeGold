"use client";

import { useState } from "react";

const schoolMark =
  "/images/projects/bjorr/logo_design/master/bjorr-emblem-lowercase-b-clean-vector.svg";
const institutionMark =
  "/images/projects/bjorr/logo_design/master/bjorr-emblem-uppercase-B-clean-vector.svg";

const logoFamily = [
  {
    src: schoolMark,
    label: "School · master emblem",
    tone: "light",
  },
  {
    src: "/images/projects/bjorr/logo_design/emblem/school/cream/gold-shadow/emblem-cream-gold-shadow.svg",
    label: "School · cream / gold shadow",
    tone: "warm",
  },
  {
    src: "/images/projects/bjorr/logo_design/emblem/school/yellow/silver/yellow-stone-shadow300.webp",
    label: "School · yellow / stone shadow",
    tone: "dark",
  },
  {
    src: institutionMark,
    label: "Institution · master emblem",
    tone: "light",
  },
  {
    src: "/images/projects/bjorr/logo_design/emblem/institution/crimson/steel/crimson-blue-steel-01.svg",
    label: "Institution · crimson blue / steel",
    tone: "light",
  },
  {
    src: "/images/projects/bjorr/logo_design/emblem/institution/white_gold/white-gold-01.svg",
    label: "Institution · white / gold",
    tone: "dark",
  },
];

const learnerViews = [
  {
    key: "dashboard",
    label: "Learner dashboard",
    kicker: "Return to the current learning place",
    title: "A dashboard organised around state, not administration",
    description:
      "The account home returns each learner to their active field, pathway, course and mastery state, with adaptive observations kept visible but clearly bounded.",
    src: "/images/projects/bjorr/adaptive_learning/user_accounts/dashboard.webp",
  },
  {
    key: "pathways",
    label: "Learning pathways",
    kicker: "Personal progress across connected study",
    title: "Courses stay attached to the learner’s evolving state",
    description:
      "Enrolments show mode, expected study time and progress together, making the relationship between current position and the next knowledge path legible.",
    src: "/images/projects/bjorr/adaptive_learning/user_accounts/my-learning.webp",
  },
  {
    key: "course",
    label: "Adaptive course",
    kicker: "Interaction and progress tracking",
    title: "Learning is structured as a sequence of active modes",
    description:
      "Reading, practice and connection-building sit inside a visible route through knowledge, with progress retained at both course and activity level.",
    src: "/images/projects/bjorr/adaptive_learning/adaptive_ux/adaptive_learning/online-course.webp",
  },
];

const colourStates = [
  {
    key: "cream",
    label: "Cream",
    note: "Warm institutional paper",
    description:
      "Institutional cream creates a calm reading field, with ink-blue structure and deliberate crimson accents guiding action.",
    swatch: "#eee7d8",
    src: "/images/projects/bjorr/web_build/school/interface-cream.webp",
  },
  {
    key: "white",
    label: "Soft White",
    note: "Bright, low-friction field",
    description:
      "A brighter white-cream environment reduces visual weight while soft blue structure and warm contrast preserve hierarchy.",
    swatch: "#f4f2ec",
    src: "/images/projects/bjorr/web_build/school/interface-white.webp",
  },
  {
    key: "crimson",
    label: "Dark Crimson",
    note: "Deep blue and crimson",
    description:
      "Midnight-blue foundations support concentrated study, with crimson signals and warm cream typography maintaining orientation.",
    swatch: "#8f1e3d",
    src: "/images/projects/bjorr/web_build/school/interface-crimson-blue.webp",
  },
  {
    key: "black",
    label: "Soft Black",
    note: "Reduced-glare study state",
    description:
      "Near-black surfaces reduce glare for sustained work, using restrained blue depth and quiet crimson signals for navigation.",
    swatch: "#11161b",
    src: "/images/projects/bjorr/web_build/school/interface-black.webp",
  },
];

function MaskedMark({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`bjorr-masked-mark ${className}`}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
      }}
    />
  );
}

export default function BjorrIdentityLanguage() {
  const [learnerView, setLearnerView] = useState(learnerViews[0]);
  const [colourState, setColourState] = useState(colourStates[0]);

  return (
    <div className="bjorr-case-study">
      <style>{`
        .bjorr-case-study .bjorr-platform-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .bjorr-case-study .bjorr-platform-grid figure,
        .bjorr-case-study .bjorr-platform-grid figure:last-child {
          grid-column: auto;
        }
        .bjorr-case-study .bjorr-platform-grid img {
          aspect-ratio: auto;
          height: auto;
          object-fit: contain;
          object-position: center top;
        }
        @media (max-width: 760px) {
          .bjorr-case-study .bjorr-platform-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>

      <section className="bjorr-identity-language" aria-labelledby="bjorr-identity-title">
        <header>
          <p className="work-kicker">01 · IDENTITY ARCHITECTURE</p>
          <h2 id="bjorr-identity-title">One institution, two registers</h2>
          <p>
            A connected identity family gives the School warmth and ceremony,
            while the wider Institution carries clarity, permanence and
            independent authority.
          </p>
        </header>

        <div className="bjorr-language-grid" data-bjorr-identity-registers>
          <article className="bjorr-language-card bjorr-language-school">
            <div className="bjorr-mark-lockup">
              <MaskedMark src={schoolMark} className="bjorr-school-mark" />
              <span className="bjorr-lockup-rule" aria-hidden="true" />
              <h3>
                <span>School</span>
                <span>of Bjórr</span>
              </h3>
            </div>
            <div className="bjorr-language-copy">
              <span>School branding language</span>
              <p>
                The lowercase-b mark, old gold, shadow and warm parchment form
                the expressive register for learning, teaching and school life.
              </p>
            </div>
            <div className="bjorr-swatches" aria-label="School palette">
              <span style={{ background: "#c49a4a" }}>Old gold</span>
              <span style={{ background: "#6f521f" }}>Gold shadow</span>
              <span style={{ background: "#eee7d8", color: "#18202b" }}>Parchment</span>
            </div>
          </article>

          <article className="bjorr-language-card bjorr-language-institution">
            <div className="bjorr-mark-lockup">
              <MaskedMark src={institutionMark} className="bjorr-institution-mark" />
              <span className="bjorr-lockup-rule" aria-hidden="true" />
              <h3>
                <span>Bjórr</span>
                <span>Institution</span>
              </h3>
            </div>
            <div className="bjorr-language-copy">
              <span>Institutional register</span>
              <p>
                The uppercase-B mark and white, silver, steel and stone create
                an architectural system for research, governance and record.
              </p>
            </div>
            <div className="bjorr-swatches" aria-label="Institution palette">
              <span style={{ background: "#f4f2ec", color: "#18202b" }}>White</span>
              <span style={{ background: "#c7cbd0", color: "#18202b" }}>Silver</span>
              <span style={{ background: "#707984" }}>Steel</span>
              <span style={{ background: "#454743" }}>Stone</span>
            </div>
          </article>
        </div>

        <div className="bjorr-logo-family">
          <div>
            <p className="work-kicker">THE EMBLEM FAMILY</p>
            <h3>Selected School and Institution treatments</h3>
            <p>
              Three School treatments and three Institution treatments show the
              design nuance across master marks, materials and colour registers
              without enlarging every production variation into a separate case-study image.
            </p>
          </div>
          <div className="bjorr-logo-cluster">
            {logoFamily.map((logo) => (
              <figure className={`bjorr-logo-tile is-${logo.tone}`} key={logo.src}>
                <img src={logo.src} alt="" loading="lazy" />
                <figcaption>{logo.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bjorr-case-chapter" aria-labelledby="bjorr-platform-title">
        <header>
          <p className="work-kicker">02 · CONNECTED DIGITAL ENVIRONMENTS</p>
          <h2 id="bjorr-platform-title">Two public environments in one connected system</h2>
          <p>
            The main Bjórr environment routes people into learning and institutional
            knowledge, while the Institution environment carries governance,
            standards, research and public record.
          </p>
        </header>
        <div className="bjorr-platform-grid">
          <figure>
            <img
              src="/images/projects/bjorr/web_build/bjorr_main/main-website.webp"
              alt="Bjórr connected-system website"
              loading="lazy"
            />
            <figcaption>
              <span>Bjórr</span>
              <strong>Connected routes into learning and institutional knowledge</strong>
            </figcaption>
          </figure>
          <figure>
            <img
              src="/images/projects/bjorr/web_build/institution/institution-website.webp"
              alt="Bjórr Institution website"
              loading="lazy"
            />
            <figcaption>
              <span>Institution</span>
              <strong>Governance, standards, research and public record</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bjorr-case-chapter" aria-labelledby="bjorr-state-title">
        <header>
          <p className="work-kicker">03 · LEARNER-CONTROLLED ENVIRONMENT</p>
          <h2 id="bjorr-state-title">Four colour states, one coherent study environment</h2>
          <p>
            The study environment can change with learner preference while
            hierarchy, navigation and interaction remain stable. Select a state
            below to compare the same interface system.
          </p>
        </header>
        <div className="bjorr-state-selector" role="tablist" aria-label="Interface colour states">
          {colourStates.map((state) => (
            <button
              aria-selected={colourState.key === state.key}
              className={colourState.key === state.key ? "is-active" : ""}
              key={state.key}
              onClick={() => setColourState(state)}
              role="tab"
              type="button"
            >
              <span style={{ background: state.swatch }} />
              <strong>{state.label}</strong>
              <small>{state.note}</small>
            </button>
          ))}
        </div>
        <figure className="bjorr-state-stage">
          <img src={colourState.src} alt={`Study interface in the ${colourState.label} colour state`} />
          <figcaption>
            <strong>{colourState.label}</strong>
            <span>{colourState.description}</span>
          </figcaption>
        </figure>
      </section>

      <section className="bjorr-case-chapter" aria-labelledby="bjorr-learning-title">
        <header>
          <p className="work-kicker">04 · ADAPTIVE LEARNING EXPERIENCE</p>
          <h2 id="bjorr-learning-title">The interface remembers where learning is happening</h2>
          <p>
            Bjórr connects accounts, courses and progress into a learner-facing
            system that privileges current state, active practice and the next
            useful step.
          </p>
        </header>
        <div className="bjorr-tab-list" role="tablist" aria-label="Learning experience views">
          {learnerViews.map((view) => (
            <button
              aria-selected={learnerView.key === view.key}
              className={learnerView.key === view.key ? "is-active" : ""}
              key={view.key}
              onClick={() => setLearnerView(view)}
              role="tab"
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>
        <article className="bjorr-feature-stage">
          <div className="bjorr-feature-copy">
            <span>{learnerView.kicker}</span>
            <h3>{learnerView.title}</h3>
            <p>{learnerView.description}</p>
          </div>
          <figure>
            <img src={learnerView.src} alt={`${learnerView.label} interface`} />
          </figure>
        </article>
      </section>
    </div>
  );
}
