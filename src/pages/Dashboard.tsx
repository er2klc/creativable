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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <SearchBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardHeader userEmail={user.email} />
            <QuickActions />
          </div>
          <div className="lg:col-span-1">
            <EmbeddingsManager />
          </div>
        </div>
        <DashboardCards />
      </div>
    </div>
  );
};

export default Dashboard;