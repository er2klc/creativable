import { Infinity } from "lucide-react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { JoinTeamDialog } from "./JoinTeamDialog";

interface UnityHeaderProps {
  onTeamCreated: () => Promise<void>;
  onTeamJoined: () => Promise<void>;
}

export const UnityHeader = ({ onTeamCreated, onTeamJoined }: UnityHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Infinity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold text-primary">Unity</h1>
      </div>
      <div className="flex gap-2">
        <JoinTeamDialog onTeamJoined={onTeamJoined} />
        <CreateTeamDialog onTeamCreated={onTeamCreated} />
      </div>
    </div>
  );
};