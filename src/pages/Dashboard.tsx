import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SearchBar } from "@/components/dashboard/SearchBar";
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
    <div className="max-w-7xl mx-auto">
      <DashboardHeader userEmail={user.email} />
      <QuickActions />
      <SearchBar />
      <DashboardCards />
    </div>
  );
};

export default Dashboard;