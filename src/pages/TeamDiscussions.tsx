import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryList } from "@/components/teams/posts/CategoryList";
import { PostsAndDiscussions } from "@/components/teams/posts/PostsAndDiscussions";
import { Card } from "@/components/ui/card";

const TeamDiscussions = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["team-categories", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from("team_categories")
        .select(`
          *,
          team_posts (
            id,
            title,
            created_at,
            created_by,
            team_post_comments (count)
          )
        `)
        .eq("team_id", teamId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !teamId) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>Ein Fehler ist aufgetreten</p>
      </Card>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Diskussionen & Beiträge</h1>
        <p className="text-muted-foreground">
          Teilen Sie Ideen und Diskussionen mit Ihrem Team
        </p>
      </div>

      <CategoryList teamId={teamId} />

      {categories?.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>Noch keine Kategorien erstellt</p>
          <p className="text-sm mt-1">
            Erstellen Sie eine neue Kategorie, um Diskussionen zu starten
          </p>
        </Card>
      ) : (
        <PostsAndDiscussions categories={categories || []} teamId={teamId} />
      )}
    </div>
  );
};

export default TeamDiscussions;