import Navbar       from "@/components/ui/landingPage/navBar";
import Hero         from "@/components/ui/landingPage/hero";
import SocialProof  from "@/components/ui/landingPage/socialProof";
import Features     from "@/components/ui/landingPage/features";
import HowItWorks   from "@/components/ui/landingPage/howItWorks";
import Pricing      from "@/components/ui/landingPage/pricing";
import About        from "@/components/ui/landingPage/about";
import Testimonials from "@/components/ui/landingPage/testimonials";
import CTA          from "@/components/ui/landingPage/cta";
import Footer       from "@/components/ui/landingPage/footer";

export const metadata = {
  title: "Render Lite — Deploy Anything, Instantly",
  description:
    "Instant cloud deployments for modern teams. From git push to live URL in seconds. No DevOps needed.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing />
      <About />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}