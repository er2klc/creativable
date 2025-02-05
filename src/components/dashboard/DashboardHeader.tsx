import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";

interface DashboardHeaderProps {
  userEmail: string | undefined;
}

export const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyQuote, setDailyQuote] = useState<string>("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

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

  const displayName = profile?.display_name || userEmail?.split('@')[0] || "Benutzer";

  return (
    <div className="flex flex-col gap-4 mb-4 md:mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Willkommen zurück, {displayName}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Hier ist Ihr aktueller Überblick
          </p>
        </div>
        <div className="w-full md:w-[400px]">
          <SearchBar />
        </div>
      </div>
      {dailyQuote && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 rounded-lg border border-primary/10">
          <p className="text-base md:text-lg text-primary italic text-center">
            "{dailyQuote}"
          </p>
        </div>
      )}
    </div>
  );
};