import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  isScrolled: boolean;
}

export const Header = ({ isScrolled }: HeaderProps) => {
  const navigate = useNavigate();
  const user = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-black/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
              <span className="text-base font-bold">creativable</span>
            </div>
            {/* Vertical Separator Line */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-500/30 to-transparent mx-2" />
            <nav className="hidden md:flex gap-2">
              <NavItem href="/features">Funktionen</NavItem>
              <NavItem href="/pricing">Preise</NavItem>
              <NavItem href="/about">Über uns</NavItem>
              <NavItem href="/support">Support</NavItem>
              <NavItem href="/news">News</NavItem>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="ghost"
                className="text-white hover:text-white/80"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <button 
                    onClick={() => navigate("/auth")} 
                    className="relative px-3 py-2 text-white/90 hover:text-white transition-colors group"
                  >
                    Login
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
                  </button>
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300"
                  >
                    Register
                  </Button>
                </div>
              </>
            )}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-white p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-t border-white/10">
            <nav className="flex flex-col p-4">
              <MobileNavItem href="/features" onClick={() => setIsMobileMenuOpen(false)}>
                Funktionen
              </MobileNavItem>
              <MobileNavItem href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                Preise
              </MobileNavItem>
              <MobileNavItem href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                Über uns
              </MobileNavItem>
              <MobileNavItem href="/support" onClick={() => setIsMobileMenuOpen(false)}>
                Support
              </MobileNavItem>
              <MobileNavItem href="/news" onClick={() => setIsMobileMenuOpen(false)}>
                News
              </MobileNavItem>
              {!user && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-white/80"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/register");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
                  >
                    Register
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
      {/* Decorative Line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
    </header>
  );
};

const NavItem = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className="relative px-3 py-2 text-white/90 hover:text-white transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
    </a>
  );
};

const MobileNavItem = ({ 
  children, 
  href, 
  onClick 
}: { 
  children: React.ReactNode; 
  href: string;
  onClick: () => void;
}) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
    onClick();
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-md"
    >
      {children}
    </a>
  );
};