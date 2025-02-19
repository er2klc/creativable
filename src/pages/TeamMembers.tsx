
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Grid, Users, Calendar, MessageSquare, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";

const TeamMembers = () => {
  const { teamSlug } = useParams();
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Team not found");

      return data;
    },
    enabled: !!teamSlug
  });

  const { data: memberStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['member-stats', team?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_activities')
        .select(`
          profile_id,
          display_name,
          avatar_url,
          posts_count,
          comments_count,
          reactions_count,
          slug
        `)
        .eq('team_id', team?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!team?.id
  });

  if (isTeamLoading || isStatsLoading) {
    return <div className="p-4">Lädt...</div>;
  }

  if (!team) {
    return <div className="p-4">Team nicht gefunden</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Teammitglieder</h1>
            <p className="text-muted-foreground">
              {memberStats?.length || 0} Mitglieder
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar />
          <HeaderActions />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {memberStats?.map((member) => (
          <Card key={member.profile_id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.display_name}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {member.posts_count}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {member.comments_count}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {member.reactions_count}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aktivitäten</h2>
          <Badge variant="secondary">
            <Grid className="h-4 w-4 mr-1" />
            Letzte 12 Monate
          </Badge>
        </div>
        <div className="grid grid-cols-52 gap-1">
          {/* Activity Grid wird hier implementiert */}
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Beiträge</TabsTrigger>
          <TabsTrigger value="comments">Kommentare</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          {/* Posts List kommt hier */}
        </TabsContent>
        <TabsContent value="comments" className="mt-6">
          {/* Comments List kommt hier */}
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          {/* Activity Timeline kommt hier */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamMembers;
