import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Activity, MessageSquare, Award, Calendar, TrendingUp, ChevronLeft, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/dashboard/SearchBar";

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
          last_seen
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

      const { data: activity } = await supabase
        .from('member_activities')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      return {
        ...profile,
        points: points?.points || 0,
        level: points?.level || 1,
        activity: activity || null
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

      <div className="container py-8 mt-16 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/unity/team/${teamSlug}/members`)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück zur Übersicht
        </Button>

        <Card>
          <CardHeader className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 z-0" />
            <div className="relative z-10 p-6 flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={memberData.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {memberData.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{memberData.display_name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium">
                      Level {memberData.level}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-medium",
                        memberData.status === 'online' ? "border-green-500 text-green-500" : "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {memberData.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                {memberData.bio && (
                  <p className="mt-2 text-muted-foreground">{memberData.bio}</p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{memberData.activity?.posts_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Beiträge</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{memberData.activity?.comments_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Kommentare</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{memberData.points}</div>
                      <div className="text-sm text-muted-foreground">Punkte</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberProfile;
