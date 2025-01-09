import { useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Header isScrolled={isScrolled} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};