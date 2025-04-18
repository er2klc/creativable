
import { SearchBar } from "../dashboard/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useQuery } from "@tanstack/react-query";
import { Waves } from "lucide-react";
import { ViewModeButtons } from "@/components/leads/header/components/ViewModeButtons";

interface PoolHeaderProps {
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
}

export const PoolHeader = ({ viewMode, setViewMode }: PoolHeaderProps) => {
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

  const userEmail = profile?.email;

  return (
    <div className="fixed top-[64px] md:top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mt-8 md:mt-0">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Pool
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            <HeaderActions profile={profile} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};
