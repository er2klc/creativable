
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PoolHeader = () => {
  const { user } = useAuth();

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

  return (
    <div className="fixed top-[48px] md:top-0 left-0 right-0 z-[99] bg-background/80 backdrop-blur-sm border-b md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Pool
              </h1>
            </div>
            <HeaderActions profile={profile} userEmail={user?.email} />
          </div>
        </div>
      </div>
    </div>
  );
};
