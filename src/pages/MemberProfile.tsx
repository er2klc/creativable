
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
import { ActivityFeed } from "@/components/teams/members/profile/ActivityFeed";

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
        .select('id, name, slug, logo_url')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team:', error);
        return null;
      }
      return data;
    },
    enabled: !!teamSlug
  });

  const { data: memberData, isLoading } = useQuery({
    queryKey: ['member-profile', teamSlug, memberSlug],
    queryFn: async () => {
      if (!teamData?.id || !memberSlug) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          avatar_url,
          bio,
          status,
          personality_type
        `)
        .eq('display_name', memberSlug)
        .maybeSingle();

      if (!profile?.id) return { profile: null, memberPoints: null, activityLog: [], posts: [] };

      // Get member points
      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('*')
        .eq('user_id', profile.id)
        .eq('team_id', teamData.id)
        .maybeSingle();

      // Get activity log
      const { data: activityLog } = await (supabase as any)
        .from('team_member_activity_log')
        .select('*')
        .eq('user_id', profile.id)
        .eq('team_id', teamData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get member posts
      const { data: posts } = await supabase
        .from('team_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          slug,
          team_categories!inner (
            name
          )
        `)
        .eq('created_by', profile.id)
        .eq('team_id', teamData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const processedPosts = posts?.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        category: post.team_categories?.name || 'Uncategorized',
        reactions: 0,
        comments: 0,
        slug: post.slug || ''
      })) || [];

      return {
        ...profile,
        points: memberPoints?.points || 0,
        level: memberPoints?.level || 0,
        id: profile.id,
        activities: activityLog,
        memberPoints,
        activityLog,
        posts: processedPosts
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
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Das Mitglied konnte nicht gefunden werden oder hat keine Berechtigung für dieses Team.
            </p>
            <Button
              variant="ghost"
              size="sm"
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

  const currentPoints = memberData?.points || 0;
  const currentLevel = memberData?.level || 0;
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
            <ActivityCalendar activities={memberData?.activities || []} />
            <MembershipCard userId={memberData?.id || ''} />
            {memberData && (
              <ActivityFeed 
                activities={memberData?.activities || []} 
                teamSlug={teamSlug!}
              />
            )}
          </div>

          <div className="space-y-6">
            <ProfileCard
              memberData={{
                ...memberData,
                id: memberData?.id || '',
                last_seen: new Date().toISOString(),
                joined_at: new Date().toISOString(),
                stats: { 
                  posts_count: 0, 
                  followers_count: 0, 
                  following_count: 0 
                },
                aboutMe: ''
              }}
              memberSlug={memberSlug!}
              currentLevel={currentLevel}
              currentPoints={currentPoints}
              pointsToNextLevel={pointsToNextLevel}
              aboutMe={memberData?.aboutMe || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
