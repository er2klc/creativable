import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { MessageSquare, Sparkles, Globe, Rocket, Brain, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/landing/Header";

const Index = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden">
      <Header isScrolled={isScrolled} />

      {/* Hero Section with Gradient Background */}
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
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
              <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-32 w-32" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
              Create. Connect. Grow.
            </h1>
            <p className="text-xl text-gray-400 mt-6">
              Transform your creative vision into reality with our intuitive platform.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white px-8 py-6 rounded-lg text-lg border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300"
              >
                Start Creating Now
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
      </div>

      {/* Features Section */}
      <div id="features" className="relative w-full bg-[#111111] py-32">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-red-500/10 opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sparkles}
              title="Instant & Intuitive"
              description="Experience seamless creativity with our intuitive interface. Transform your ideas into reality with just a few clicks."
            />
            <FeatureCard
              icon={Brain}
              title="AI-Powered"
              description="Leverage the power of artificial intelligence to enhance your creative process and streamline your workflow."
            />
            <FeatureCard
              icon={Globe}
              title="Connect Globally"
              description="Join a worldwide community of creators, share your work, and collaborate with talents across the globe."
            />
          </div>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="relative w-full py-32">
        {/* Pricing content goes here */}
      </div>

      {/* Mission Section (formerly About) */}
      <div id="mission" className="relative w-full bg-[#111111] py-32">
        {/* Mission content goes here */}
      </div>

      {/* Footer */}
      <footer className="relative w-full bg-[#111111] py-16">
        {/* Footer Separator Line */}
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
                <span className="text-base font-bold">creativable</span>
              </div>
              <p className="text-gray-400 mb-4">Revolutioniere dein Social Media Marketing</p>
              <Button 
                onClick={() => navigate("/auth")} 
                variant="outline" 
                className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
              >
                Jetzt Anmelden
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Creativable</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#mission" className="hover:text-white transition-colors">Unsere Mission</a></li>
                <li><a href="/imprint" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">AGB</a></li>
                <li><a href="/partner" className="hover:text-white transition-colors">Partnerprogramm</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Media</h3>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Bleibe auf dem Laufenden mit unseren Updates</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Deine Email" 
                  className="bg-[#1A1F2C]/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 flex-1"
                />
                <Button className="bg-white text-black hover:bg-white/90">
                  Anmelden
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Creativable. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="bg-[#1A1A1A] p-8 rounded-xl hover:bg-[#222222] transition-colors">
    <Icon className="h-8 w-8 mb-4 text-gradient bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default Index;
