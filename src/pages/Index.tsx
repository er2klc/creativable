import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { MessageSquare, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";

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
    <MainLayout>
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

        {/* Features Grid */}
        <div className="relative w-full bg-[#111111] py-32">
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
                icon={Globe}
                title="Connect Globally"
                description="Join a worldwide community of creators, share your work, and collaborate with talents across the globe."
              />
            </div>
          </div>

          {/* Decorative Line */}
          <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
        </div>

        {/* Call to Action */}
        <div className="relative w-full py-32">
          {/* Background Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-yellow-500/10 to-blue-500/10 opacity-30" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to unleash your creativity?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of creators who are already building amazing things with Creativable.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white px-8 py-6 rounded-lg text-lg border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative w-full bg-[#111111] py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About</li>
                  <li>Features</li>
                  <li>Pricing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>Blog</li>
                  <li>Community</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Cookie Policy</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Creativable. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
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
