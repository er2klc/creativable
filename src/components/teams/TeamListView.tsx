import { useState } from "react";
import { type Tables } from "@/integrations/supabase/types";
import { TeamList } from "./TeamList";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { useTeamOperations } from "@/hooks/use-team-operations";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TeamListViewProps {
  teams: Tables<"teams">[];
  isLoading: boolean;
}

export const TeamListView = ({ teams, isLoading }: TeamListViewProps) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const { deleteTeam, updateTeamOrder } = useTeamOperations();
  const { settings } = useSettings();

  const handleLeaveTeam = async (teamId: string) => {
    // Logic for leaving a team can be added here
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
  };

  const handleUpdateOrder = async (teamId: string, direction: 'up' | 'down') => {
    await updateTeamOrder(teamId, direction);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {settings?.language === "en" ? "Teams" : "Teams"}
        </h1>
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "Create Team" : "Team erstellen"}
        </Button>
      </div>

      <TeamList
        teams={teams}
        onDelete={handleDeleteTeam}
        onLeave={handleLeaveTeam}
        isLoading={isLoading}
        onUpdateOrder={handleUpdateOrder}
      />

      <CreateTeamDialog
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
      />
    </div>
  );
};