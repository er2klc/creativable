import { useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonAction?: () => void;
  isHomePage?: boolean;
}

export const MainLayout = ({ 
  children, 
  pageTitle,
  pageSubtitle,
  showButton = false,
  buttonText,
  buttonAction,
  isHomePage = false
}: MainLayoutProps) => {
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
        {(pageTitle || pageSubtitle) && (
          <div className="relative min-h-[40vh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
            
            {/* Logo Background Blur */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <img 
                src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
                alt="Background Logo" 
                className="w-[800px] blur-3xl"
              />
            </div>

            <div className="container mx-auto px-4 pt-32 pb-20 text-center relative">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className="inline-block px-4 py-1 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm mb-8">
                  #creativable
                </span>
                <div className="flex justify-center mb-8">
                  <img 
                    src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
                    alt="Creativable Logo" 
                    className={isHomePage ? "h-32 w-32" : "h-24 w-24"} 
                  />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-xl text-gray-400 mt-6">
                    {pageSubtitle}
                  </p>
                )}
                {showButton && buttonText && buttonAction && (
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={buttonAction}
                      className="bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white px-8 py-6 rounded-lg text-lg border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300"
                    >
                      {buttonText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};