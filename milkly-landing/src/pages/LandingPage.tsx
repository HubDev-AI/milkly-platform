import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { CtaFooter } from "@/components/CtaFooter";

export function LandingPage(): JSX.Element {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <CtaFooter />
    </>
  );
}
