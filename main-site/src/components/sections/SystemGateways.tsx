import GatewayCard from "./GatewayCard";

export default function SystemGateways() {
  return (
    <section style={{ display: "grid", gap: 16, padding: 40 }}>

      <GatewayCard
        title="Hat Registry"
        description="133 capabilities forming a structured system graph"
        href="/registry"
        action="Explore"
      />

      <GatewayCard
        title="Service Engine"
        description="Intent → service configuration → scope → proof"
        href="/engine"
        action="Build"
      />

      <GatewayCard
        title="Work"
        description="Real outputs built using the system"
        href="/projects"
        action="See"
      />

    </section>
  );
}
