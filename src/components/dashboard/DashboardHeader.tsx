import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface DashboardHeaderProps {
  userEmail: string | undefined;
}

export const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user settings to get the name
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const displayName = settings?.registration_company_name || userEmail?.split('@')[0] || "Benutzer";

  const handleSignOut = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found during logout");
        // Clear any local state/storage if needed
        navigate("/");
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('user_not_found')) {
          console.log("User not found during logout, clearing session anyway");
          // Force navigation to clear the invalid session state
          navigate("/");
          return;
        }
        throw error;
      }

      toast({
        title: "Erfolgreich abgemeldet",
        description: "Auf Wiedersehen!",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Fehler beim Abmelden",
        description: "Bitte versuchen Sie es erneut.",
      });
      // Force navigation on critical errors
      navigate("/");
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Willkommen, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Hier ist Ihr aktueller Überblick
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={handleSignOut} variant="outline">
          Abmelden
        </Button>
      </div>
    </div>
  );
};