
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LeaderboardTabs } from "@/components/teams/leaderboard/LeaderboardTabs";
import { LevelCard } from "@/components/teams/leaderboard/LevelOverview/LevelCard";
import { useLeaderboardData, type LeaderboardPeriod } from "@/hooks/leaderboard/useLeaderboardData";
import { useLevelRewards } from "@/hooks/leaderboard/useLevelRewards";
import { useProfile } from "@/hooks/use-profile";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LeaderBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");
  const { data: rankings = [] } = useLeaderboardData(teamId!, period);
  const { data: rewards = [] } = useLevelRewards(teamId!);
  const { data: currentUser } = useProfile();

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      // Separate queries for team and member count
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      const { count: memberCount, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (countError) throw countError;

      return {
        ...teamData,
        member_count: memberCount
      };
    },
    enabled: !!teamId,
  });

  const levelCounts = rankings.reduce((acc, member) => {
    const level = member.level || 1;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const userRanking = rankings.findIndex(r => r.user_id === currentUser?.id) + 1;
  const currentUserData = rankings.find(r => r.user_id === currentUser?.id);

  if (!team) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TeamHeader 
        team={team}
        isInSnapView={false}
      />
      
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Team Leaderboard</h1>
          </div>
        </div>

        <LeaderboardTabs currentPeriod={period} onPeriodChange={setPeriod} />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <LevelCard
            key={0}
            level={0}
            membersCount={levelCounts[0] || 0}
            totalMembers={rankings.length}
            rewards={rewards.filter(r => r.level === 0)}
          />
          {[1, 2, 3, 4, 5].map((level) => (
            <LevelCard
              key={level}
              level={level}
              membersCount={levelCounts[level] || 0}
              totalMembers={rankings.length}
              rewards={rewards.filter(r => r.level === level)}
            />
          ))}
        </div>

        <div className="grid gap-4">
          {rankings.map((member, index) => (
            <Card key={member.user_id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {index < 3 ? (
                    <Trophy className={`h-8 w-8 ${
                      index === 0 ? "text-yellow-500" :
                      index === 1 ? "text-gray-400" :
                      "text-amber-700"
                    }`} />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.profiles?.avatar_url || member.avatar_url || ""} />
                  <AvatarFallback>
                    {(member.profiles?.display_name || member.display_name || "??").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-grow">
                  <div className="font-semibold">
                    {member.profiles?.display_name || member.display_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress 
                      value={((member.points || 0) % 100) / 100 * 100} 
                      className="h-2 w-32"
                    />
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Level {member.level || 0}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">{member.points}</div>
                  <div className="text-sm text-muted-foreground">Punkte</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {currentUserData && (
          <Card className="mt-4 bg-accent/5">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser?.avatar_url || ""} />
                    <AvatarFallback>
                      {currentUser?.display_name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Deine Position</div>
                    <div className="text-sm text-muted-foreground">
                      {userRanking}. Platz • {currentUserData.points} Punkte
                    </div>
                  </div>
                </div>
                <Progress 
                  value={((currentUserData.points || 0) % 100) / 100 * 100} 
                  className="w-32 h-2"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeaderBoard;
