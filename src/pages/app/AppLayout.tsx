import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import { Sidebar } from '../../components/ui/Sidebar';
import { TopBar } from '../../components/ui/TopBar';
import { BankProvider } from '../../bank/BankContext';

export default function AppLayout() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wrapper: mainEl,
      content: mainEl.firstElementChild as HTMLElement,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <BankProvider>
      <div className="h-screen bg-[#F5F5F5] flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <TopBar />
          <main ref={mainRef} className="flex-1 min-h-0 p-8 overflow-y-auto">
            <div>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BankProvider>
  );
}
