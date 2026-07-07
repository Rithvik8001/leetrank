import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { SocialProof } from "@/components/marketing/social-proof";
import { ProblemSection } from "@/components/marketing/problem-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { AnalyticsPreview } from "@/components/marketing/analytics-preview";
import { ClubCta } from "@/components/marketing/club-cta";
import { StatsBand } from "@/components/marketing/stats-band";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <ProblemSection />
        <HowItWorks />
        <FeatureGrid />
        <AnalyticsPreview />
        <ClubCta />
        <StatsBand />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
