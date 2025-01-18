import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TeamList } from "./TeamList";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { useTeamOperations } from "@/hooks/use-team-operations";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";

interface TeamListViewProps {
  teams: Tables<"teams">[];
  isLoading: boolean;
}

export const TeamListView = ({ teams, isLoading }: TeamListViewProps) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const { deleteTeam, updateTeamOrder } = useTeamOperations();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLeaveTeam = async (teamId: string) => {
    // Logic for leaving a team can be added here
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
        onDelete={deleteTeam}
        onLeave={handleLeaveTeam}
        isLoading={isLoading}
        onUpdateOrder={updateTeamOrder}
      />

      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
      />
    </div>
  );
};
