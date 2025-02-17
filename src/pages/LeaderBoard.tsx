
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  Trophy, Star, UserPlus, MessageCircle, Edit, 
  MessageSquare, Badge, Calendar, Video, 
  GraduationCap, Crown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LeaderboardTabs } from "@/components/teams/leaderboard/LeaderboardTabs";
import { LevelCard } from "@/components/teams/leaderboard/LevelOverview/LevelCard";
import { useLeaderboardData, type LeaderboardPeriod } from "@/hooks/leaderboard/useLeaderboardData";
import { useLevelRewards } from "@/hooks/leaderboard/useLevelRewards";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardHeader } from "@/components/teams/leaderboard/LeaderboardHeader";

const levelThresholds = {
  0: { min: 0, max: 49, icon: UserPlus, label: "Vorstellung" },
  1: { min: 50, max: 299, icon: MessageCircle, label: "Kommentieren" },
  2: { min: 300, max: 599, icon: Edit, label: "Beiträge" },
  3: { min: 600, max: 999, icon: MessageSquare, label: "Chat" },
  4: { min: 1000, max: 1499, icon: Badge, label: "Badge" },
  5: { min: 1500, max: 2099, icon: Calendar, label: "Events" },
  6: { min: 2100, max: 2799, icon: Star, label: "Special Badge" },
  7: { min: 2800, max: 3599, icon: Video, label: "Premium" },
  8: { min: 3600, max: 4499, icon: GraduationCap, label: "Mentor" },
  9: { min: 4500, max: 5499, icon: Trophy, label: "Beta" },
  10: { min: 5500, max: 999999, icon: Crown, label: "Leader" }
};

const calculateProgress = (points: number, level: number) => {
  const threshold = levelThresholds[level as keyof typeof levelThresholds];
  if (!threshold) return 0;
  
  const range = threshold.max - threshold.min;
  const progress = points - threshold.min;
  return Math.min(Math.max((progress / range) * 100, 0), 100);
};

const getNextLevelPoints = (currentPoints: number, currentLevel: number) => {
  const threshold = levelThresholds[currentLevel as keyof typeof levelThresholds];
  if (!threshold) return 0;
  return threshold.max - currentPoints;
};

const LeaderBoard = () => {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");

  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name, slug, logo_url, description')
        .eq('slug', teamSlug)
        .single();

      if (teamError) throw teamError;

      const { count: memberCount, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamData.id);

      if (countError) throw countError;

      return {
        ...teamData,
        member_count: memberCount
      };
    },
    enabled: !!teamSlug,
  });

  const { data: rankings = [] } = useLeaderboardData(team?.id || '', period);
  const { data: rewards = [] } = useLevelRewards(team?.id || '');
  const { data: currentUser } = useProfile();

  const levelCounts = rankings.reduce((acc, member) => {
    const level = member.level || 0;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const userRanking = rankings.findIndex(r => r.user_id === currentUser?.id) + 1;
  const currentUserData = rankings.find(r => r.user_id === currentUser?.id);
  const currentLevel = currentUserData?.level || 0;
  const currentPoints = currentUserData?.points || 0;
  const pointsToNextLevel = getNextLevelPoints(currentPoints, currentLevel);

  if (!team) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LeaderboardHeader 
        teamName={team.name}
        teamSlug={team.slug}
        logoUrl={team.logo_url}
      />
      
      <div className="container py-8 space-y-8 mt-16">
        <LeaderboardTabs currentPeriod={period} onPeriodChange={setPeriod} />

        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-40 w-40 border-4 border-primary">
                <AvatarImage src={currentUser?.avatar_url || ""} />
                <AvatarFallback className="text-4xl">
                  {currentUser?.display_name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Level {currentLevel}
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {currentUser?.display_name}
            </h2>

            <div className="mt-2 text-muted-foreground">
              {userRanking}. Platz
            </div>

            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentPoints} Punkte</span>
                <span>{pointsToNextLevel} bis Level {currentLevel + 1}</span>
              </div>
              <Progress 
                value={calculateProgress(currentPoints, currentLevel)}
                className="h-2"
              />
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(levelThresholds).map(([level, info]) => (
              <LevelCard
                key={level}
                level={parseInt(level)}
                membersCount={levelCounts[parseInt(level)] || 0}
                totalMembers={rankings.length}
                rewards={rewards.filter(r => r.level === parseInt(level))}
                icon={info.icon}
                label={info.label}
                minPoints={info.min}
                maxPoints={info.max}
                isUnlocked={currentLevel >= parseInt(level)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3">
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
                      value={calculateProgress(member.points || 0, member.level || 0)}
                      className="h-2 w-32"
                    />
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Level {member.level || 0}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">{member.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Punkte</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
