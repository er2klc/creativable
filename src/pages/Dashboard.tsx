import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          console.error("Session error:", error);
          navigate("/auth");
          return;
        }

        // Verify the current user matches the session user
        if (user?.id !== session.user.id) {
          console.error("User mismatch detected");
          await supabase.auth.signOut();
          toast.error("Session error detected. Please sign in again.");
          navigate("/auth");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/auth");
      }
    };

    checkSession();
  }, [user, navigate, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

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