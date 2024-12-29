import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostListProps {
  teamId: string;
}

export function PostList({ teamId }: PostListProps) {
  const { data: posts } = useQuery({
    queryKey: ['team-posts', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (name),
          profiles (email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  {post.team_categories && (
                    <Badge variant="secondary">
                      {post.team_categories.name}
                    </Badge>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Erstellt von {post.profiles?.email} am {new Date(post.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}