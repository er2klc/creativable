
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "./SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { Home } from "lucide-react";

interface DashboardHeaderProps {
  userEmail: string | undefined;
}

export const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
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

  const displayName = profile?.display_name || userEmail?.split('@')[0] || "Benutzer";

  return (
    <div className="fixed top-[64px] md:top-0 left-0 right-0 z-[99] bg-background border-b md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full bg-background">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Willkommen zurück, {displayName}! 👋
              </h1>
            </div>
            <div className="w-full md:w-[400px]">
              <SearchBar />
            </div>
            <HeaderActions profile={profile} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};
