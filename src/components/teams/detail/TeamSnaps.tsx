import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, Users, Settings, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SnapCard } from "./snap-cards/SnapCard";
import { HiddenSnapCard } from "./snap-cards/HiddenSnapCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  onCalendarClick: () => void;
}

export const TeamSnaps = ({ isAdmin, isManaging, teamId, onCalendarClick }: TeamSnapsProps) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

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
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Team-Kalender",
      description: "Plane und verwalte Team-Termine",
      gradient: "from-green-500 to-green-600",
      onClick: onCalendarClick,
    },
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Diskussionen & Beiträge",
      description: "Teilen Sie Ideen und Diskussionen mit Ihrem Team",
      gradient: "from-rose-500 to-rose-600",
      onClick: () => navigate(`/team/${teamId}/discussions`),
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "files",
      icon: <FolderOpenIcon className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      id: "leaderboard",
      icon: <Trophy className="h-8 w-8" />,
      label: "Leaderboard",
      description: "Team Rangliste & Aktivitäten",
      gradient: "from-red-500 to-red-600",
      onClick: () => navigate(`/leaderboard/${teamId}`),
    },
  ];

  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const hiddenRegularSnaps = regularSnaps.filter(snap => hiddenSnaps.includes(snap.id));

  return (
    <div className="space-y-8">
      {visibleRegularSnaps.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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

      {isAdmin && hiddenRegularSnaps.length > 0 && (
        <div className="space-y-4">
          <Separator className="my-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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