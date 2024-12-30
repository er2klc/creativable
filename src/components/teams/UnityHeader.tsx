import { useState } from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { JoinTeamDialog } from "./JoinTeamDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UnityHeaderProps {
  onTeamCreated: () => Promise<void>;
  onTeamJoined: () => Promise<void>;
}

export const UnityHeader = ({ onTeamCreated, onTeamJoined }: UnityHeaderProps) => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Unity</h1>
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsJoinDialogOpen(true)} variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Team beitreten
        </Button>
        <CreateTeamDialog onTeamCreated={onTeamCreated} />
      </div>
      <JoinTeamDialog
        isOpen={isJoinDialogOpen}
        setIsOpen={setIsJoinDialogOpen}
        onTeamJoined={onTeamJoined}
      />
    </div>
  );
};