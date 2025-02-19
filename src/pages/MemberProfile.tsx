
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Activity, MessageSquare, Award, Calendar, Clock, MapPin, Brain, ChevronLeft, Users, Link, Instagram, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const ActivityCalendar = ({ activities }) => {
  // Simplified calendar component
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-sm",
              activities?.[i] ? "bg-green-200" : "bg-gray-100"
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100" />
          <div className="w-4 h-4 rounded-sm bg-green-100" />
          <div className="w-4 h-4 rounded-sm bg-green-200" />
          <div className="w-4 h-4 rounded-sm bg-green-300" />
          <div className="w-4 h-4 rounded-sm bg-green-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

const MemberProfile = () => {
  const { teamSlug, memberSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const { data: teamData } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('slug', teamSlug)
        .single();
      return data;
    },
    enabled: !!teamSlug
  });

  const { data: memberData, isLoading } = useQuery({
    queryKey: ['member-profile', teamSlug, memberSlug],
    queryFn: async () => {
      if (!teamData) throw new Error('Team not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          avatar_url,
          bio,
          status,
          last_seen,
          personality_type,
          location,
          created_at,
          social_links
        `)
        .eq('slug', memberSlug)
        .single();

      if (!profile) throw new Error('Member not found');

      const { data: points } = await supabase
        .from('team_member_points')
        .select('points, level')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .single();

      const { data: stats } = await supabase
        .from('team_member_stats')
        .select('posts_count, followers_count, following_count')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .single();

      const { data: activity } = await supabase
        .from('team_member_activity')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return {
        ...profile,
        points: points?.points || 0,
        level: points?.level || 1,
        stats: stats || { posts_count: 0, followers_count: 0, following_count: 0 },
        activity: activity || []
      };
    }
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

  // Calculate points needed for next level
  const pointsToNextLevel = (memberData.level * 100) - memberData.points;

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => navigate(`/unity/team/${teamSlug}`)}
                >
                  {teamData.logo_url ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={teamData.logo_url} alt={teamData.name} />
                      <AvatarFallback>{teamData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <span>{teamData.name}</span>
                </div>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-foreground">Member Details</span>
                </div>
              </div>
            </div>
            <div className="w-[300px]">
              <SearchBar />
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
      </div>

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
          {/* Main Content - Left Column */}
          <div className="md:col-span-2 space-y-6">
            <ActivityCalendar activities={memberData.activity} />
            
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold">Memberships</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teamData.logo_url} alt={teamData.name} />
                    <AvatarFallback>{teamData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{teamData.name}</h4>
                    <p className="text-sm text-muted-foreground">Private • {memberData.stats.followers_count} Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed would go here */}
          </div>

          {/* Profile Info - Right Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={memberData.avatar_url} />
                    <AvatarFallback>{memberData.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <h1 className="text-2xl font-bold mb-1">{memberData.display_name}</h1>
                  <p className="text-muted-foreground mb-4">@{memberSlug}</p>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {memberData.level}</span>
                      <span>{pointsToNextLevel} points to next level</span>
                    </div>
                    <Progress value={memberData.points % 100} className="h-2" />
                  </div>

                  <div className="text-left space-y-3 mb-6">
                    {memberData.bio && (
                      <p className="text-sm">{memberData.bio}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Active {formatDistanceToNow(new Date(memberData.last_seen), { addSuffix: true, locale: de })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(memberData.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
                    </div>

                    {memberData.personality_type && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Brain className="h-4 w-4" />
                        <span>{memberData.personality_type}</span>
                      </div>
                    )}

                    {memberData.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{memberData.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{memberData.stats.posts_count}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{memberData.stats.followers_count}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{memberData.stats.following_count}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>

                  <Button className="w-full mt-4">Edit Profile</Button>

                  {memberData.social_links && (
                    <div className="flex justify-center gap-4 mt-4">
                      {memberData.social_links.website && (
                        <Link className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                      {memberData.social_links.instagram && (
                        <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                      {memberData.social_links.linkedin && (
                        <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
