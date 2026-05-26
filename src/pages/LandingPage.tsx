import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { InfoSection } from '../components/landing/InfoSection';
import { StatsSection } from '../components/landing/StatsSection';
import { BackedBySection } from '../components/landing/BackedBySection';
import { UseCasesSection } from '../components/landing/UseCasesSection';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Expose lenis globally so Navbar can use it for scrollTo
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      <Navbar />
      <div className="h-screen flex flex-col relative">
        <HeroSection />
      </div>
      <InfoSection />
      <StatsSection />
      <BackedBySection />
      <UseCasesSection />
      <Footer />
    </div>
  );
}
