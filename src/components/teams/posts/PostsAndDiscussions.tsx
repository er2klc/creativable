
import { Card } from "@/components/ui/card";
import { CategoryOverview } from "./CategoryOverview";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { PostCategoriesScroll } from "./components/categories/PostCategoriesScroll";
import { TeamHeader } from "./components/TeamHeader";
import { Team } from "./types/team";
import { PostDetail } from "./components/PostDetail";
import { LoadingState } from "./LoadingState";
import { WelcomeDialog } from "./dialog/WelcomeDialog";
import { toast } from "sonner";
import { TeamPresenceProvider } from "@/components/teams/context/TeamPresenceContext";

export function PostsAndDiscussions() {
  const navigate = useNavigate();
  const { teamSlug, categorySlug, postSlug } = useParams();
  const user = useUser();
  const [activeTab, setActiveTab] = useState(categorySlug || 'all');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) {
        console.error('No team slug provided');
        return null;
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamSlug,
    staleTime: 0,
    cacheTime: 0
  });

  const { data: currentPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['team-post', teamSlug, postSlug],
    queryFn: async () => {
      if (!postSlug || !team?.id) return null;

      const { data, error } = await supabase
        .from('team_posts')
        .select(`
          *,
          author:profiles!team_posts_created_by_fkey (
            id,
            display_name,
            avatar_url,
            email
          ),
          team_categories (
            id,
            name,
            slug,
            color
          ),
          team_post_comments (
            id,
            content,
            created_at,
            author:profiles!team_post_comments_created_by_fkey (
              id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('slug', postSlug)
        .eq('team_id', team.id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }

      return data;
    },
    enabled: !!postSlug && !!team?.id,
  });

  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', team?.id],
    queryFn: async () => {
      if (!team?.id || !user?.id) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('role, team_member_points!inner(level)')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id && !!user?.id,
  });

  const { data: introCategory } = useQuery({
    queryKey: ['intro-category', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;

      const { data, error } = await supabase
        .from('team_categories')
        .select('id')
        .eq('team_id', team.id)
        .eq('name', 'Vorstellung')
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!team?.id,
  });

  useEffect(() => {
    if (teamMember?.team_member_points?.level === 0 && introCategory) {
      setShowWelcomeDialog(true);
    }
  }, [teamMember, introCategory]);

  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';
  const canPost = isAdmin || (teamMember?.team_member_points?.level || 0) > 0;

  const handleWelcomeSubmit = async (data: { name: string; introduction: string }) => {
    if (!user?.id || !team?.id || !introCategory) return;

    try {
      const { error } = await supabase
        .from('team_posts')
        .insert({
          team_id: team.id,
          category_id: introCategory.id,
          title: `Vorstellung: ${data.name}`,
          content: data.introduction,
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Vorstellung erfolgreich gepostet!");
      setShowWelcomeDialog(false);
    } catch (error) {
      console.error('Error creating introduction post:', error);
      toast.error("Fehler beim Erstellen der Vorstellung");
    }
  };

  const handleCategoryClick = (categorySlug?: string) => {
    if (!teamSlug) {
      console.error('No team slug available for navigation');
      return;
    }

    setActiveTab(categorySlug || 'all');
    
    if (categorySlug) {
      navigate(`/unity/team/${teamSlug}/posts/category/${categorySlug}`);
    } else {
      navigate(`/unity/team/${teamSlug}/posts`);
    }
  };

  useEffect(() => {
    if (categorySlug) {
      setActiveTab(categorySlug);
    } else {
      setActiveTab('all');
    }
  }, [categorySlug]);

  if (isTeamLoading) {
    return <LoadingState />;
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  if (postSlug && isPostLoading) {
    return <LoadingState />;
  }

  return (
    <TeamPresenceProvider teamId={team.id}>
      <div>
        <TeamHeader 
          teamName={team.name}
          teamSlug={team.slug}
          logoUrl={team.logo_url}
          userEmail={user?.email}
        />
        
        <WelcomeDialog 
          isOpen={showWelcomeDialog}
          onClose={() => setShowWelcomeDialog(false)}
          onSubmit={handleWelcomeSubmit}
          categoryId={introCategory?.id || ''}
        />

        <div className="pt-8">
          <div className="space-y-6 max-w-[1200px] mx-auto px-4 pt-4">
            {!postSlug && (
              <div className="flex items-center gap-4">
                <PostCategoriesScroll
                  activeTab={activeTab}
                  onCategoryClick={handleCategoryClick}
                  isAdmin={isAdmin}
                  teamSlug={teamSlug}
                />
              </div>
            )}

            <div className="w-full overflow-hidden">
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-4 -mr-4">
                {postSlug ? (
                  <PostDetail post={currentPost} teamSlug={teamSlug} />
                ) : (
                  <CategoryOverview 
                    teamId={team.id} 
                    teamSlug={teamSlug} 
                    categorySlug={categorySlug}
                    canPost={canPost} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeamPresenceProvider>
  );
}
