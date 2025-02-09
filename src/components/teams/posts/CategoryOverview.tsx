
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryOverviewProps {
  teamId: string;
}

export function CategoryOverview({ teamId }: CategoryOverviewProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["team-categories-with-posts", teamId],
    queryFn: async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
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

      if (categoriesError) throw categoriesError;

      // Fetch display names for post creators in a separate query
      const postsWithCreators = await Promise.all(
        categoriesData.map(async (category) => {
          const postsWithCreatorInfo = await Promise.all(
            (category.team_posts || []).map(async (post) => {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("id", post.created_by)
                .single();
              
              return {
                ...post,
                creator_name: profileData?.display_name
              };
            })
          );

          return {
            ...category,
            team_posts: postsWithCreatorInfo
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3) // Only take the latest 3 posts
          };
        })
      );
      
      return postsWithCreators;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="group hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`category/${category.slug}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
          </CardHeader>
          <CardContent>
            {category.team_posts?.length > 0 ? (
              <div className="space-y-3">
                {category.team_posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <h4 className="font-medium line-clamp-1">{post.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: de,
                          })}{" "}
                          von {post.creator_name || "Unbekannt"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span>{post.team_post_comments?.[0]?.count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-3">
                Noch keine Beiträge in dieser Kategorie
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
