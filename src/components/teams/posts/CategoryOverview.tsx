import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface CategoryOverviewProps {
  teamId: string;
}

export function CategoryOverview({ teamId }: CategoryOverviewProps) {
  const navigate = useNavigate();
  
  const { data: categories = [] } = useQuery({
    queryKey: ["team-categories-with-posts", teamId],
    queryFn: async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("team_categories")
        .select(`
          *,
          posts:team_posts(
            *,
            creator:created_by(display_name),
            comments:team_post_comments(count)
          )
        `)
        .eq("team_id", teamId)
        .order("order_index");

      if (categoriesError) throw categoriesError;
      return categoriesData;
    },
  });

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const topPosts = category.posts
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);

        return (
          <Card key={category.id} className="group">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{category.name}</CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`category/${category.id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {topPosts.length > 0 ? (
                <div className="space-y-4">
                  {topPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`category/${category.id}`)}
                    >
                      <div>
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: de,
                          })}{" "}
                          von {post.creator?.display_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">{post.comments?.[0]?.count || 0}</span>
                      </div>
                    </div>
                  ))}
                  {category.posts.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => navigate(`category/${category.id}`)}
                    >
                      Alle {category.posts.length} Beiträge anzeigen
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Noch keine Beiträge in dieser Kategorie
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}