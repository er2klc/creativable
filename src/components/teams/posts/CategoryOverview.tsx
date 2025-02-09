
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryOverviewProps {
  teamId: string;
}

export function CategoryOverview({ teamId }: CategoryOverviewProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["team-posts-overview", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_posts")
        .select(`
          *,
          team_categories (
            name,
            slug
          ),
          author:profiles!team_posts_created_by_fkey (
            display_name
          ),
          team_post_comments (
            id
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Keine Beiträge gefunden
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold line-clamp-1">
                {post.title}
              </h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {post.team_categories.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  von {post.author.display_name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{post.team_post_comments.length}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
