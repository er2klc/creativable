import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, BarChart, Users, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SnapCard } from "./snap-cards/SnapCard";
import { HiddenSnapCard } from "./snap-cards/HiddenSnapCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
}

export const TeamSnaps = ({ isAdmin, isManaging, teamId }: TeamSnapsProps) => {
  const session = useSession();
  const queryClient = useQueryClient();

  const { data: hiddenSnaps = [] } = useQuery({
    queryKey: ["team-hidden-snaps", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_hidden_snaps")
        .select("snap_id")
        .eq("team_id", teamId);

      if (error) throw error;
      return data.map(snap => snap.snap_id);
    },
  });

  const hideSnapMutation = useMutation({
    mutationFn: async (snapId: string) => {
      const { error } = await supabase
        .from("team_hidden_snaps")
        .insert({
          team_id: teamId,
          snap_id: snapId,
          hidden_by: session?.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-hidden-snaps", teamId] });
    },
  });

  const unhideSnapMutation = useMutation({
    mutationFn: async (snapId: string) => {
      const { error } = await supabase
        .from("team_hidden_snaps")
        .delete()
        .eq("team_id", teamId)
        .eq("snap_id", snapId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-hidden-snaps", teamId] });
    },
  });

  const regularSnaps = [
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Diskussionen & Beiträge",
      description: "Teilen Sie Ideen und Diskussionen mit Ihrem Team",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Kalender",
      description: "Planen Sie Termine und Events",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "files",
      icon: <FolderOpenIcon className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
    },
  ];

  const adminSnaps = [
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Verwalten Sie Teammitglieder",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      id: "analytics",
      icon: <BarChart className="h-8 w-8" />,
      label: "Statistiken",
      description: "Analysieren Sie Team-Aktivitäten",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Konfigurieren Sie Team-Einstellungen",
      gradient: "from-gray-500 to-gray-600",
    },
  ];

  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = isAdmin ? adminSnaps : [];
  const hiddenRegularSnaps = regularSnaps.filter(snap => hiddenSnaps.includes(snap.id));

  return (
    <div className="space-y-8">
      {visibleRegularSnaps.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRegularSnaps.map((snap) => (
              <SnapCard
                key={snap.id}
                snap={snap}
                isManaging={isManaging}
                onHide={hideSnapMutation.mutate}
                canHide={true}
              />
            ))}
          </div>
        </div>
      )}

      {isAdmin && visibleAdminSnaps.length > 0 && (
        <div className="space-y-4">
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleAdminSnaps.map((snap) => (
              <SnapCard
                key={snap.id}
                snap={snap}
                isManaging={isManaging}
                isAdmin={true}
                canHide={false}
              />
            ))}
          </div>
        </div>
      )}

      {isManaging && hiddenRegularSnaps.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hiddenRegularSnaps.map((snap) => (
              <HiddenSnapCard
                key={snap.id}
                snap={snap}
                onUnhide={unhideSnapMutation.mutate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};