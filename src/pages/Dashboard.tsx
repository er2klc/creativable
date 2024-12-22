import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Abmelden
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">
            Willkommen zurück! Hier entsteht bald dein persönlicher MLMFlow-Bereich.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;