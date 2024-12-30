import { Button } from "@/components/ui/button";
import { TeamManagementButton } from "./TeamManagementButton";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
  members: any[];
}

export function TeamActions({ teamId, isAdmin, isOwner, members }: TeamActionsProps) {
  if (!isAdmin && !isOwner) return null;
  
  return (
    <div className="flex items-center gap-2">
      <TeamManagementButton 
        teamId={teamId} 
        isOwner={isOwner} 
        isAdmin={isAdmin} 
        members={members}
      />
    </div>
  );
}