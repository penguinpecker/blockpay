import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { FlowSection } from "@/components/sections/flow";
import { FeaturesSection } from "@/components/sections/features";
import { CompareSection } from "@/components/sections/compare";
import { FaqSection } from "@/components/sections/faq";

export default function Home() {
  return (
    <>
      <Nav active="Home" />
      <main>
        <Hero />
        <FlowSection />
        <FeaturesSection />
        <CompareSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
