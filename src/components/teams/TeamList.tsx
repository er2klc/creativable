import { useQuery } from "@tanstack/react-query";
import { TeamCard } from "./TeamCard";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

interface TeamWithStats extends Tables<"teams"> {
  stats?: {
    totalMembers: number;
    admins: number;
  };
}

interface TeamListProps {
  isLoading: boolean;
  teams: TeamWithStats[];
  onDelete: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
  onUpdateOrder?: (teamId: string, newIndex: number) => Promise<void>;
}

export const TeamList = ({ 
  isLoading, 
  teams = [], 
  onDelete, 
  onLeave, 
  onUpdateOrder 
}: TeamListProps) => {
  const handleDelete = async (teamId: string) => {
    try {
      await onDelete(teamId);
      toast.success("Team erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeave = async (teamId: string) => {
    try {
      await onLeave(teamId);
      toast.success("Team erfolgreich verlassen");
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Team-Code kopiert");
  };

  return (
    <div className="grid gap-4">
      {teams?.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onDelete={handleDelete}
          onLeave={handleLeave}
          onCopyJoinCode={handleCopyJoinCode}
        />
      ))}
    </div>
  );
};