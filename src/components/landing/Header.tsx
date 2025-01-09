import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  isScrolled: boolean;
}

export const Header = ({ isScrolled }: HeaderProps) => {
  const navigate = useNavigate();
  const user = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Funktionen", href: "/features" },
    { label: "Warum Creativable?", href: "#why" },
    { label: "Preise", href: "/pricing" },
    { label: "Unsere Kunden", href: "#customers" },
    { label: "Support", href: "/support" },
    { label: "Updates & Roadmap", href: "/updates" },
  ];

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-black/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
            <span className="text-white font-semibold">creativable</span>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block h-6 w-px bg-white/20 mx-4" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons / Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden md:flex items-center gap-4">
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
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="ghost"
                    className="text-white hover:text-white/80"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-64 bg-[#1A1F2C] shadow-xl z-50 p-6">
              <div className="flex flex-col h-full">
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block text-white/90 hover:text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <div className="mt-auto space-y-4">
                  {!user && (
                    <>
                      <Button
                        onClick={() => {
                          navigate("/auth");
                          setIsMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full text-white"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => {
                          navigate("/register");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
                      >
                        Register
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decorative Line */}
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </header>
  );
};