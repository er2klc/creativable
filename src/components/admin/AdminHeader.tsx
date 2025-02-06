import { LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminHeader = () => {
  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  return (
    <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
      <LayoutDashboard className="h-8 w-8" />
      {profile?.is_super_admin ? "Admin Dashboard" : "Changelog"}
    </h1>
  );
};