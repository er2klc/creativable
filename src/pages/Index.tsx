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

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <MainLayout
      pageTitle="Create. Connect. Grow."
      pageSubtitle="Transform your creative vision into reality with our intuitive platform."
      showButton={true}
      buttonText="Start Creating Now"
      buttonAction={() => navigate("/auth")}
      isHomePage={true}
    >
      <div className="min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden">
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
                variant="glassy"
                size="lg"
                className="px-8 py-6 text-lg"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
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