
import { Trophy } from "lucide-react";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardHeaderProps {
  teamName: string;
  teamSlug: string;
  logoUrl?: string | null;
}

export const LeaderboardHeader = ({ teamName, teamSlug, logoUrl }: LeaderboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => navigate(`/unity/team/${teamSlug}`)}>
                  {logoUrl ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={logoUrl} alt={teamName} />
                      <AvatarFallback>{teamName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <span>{teamName}</span>
                </div>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span className="text-foreground">Leaderboard</span>
                </div>
              </div>
            </div>
            <div className="w-[300px]">
              <SearchBar />
            </div>
            <HeaderActions profile={null} />
          </div>
        </div>
      </div>
    </div>
  );
};
