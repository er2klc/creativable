import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export function TeamActions({ teamId, isAdmin, isOwner }: TeamActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <ArrowLeft 
        className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
        onClick={() => navigate('/unity')}
      />
    </div>
  );
}