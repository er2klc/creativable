import { useState } from "react";
import { Infinity, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { JoinTeamDialog } from "./JoinTeamDialog";

interface UnityHeaderProps {
  onTeamCreated: () => Promise<void>;
  onTeamJoined: () => Promise<void>;
}

export const UnityHeader = ({ onTeamCreated, onTeamJoined }: UnityHeaderProps) => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Infinity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold text-primary">Unity</h1>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setIsJoinDialogOpen(true)}
          className="text-black"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Team beitreten
        </Button>
        <CreateTeamDialog onTeamCreated={onTeamCreated} />
        <JoinTeamDialog 
          isOpen={isJoinDialogOpen} 
          setIsOpen={setIsJoinDialogOpen} 
          onTeamJoined={onTeamJoined}
        />
      </div>
    </div>
  );
};
