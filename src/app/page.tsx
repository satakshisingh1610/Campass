import { Suspense } from "react";
import { HeroSection } from "@/components/colleges/HeroSection";
import { CollegeListingSection } from "@/components/colleges/CollegeListingSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <HeroSection />
      <Suspense fallback={<div className="p-8 text-center text-muted">Loading colleges...</div>}>
        <CollegeListingSection />
      </Suspense>
    </div>
  );
}
