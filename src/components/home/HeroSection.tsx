
import { SplitScreenHero } from "./SplitScreenHero";
import { MobileTaglineSection } from "./MobileTaglineSection";
import Canvas3DHeroSection from "./Canvas3DHeroSection";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {isMobile ? (
        <>
          <SplitScreenHero />
          <MobileTaglineSection />
        </>
      ) : (
        <Canvas3DHeroSection />
      )}
    </>
  );
};
