import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";

const fetchPlatforms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    console.log("[Debug] No user found");
    return [];
  }

  try {
    // First fetch team IDs
    const { data: teamIds, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (teamError) {
      console.error("[Debug] Error fetching team IDs:", teamError);
      throw teamError;
    }

    // Format team IDs properly for the query
    const teamIdList = teamIds?.map(t => `'${t.team_id}'`) || [];
    const teamIdClause = teamIdList.length > 0 ? `elevate_team_access.team_id.in.(${teamIdList.join(',')})` : 'false';

    // Fetch platforms with proper error handling
    const { data: platforms, error: platformsError } = await supabase
      .from('elevate_platforms')
      .select(`
        *,
        elevate_team_access (
          team_id,
          teams (
            id,
            name
          )
        )
      `)
      .or(`created_by.eq.${user.id},${teamIdClause}`);

    if (platformsError) {
      console.error("[Debug] Error fetching platforms:", platformsError);
      throw platformsError;
    }

    // Get platforms accessible via user_access (invite codes)
    const { data: userAccessPlatforms, error: userAccessError } = await supabase
      .from('elevate_platforms')
      .select(`
        *,
        elevate_user_access!inner (
          user_id
        )
      `)
      .eq('elevate_user_access.user_id', user.id);

    if (userAccessError) {
      console.error("[Debug] Error fetching user access platforms:", userAccessError);
      throw userAccessError;
    }

    // Combine and deduplicate platforms
    const allPlatforms = [...(platforms || []), ...(userAccessPlatforms || [])];
    const uniquePlatforms = Array.from(new Set(allPlatforms.map(p => p.id)))
      .map(id => allPlatforms.find(p => p.id === id));

    console.log("[Debug] Loaded platforms:", uniquePlatforms);
    return uniquePlatforms || [];
  } catch (err: any) {
    console.error("[Debug] Error in fetchPlatforms:", err);
    throw err;
  }
};

const Elevate = () => {
  const user = useUser();

  const { data: platforms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['platforms', user?.id],
    queryFn: fetchPlatforms,
    enabled: !!user?.id,
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elevate_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Plattform erfolgreich gelöscht");
      refetch();
    } catch (error: any) {
      console.error('[Debug] Error deleting platform:', error);
      toast.error(error.message || "Fehler beim Löschen der Plattform");
    }
  };

  if (error) {
    console.error("[Debug] Error loading platforms:", error);
    toast.error("Fehler beim Laden der Plattformen");
  }

  const handlePlatformCreated = async () => {
    await refetch();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ElevateHeader onPlatformCreated={handlePlatformCreated} />
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Elevate;