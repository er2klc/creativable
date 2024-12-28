import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  userEmail: string | undefined;
}

export const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyQuote, setDailyQuote] = useState<string>("");

  // Fetch user settings to get the name
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First try to get the name from user metadata
      const fullName = user.user_metadata?.full_name;
      if (fullName) {
        return { name: fullName };
      }

      // If not found in metadata, try to get from settings table
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  // Fetch daily quote
  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const storedQuote = localStorage.getItem('dailyQuote');
        const storedDate = localStorage.getItem('dailyQuoteDate');
        const today = new Date().toDateString();

        if (storedQuote && storedDate === today) {
          setDailyQuote(storedQuote);
          return;
        }

        const { data, error } = await supabase.functions.invoke('generate-daily-quote');
        
        if (error) throw error;
        
        const quote = data.quote;
        setDailyQuote(quote);
        localStorage.setItem('dailyQuote', quote);
        localStorage.setItem('dailyQuoteDate', today);
      } catch (error) {
        console.error('Error fetching daily quote:', error);
        setDailyQuote("Mache jeden Tag zu deinem Meisterwerk! 🌟");
      }
    };

    fetchDailyQuote();
  }, [supabase.functions]);

  const displayName = settings?.name || userEmail?.split('@')[0] || "Benutzer";

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found during logout");
        navigate("/");
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('user_not_found')) {
          console.log("User not found during logout, clearing session anyway");
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
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-between items-center">
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
      {dailyQuote && (
        <div className="bg-primary/5 p-4 rounded-lg">
          <p className="text-lg text-primary italic text-center">
            "{dailyQuote}"
          </p>
        </div>
      )}
    </div>
  );
};
