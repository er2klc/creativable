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

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fullName = user.user_metadata?.full_name;
      if (fullName) {
        return { name: fullName };
      }

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

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
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('session_not_found')) {
          console.info('Session already expired, proceeding with cleanup');
        } else {
          throw error;
        }
      }

      toast({
        title: "Erfolgreich abgemeldet",
        description: "Auf Wiedersehen!",
      });

      navigate("/auth", { replace: true });
      
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Abmeldung",
        description: "Sie wurden aus Sicherheitsgründen abgemeldet.",
      });
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent font-orbitron">
            Willkommen, {displayName}
          </h1>
          <p className="text-white/60 mt-1 text-lg">
            Hier ist Ihr aktueller Überblick
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSignOut} 
            className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm"
          >
            Abmelden
          </Button>
        </div>
      </div>
      {dailyQuote && (
        <div className="relative">
          <div className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
            <p className="text-lg text-white/90 italic text-center">
              "{dailyQuote}"
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
    </div>
  );
};
