import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { LeadPhases } from "@/components/dashboard/LeadPhases";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCards } from "@/components/dashboard/DashboardCards";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <DashboardHeader userEmail={user.email} />
        <QuickActions />
        <SearchBar />
        <LeadPhases />
        <DashboardMetrics />
        <DashboardCards />
      </div>
    </div>
  );
};

export default Dashboard;