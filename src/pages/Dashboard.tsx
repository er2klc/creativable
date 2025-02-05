import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useDefaultPipeline } from "@/hooks/use-default-pipeline";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  
  useDefaultPipeline();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 py-6">
          <div className="space-y-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-200/20">
            <DashboardHeader userEmail={user.email} />
            <SearchBar />
          </div>
          <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-200/20">
            <QuickActions />
          </div>
          <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-200/20">
            <DashboardCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;