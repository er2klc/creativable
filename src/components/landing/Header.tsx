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

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-black/80 backdrop-blur-lg shadow-lg border-b border-white/5" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
            <span className="text-lg font-bold">creativable</span>
          </div>
          <nav className="hidden md:flex gap-4">
            <NavItem href="#features">Funktionen</NavItem>
            <NavItem href="#why">Warum Creativable?</NavItem>
            <NavItem href="#pricing">Preise</NavItem>
            <NavItem href="#customers">Unsere Kunden</NavItem>
            <NavItem href="#support">Support</NavItem>
            <NavItem href="#updates">Updates & Roadmap</NavItem>
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
              <Button 
                onClick={() => navigate("/auth")} 
                variant="ghost"
                className="text-white hover:text-white/80"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Decorative Line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
    </header>
  );
};

const NavItem = ({ children, href }: { children: React.ReactNode; href: string }) => {
  return (
    <a 
      href={href}
      className="relative px-3 py-2 text-white/90 hover:text-white transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white/80 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
    </a>
  );
};