import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { MessageSquare, Sparkles, Globe, Rocket, Brain, Github } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/5a7338a2-5048-441b-85cc-019706e45223.png" alt="Creativable Logo" className="h-12 w-12" />
          <span className="text-xl font-bold">creativable</span>
        </div>
        <div className="flex gap-6">
          <Button variant="ghost" className="text-white hover:text-white/80">Templates</Button>
          <Button variant="ghost" className="text-white hover:text-white/80">News</Button>
          <Button variant="ghost" className="text-white hover:text-white/80">Support</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center mb-8">
            <img src="/lovable-uploads/5a7338a2-5048-441b-85cc-019706e45223.png" alt="Creativable Logo" className="h-24 w-24" />
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
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white px-8 py-6 rounded-lg text-lg hover:opacity-90 transition-opacity"
            >
              Start Creating Now
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-[#111111] py-32">
        <div className="container mx-auto px-4">
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
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to unleash your creativity?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of creators who are already building amazing things with Creativable.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white px-8 py-6 rounded-lg text-lg hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111111] py-16">
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