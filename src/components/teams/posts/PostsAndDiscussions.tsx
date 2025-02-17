
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostDialog } from "./CreatePostDialog";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { IntroductionDialog } from "./components/IntroductionDialog";
import { useProfile } from "@/hooks/use-profile";

export const PostsAndDiscussions = () => {
  const { teamSlug } = useParams();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const { data: profile } = useProfile();

  const { data: team } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;
      const { data, error } = await supabase
        .from("teams")
        .select("id")
        .eq("slug", teamSlug)
        .single();

      if (error) {
        console.error("Error fetching team:", error);
        return null;
      }
      return data;
    },
    enabled: !!teamSlug,
  });

  const { data: memberPoints } = useQuery({
    queryKey: ["team-member-points", team?.id],
    queryFn: async () => {
      if (!profile?.id || !team?.id) return null;

      const { data, error } = await supabase
        .from("team_member_points")
        .select("*")
        .eq("team_id", team.id)
        .eq("user_id", profile.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!profile?.id && !!team?.id,
  });

  useEffect(() => {
    if (memberPoints?.level === 0) {
      const hasSeenIntro = localStorage.getItem(`intro_shown_${teamSlug}`);
      if (!hasSeenIntro) {
        setShowIntroDialog(true);
      }
    }
  }, [memberPoints, teamSlug]);

  const handleIntroClose = () => {
    setShowIntroDialog(false);
    localStorage.setItem(`intro_shown_${teamSlug}`, "true");
  };

  const handleCreateIntroPost = () => {
    setShowIntroDialog(false);
    setShowCreatePost(true);
    localStorage.setItem(`intro_shown_${teamSlug}`, "true");
  };

  return (
    <div className="space-y-8">
      <CategoryOverview 
        teamId={team?.id} 
        teamSlug={teamSlug || ""}
        onCreatePost={() => setShowCreatePost(true)} 
      />
      
      {team?.id && <PostList teamId={team.id} categoryId={undefined} />}
      
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
      />

      <IntroductionDialog
        isOpen={showIntroDialog}
        onClose={handleIntroClose}
        teamSlug={teamSlug || ""}
        onCreatePost={handleCreateIntroPost}
      />
    </div>
  );
};
