
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-team-members";

interface MembersCardProps {
  teamId: string;
  teamSlug: string;
}

export const MembersCard = ({ teamId, teamSlug }: MembersCardProps) => {
  const navigate = useNavigate();
  const { data: members = [], isLoading, prefetchFullMembers } = useTeamMembers(teamId, { limit: 6 });

  const handleMouseEnter = () => {
    prefetchFullMembers();
  };

  const handleClick = async () => {
    await prefetchFullMembers();
    navigate(`/unity/team/${teamSlug}/members`);
  };

  if (!members?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" onMouseEnter={handleMouseEnter}>
      {members.map((member) => (
        <Card
          key={member.id}
          className="p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={handleClick}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.profile?.avatar_url} />
                <AvatarFallback>
                  {member.profile?.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                  member.profile?.status === 'online' ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </div>
            <div>
              <div className="font-medium truncate max-w-[120px]">
                {member.profile?.display_name}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {member.points.level}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
