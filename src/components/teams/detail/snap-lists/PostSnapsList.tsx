
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreatePostDialog } from "@/components/teams/posts/CreatePostDialog";
import { useParams } from "react-router-dom";
import { Post } from "@/components/teams/posts/types/post";
import { PostCard } from "@/components/teams/posts/PostCard";

interface PostSnapsListProps {
  teamId: string;
  limit?: number;
  categoryId?: string;
  title?: string;
}

export const PostSnapsList = ({ teamId, limit = 3, categoryId, title = "Neueste Beiträge" }: PostSnapsListProps) => {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [canPost, setCanPost] = useState(true); // Default to true, would normally check user permissions

  const { data: posts, isLoading } = useQuery({
    queryKey: ['team-posts-snap', teamId, categoryId, limit],
    queryFn: async () => {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (
            name,
            slug,
            color,
            settings
          ),
          author:profiles!team_posts_created_by_fkey (
            display_name,
            avatar_url,
            email
          ),
          team_post_comments(count)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(post => ({
        ...post,
        team_post_comments: post.team_post_comments[0]?.count || 0
      }));
    },
    enabled: !!teamId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          <Skeleton className="h-10 w-[120px]" />
        </CardHeader>
        <CardContent className="pt-0">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-full mt-2 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <CreatePostDialog 
          teamId={teamId} 
          categoryId={categoryId}
          canPost={canPost}
          teamSlug={teamSlug || ""}
        />
      </CardHeader>
      <CardContent className="pt-0">
        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <PostCard
                key={post.id}
                post={post}
                teamSlug={teamSlug || teamId}
                size="small"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Keine Beiträge gefunden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
