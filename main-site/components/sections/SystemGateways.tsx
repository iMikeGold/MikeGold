import GatewayCard from "./GatewayCard";

export default function SystemGateways() {
  return (
    <section style={{ display: "grid", gap: 16, padding: 40 }}>

      <GatewayCard
        title="Hat Registry"
        description="133 capabilities forming a structured system graph"
        href="/registry"
      />

      <GatewayCard
        title="Service Engine"
        description="Intent → capability mapping engine"
        href="/engine"
      />

      <GatewayCard
        title="Projects"
        description="Real outputs built using the system"
        href="/projects"
      />

    </section>
  );
}