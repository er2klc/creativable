import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";
import { CreatePlatformDialog } from "@/components/elevate/CreatePlatformDialog";

const fetchPlatforms = async () => {
  const user = await supabase.auth.getUser();
  if (!user?.data.user?.id) return [];

  try {
    const { data: teamIds } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.data.user.id);

    const teamIdList = teamIds?.map(t => t.team_id) || [];

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
      .or(`created_by.eq.${user.data.user.id},elevate_team_access.team_id.in.(${teamIdList.map(id => `"${id}"`).join(',')})`);

    if (platformsError) {
      console.error("Error in platform loading:", platformsError);
      throw platformsError;
    }

    return platforms || [];
  } catch (err: any) {
    console.error("Error loading platforms:", err);
    throw err;
  }
};

const Elevate = () => {
  const user = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
      console.error('Error deleting platform:', error);
      toast.error(error.message || "Fehler beim Löschen der Plattform");
    }
  };

  if (error) {
    console.error("Error loading platforms:", error);
    toast.error("Fehler beim Laden der Plattformen");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ElevateHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
      <CreatePlatformDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default Elevate;