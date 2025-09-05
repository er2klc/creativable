import { Card, CardContent } from "@/components/ui/card";
import { CategoryOverview } from "./CategoryOverview";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { NewUserWelcome } from "./components/NewUserWelcome";
import { Post } from "./types/post";

export function PostsAndDiscussions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamSlug, categorySlug, postSlug } = useParams();
  const user = useUser();
  const [activeTab, setActiveTab] = useState(categorySlug || 'all');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch team data
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamSlug
  });

  // Fetch team member data independently
  const { data: teamMember, isLoading: isTeamMemberLoading } = useQuery({
    queryKey: ['team-member-level', teamSlug, user?.id],
    queryFn: async () => {
      if (!teamSlug || !user?.id) return null;

      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!teamData?.id) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('role, team_member_points!inner(level)')
        .eq('team_id', teamData.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug && !!user?.id
  });

  // Fetch current post if postSlug is present
  const { data: currentPost, isLoading: isPostLoading } = useQuery<Post>({
    queryKey: ['post', postSlug],
    queryFn: async () => {
      if (!postSlug || !teamSlug) throw new Error('Post slug or team slug missing');

      const { data, error } = await supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (
            name,
            slug,
            color
          ),
          author:profiles!team_posts_created_by_fkey (
            display_name,
            avatar_url,
            email
          ),
          team_post_comments (
            id
          )
        `)
        .eq('slug', postSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!postSlug && !!teamSlug
  });

  // Fetch intro category independently
  const { data: introCategory } = useQuery({
    queryKey: ['intro-category', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;

      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!teamData?.id) return null;

      const { data, error } = await supabase
        .from('team_categories')
        .select('id')
        .eq('team_id', teamData.id)
        .eq('name', 'Vorstellung')
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!teamSlug
  });

  const isLevel0 = teamMember?.team_member_points?.level === 0;
  const canPost = !isLevel0;

  // Show welcome dialog whenever we're on the posts page and user is level 0
  useEffect(() => {
    const isPostsPage = location.pathname.includes('/posts') && !postSlug;
    if (isLevel0 && isPostsPage) {
      setShowWelcomeDialog(true);
    }
  }, [isLevel0, location.pathname, postSlug]);

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
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['team-member-level'] });
      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
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

  if (isTeamLoading || isTeamMemberLoading) {
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

  if (isPostLoading) {
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
          canPost={canPost}
          isLevel0={isLevel0}
          onIntroductionClick={() => setShowWelcomeDialog(true)}
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
                  isAdmin={false}
                  teamSlug={teamSlug}
                />
              </div>
            )}

            <div className="w-full overflow-hidden">
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-4 -mr-4">
                {isLevel0 && !postSlug ? (
                  <NewUserWelcome onIntroductionClick={() => setShowWelcomeDialog(true)} />
                ) : postSlug ? (
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
