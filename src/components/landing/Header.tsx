import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isScrolled: boolean;
}

export const Header = ({ isScrolled }: HeaderProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-black/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
            <span className="text-base font-bold">creativable</span>
          </div>
          {/* Vertical Separator Line */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-500/30 to-transparent mx-2" />
          <nav className="hidden md:flex gap-6">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-white/90 hover:text-white transition-colors"
            >
              Funktionen
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-white/90 hover:text-white transition-colors"
            >
              Preise
            </button>
            <button 
              onClick={() => scrollToSection('mission')} 
              className="text-white/90 hover:text-white transition-colors"
            >
              Unsere Mission
            </button>
            <a 
              href="/support" 
              className="text-white/90 hover:text-white transition-colors"
            >
              Support
            </a>
            <a 
              href="/news" 
              className="text-white/90 hover:text-white transition-colors"
            >
              News
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="ghost"
              className="text-white hover:text-white/80"
            >
              Profil
            </Button>
          ) : (
            <>
              <button 
                onClick={() => navigate("/auth")} 
                className="text-white/90 hover:text-white transition-colors"
              >
                Login
              </button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Decorative Line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
    </header>
  );
};