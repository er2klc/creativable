
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { ActivityCalendar } from "@/components/teams/members/profile/ActivityCalendar";
import { ProfileHeader } from "@/components/teams/members/profile/ProfileHeader";
import { MembershipCard } from "@/components/teams/members/profile/MembershipCard";
import { ProfileCard } from "@/components/teams/members/profile/ProfileCard";

const MemberProfile = () => {
  const { teamSlug, memberSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const { data: teamData } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  const { data: memberData, isLoading } = useQuery({
    queryKey: ['member-profile', teamSlug, memberSlug],
    queryFn: async () => {
      if (!teamData?.id || !memberSlug) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', memberSlug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) return null;

      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (teamMemberError) throw teamMemberError;
      if (!teamMember) return null;

      const { data: points } = await supabase
        .from('team_member_points')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .maybeSingle();

      const { data: activity } = await supabase
        .from('team_member_activity_log')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .order('activity_date', { ascending: false })
        .limit(50);

      return {
        ...profile,
        teamMember,
        points: points?.points ?? 0,
        level: points?.level ?? 1,
        stats: {
          posts_count: 0,
          followers_count: 0,
          following_count: 0
        },
        activity: activity ?? []
      };
    },
    enabled: !!teamData?.id && !!teamSlug && !!memberSlug
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!memberData || !teamData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Mitglied nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  const currentPoints = memberData.points;
  const currentLevel = memberData.level;
  const pointsToNextLevel = (currentLevel * 100) - currentPoints;

  return (
    <div>
      <ProfileHeader 
        teamData={teamData}
        userEmail={user?.email}
        teamSlug={teamSlug!}
      />

      <div className="container py-8 mt-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/unity/team/${teamSlug}/members`)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück zur Übersicht
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ActivityCalendar activities={memberData.activity} />
            <MembershipCard 
              teamData={teamData}
              followersCount={memberData.stats.followers_count}
            />
          </div>

          <div className="space-y-6">
            <ProfileCard
              memberData={memberData}
              memberSlug={memberSlug!}
              currentLevel={currentLevel}
              currentPoints={currentPoints}
              pointsToNextLevel={pointsToNextLevel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
