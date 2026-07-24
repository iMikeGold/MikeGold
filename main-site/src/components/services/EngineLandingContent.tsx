"use client";

import { useServiceEngineSession } from "./ServiceEngineSession";

export default function EngineLandingContent() {
  const { submittedResult } = useServiceEngineSession();
  if (submittedResult) return null;
  return (
    <div className="service-engine-landing">
      <section>
        <h2>CORE PRiNCiPLE</h2>
        <p>Don&apos;t just select services. Describe the outcomes.</p>
      </section>
      <section>
        <h2>HOW iT WORKS</h2>
        <p>
          1. Input is interpreted as intent<br />
          2. Required service modules and dependencies are activated<br />
          3. Scope, outputs and delivery phases are assembled<br />
          4. Relevant Work and supporting capabilities are connected
        </p>
      </section>
      <section>
        <h2>EXAMPLE iNPUTS</h2>
        <p>“I need a live audio system for an installation”</p>
        <p>“I want a scalable backend for media streaming”</p>
        <p>“I need hardware + software integration for a product”</p>
      </section>
      <section>
        <h2>OUTPUT STRUCTURE</h2>
        <p>Proposed service configuration</p>
        <p>Required and recommended modules</p>
        <p>Delivery phases, capability configuration and relevant experience</p>
      </section>
      <section className="service-engine-explanation">
        <h2>CONNECTED RECORDS</h2>
        <p>The results use the same Hat records and Project → Work relationships as the Registry and Work archive. Supporting material remains behind each project and loads only when requested.</p>
      </section>
    </div>
  );
}
