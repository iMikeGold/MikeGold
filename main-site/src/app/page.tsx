import SystemEntryNode from "@/components/sections/SystemEntryNode";
import SystemOverview from "@/components/sections/SystemOverview";
import CapabilitySystem from "@/components/sections/CapabilitySystem";
import SystemGateways from "@/components/sections/SystemGateways";
import Footer from "@/components/sections/Footer";


export default function Home() {
  return (
    <main>
      <SystemEntryNode />

      <section id="overview">
        <SystemOverview />
      </section>

      <section id="capabilities">
        <CapabilitySystem />
      </section>

      <section id="gateways">
        <SystemGateways />
      </section>
      <Footer />
    </main>
  );

}
