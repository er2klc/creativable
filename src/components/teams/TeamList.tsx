import { useState } from "react";
import { type Tables } from "@/integrations/supabase/types";
import { TeamCard } from "./TeamCard";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TeamWithStats = Tables<"teams"> & {
  stats?: {
    totalMembers: number;
    admins: number;
  };
};

interface TeamListProps {
  teams: TeamWithStats[];
  onDelete: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
  isLoading?: boolean;
  onUpdateOrder?: (teamId: string, direction: 'up' | 'down') => Promise<void>;
}

export const TeamList = ({ 
  teams,
  onDelete,
  onLeave,
  isLoading,
  onUpdateOrder
}: TeamListProps) => {
  const [copyingJoinCode, setCopyingJoinCode] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();

  // Query to check if user is super admin
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  const handleCopyJoinCode = async (joinCode: string) => {
    if (copyingJoinCode) return;

    try {
      setCopyingJoinCode(true);
      await navigator.clipboard.writeText(joinCode);
      toast({
        title: settings?.language === "en" ? "Join code copied!" : "Beitrittscode kopiert!",
        description: settings?.language === "en" 
          ? "Share this code with your team members"
          : "Teilen Sie diesen Code mit Ihren Teammitgliedern",
      });
    } catch (error) {
      console.error("Error copying join code:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to copy join code"
          : "Beitrittscode konnte nicht kopiert werden",
        variant: "destructive",
      });
    } finally {
      setCopyingJoinCode(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      await onDelete(teamId);
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleLeave = async (teamId: string) => {
    try {
      await onLeave(teamId);
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  if (isLoading) {
    return <div className="space-y-4">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onDelete={handleDelete}
          onLeave={handleLeave}
          onCopyJoinCode={handleCopyJoinCode}
          isSuperAdmin={profile?.is_super_admin}
        />
      ))}
    </div>
  );
};