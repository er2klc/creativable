import { Card } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LeaderBoardCardProps {
  teamId: string;
  onMemberClick: (userId: string) => void;
}

export const LeaderBoardCard = ({ teamId, onMemberClick }: LeaderBoardCardProps) => {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['team-leaderboard', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_member_points')
        .select(`
          points,
          level,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data;
    },
  });

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-yellow-500 to-yellow-600" />
      <div className="relative p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Leaderboard</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Team Rangliste & Aktivitäten
          </p>
        </div>
        <Separator className="my-4" />
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {leaderboard.map((member, index) => (
              <div
                key={member.profiles.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg transition-colors",
                  "hover:bg-accent/50 cursor-pointer"
                )}
                onClick={() => onMemberClick(member.profiles.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profiles.avatar_url || ''} />
                    <AvatarFallback>
                      {member.profiles.display_name?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {member.profiles.display_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Level {member.level}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">
                  {member.points} Punkte
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};