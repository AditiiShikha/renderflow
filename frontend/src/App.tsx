import { useSimulation } from "./hooks/useSimulation";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import LiveDashboard from "./components/LiveDashboard";
import TransformSection from "./components/TransformSection";
import TopologySection from "./components/TopologySection";
import CommandSection from "./components/CommandSection";
import TelemetrySection from "./components/TelemetrySection";
import WhyThisSection from "./components/WhyThisSection";
import ViewSwitchSection from "./components/ViewSwitchSection";
import ComparisonSection from "./components/ComparisonSection";

export default function App() {
  const sim = useSimulation();

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <LiveDashboard sim={sim} />
        <TransformSection />
        <TopologySection />
        <CommandSection />
        <TelemetrySection />
        <WhyThisSection />
        <ViewSwitchSection />
        <ComparisonSection />
      </main>
    </>
  );
}
