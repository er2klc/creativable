import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryList } from "@/components/teams/posts/CategoryList";
import { PostList } from "@/components/teams/posts/PostList";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryOverview } from "@/components/teams/posts/CategoryOverview";
import { MessageSquare, Sparkles } from "lucide-react";

const TeamDiscussions = () => {
  const { teamId } = useParams();

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select(`
          *,
          team_posts (
            id,
            title,
            content,
            created_at,
            created_by,
            team_categories (name),
            team_post_comments (count)
          )
        `)
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Diskussionen & Beiträge</h1>
        </div>
        <div className="flex items-center gap-2">
          <CategoryList teamId={teamId || ''} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex items-center gap-2"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CategoryOverview categories={categories || []} />
        </TabsContent>

        {categories?.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <PostList teamId={teamId || ''} categoryId={category.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TeamDiscussions;