import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useDefaultPipeline } from "@/hooks/use-default-pipeline";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Hole den aktuellen Benutzer von Supabase
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    }
    fetchUser();
  }, [navigate]);

  // Verwende den Hook, um sicherzustellen, dass der Benutzer eine Pipeline hat
  useDefaultPipeline();

  if (!user) return <p>Lade Dashboard...</p>;

  return (
    <div className="mx-auto">
      <DashboardHeader userEmail={user.email} />
      <QuickActions />
      <SearchBar />
      <DashboardCards />
    </div>
  );
};

export default Dashboard;
