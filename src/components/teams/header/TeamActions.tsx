import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { TeamManagementButton } from "./TeamManagementButton";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
  members: any[];
  onManageSnaps?: () => void;
  isManaging?: boolean;
}

export function TeamActions({ 
  teamId, 
  isAdmin, 
  isOwner, 
  members,
  onManageSnaps,
  isManaging
}: TeamActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManageSnaps}
        >
          {isManaging ? 'Fertig' : 'Snaps verwalten'}
        </Button>
      )}
      <TeamManagementButton
        teamId={teamId}
        isOwner={isOwner}
        isAdmin={isAdmin}
        members={members}
      />
    </div>
  );
}