const schoolMark =
  "/images/projects/bjorr/logo_design/bjorr-emblem-uppercase-B-clean-vector.svg";
const institutionMark =
  "/images/projects/bjorr/logo_design/bjorr-emblem-lowercase-b-clean-vector.svg";

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
  return (
    <section className="bjorr-identity-language" aria-labelledby="bjorr-identity-title">
      <header>
        <p className="work-kicker">IDENTITY LANGUAGE</p>
        <h2 id="bjorr-identity-title">One institution, two registers</h2>
        <p>
          Bjórr&apos;s identity shifts with context: gold carries the warmth and
          ceremony of the school, while mineral neutrals give the wider
          institution clarity, permanence and authority.
        </p>
      </header>

      <div className="bjorr-language-grid">
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
            <span>Branding language set</span>
            <p>
              Old gold, shadow and warm parchment create an expressive,
              prestigious register for learning, teaching and school life.
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
              White, silver, steel and stone form a calm architectural system
              for governance, research, records and institutional communication.
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
    </section>
  );
}
