import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import CategoriesSection from "@/components/CategoriesSection";
import EducationLevelsSection from "@/components/EducationLevelsSection";
import TeachingMethodSection from "@/components/TeachingMethodSection";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <div className="container mx-auto container-padding py-12 md:py-16">
        <HeroSection />
      </div>
      <StatsSection />
      <CategoriesSection />
      <EducationLevelsSection />
      <TeachingMethodSection />
      <PricingSection />
      <AboutSection />
    </div>
  );
}

