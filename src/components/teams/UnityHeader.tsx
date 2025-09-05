import { useState } from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { JoinTeamDialog } from "./JoinTeamDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Infinity } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

interface UnityHeaderProps {
  onTeamCreated: () => Promise<void>;
  onTeamJoined: () => Promise<void>;
}

export const UnityHeader = ({ onTeamCreated, onTeamJoined }: UnityHeaderProps) => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const user = useUser();
  const navigate = useNavigate();

  const handleTeamClick = (teamSlug: string) => {
    navigate(`/unity/${teamSlug}`);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Infinity className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Unity
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsJoinDialogOpen(true)} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Team beitreten
                </Button>
                <CreateTeamDialog onTeamCreated={onTeamCreated} />
              </div>
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
      </div>

      <JoinTeamDialog
        isOpen={isJoinDialogOpen}
        setIsOpen={setIsJoinDialogOpen}
        onTeamJoined={onTeamJoined}
      />
    </div>
  );
};
