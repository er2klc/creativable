import { Button } from "@/components/ui/button";
import { TeamManagementButton } from "./TeamManagementButton";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export function TeamActions({ teamId, isAdmin, isOwner }: TeamActionsProps) {
  if (!isAdmin && !isOwner) return null;
  
  return (
    <div className="flex items-center gap-2">
      <TeamManagementButton teamId={teamId} isOwner={isOwner} />
    </div>
  );
}