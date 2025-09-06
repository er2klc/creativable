import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { ProfileHeader } from "@/components/teams/members/ProfileHeader";
import { ProfileCard } from "@/components/teams/members/ProfileCard";
import { ActivityCalendar } from "@/components/teams/members/ActivityCalendar";
import { MembershipCard } from "@/components/teams/members/MembershipCard";
import { ActivityFeed } from "@/components/teams/members/ActivityFeed";

interface MemberData {
  id: string;
  points: number;
  level: number;
  profile: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    email?: string;
    bio?: string;
  };
  activityLog: any[];
  posts: any[];
}

const MemberProfile = () => {
  const { teamSlug, memberSlug } = useParams();
  const user = useUser();
  const navigate = useNavigate();

  const { data: teamData } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  const teamId = teamData?.id;

  const { data: memberData, isLoading, error } = useQuery({
    queryKey: ['member-profile', teamId, memberSlug],
    queryFn: async (): Promise<MemberData | null> => {
      if (!teamId || !memberSlug) return null;

      // First get the user by slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email, bio')
        .eq('slug', memberSlug)
        .single();

      if (profileError || !profileData) {
        throw new Error('User not found');
      }

      // Get member points
      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', profileData.id)
        .single();

      // Get activity log
      const { data: activityLog } = await supabase
        .from('team_member_activity_log')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get team posts by this member
      const { data: posts } = await supabase
        .from('team_posts')
        .select('*')
        .eq('team_id', teamId)
        .eq('created_by', profileData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        id: profileData.id,
        points: memberPoints?.points || 0,
        level: memberPoints?.level || 0,
        profile: profileData,
        activityLog: activityLog || [],
        posts: posts || []
      };
    },
    enabled: !!teamId && !!memberSlug,
  });

  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent>
          <div className="text-center">Mitglied wird geladen...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !memberData) {
    return (
      <Card className="p-8">
        <CardContent>
          <div className="text-center text-red-600">
            Fehler beim Laden des Mitglieds: {error?.message}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/unity/team/${teamSlug}/members`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPoints = memberData.points || 0;
  const currentLevel = memberData.level || 0;
  const pointsToNextLevel = ((currentLevel + 1) * 100) - currentPoints;

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
            <ActivityCalendar activities={memberData.activityLog || []} />
            <MembershipCard userId={memberData.id} />
            <ActivityFeed 
              activities={memberData.activityLog || []} 
              teamSlug={teamSlug!}
            />
          </div>

          <div className="space-y-6">
            <ProfileCard
              memberData={{
                id: memberData.id,
                avatar_url: memberData.profile?.avatar_url,
                display_name: memberData.profile?.display_name,
                bio: memberData.profile?.bio,
                last_seen: new Date().toISOString(),
                joined_at: new Date().toISOString(),
                stats: { 
                  posts_count: memberData.posts?.length || 0, 
                  followers_count: 0, 
                  following_count: 0 
                },
                email: memberData.profile?.email
              }}
              memberSlug={memberSlug!}
              currentLevel={currentLevel}
              currentPoints={currentPoints}
              pointsToNextLevel={pointsToNextLevel}
              aboutMe={memberData.profile?.bio || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;