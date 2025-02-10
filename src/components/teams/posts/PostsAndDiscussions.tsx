
import { Card } from "@/components/ui/card";
import { CategoryOverview } from "./CategoryOverview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { TabScrollArea } from "./components/TabScrollArea";
import { TeamHeader } from "./components/TeamHeader";
import { Team } from "./types/team";

export function PostsAndDiscussions() {
  const navigate = useNavigate();
  const { teamSlug, categorySlug } = useParams();
  const user = useUser();
  const [activeTab, setActiveTab] = useState(categorySlug || 'all');

  // Get team data based on slug
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

      if (error) {
        console.error('Error fetching team:', error);
        throw error;
      }
      return data as Team;
    },
    enabled: !!teamSlug,
  });

  const { data: allCategories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id,
  });

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

  if (!teamSlug) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Invalid team URL. Please check the URL and try again.
        </div>
      </Card>
    );
  }

  if (isTeamLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Team not found
        </div>
      </Card>
    );
  }

  return (
    <>
      <TeamHeader 
        teamName={team.name}
        teamSlug={team.slug}
        userEmail={user?.email}
      />

      <div className="pt-16">
        <div className="space-y-6 max-w-[1200px] mx-auto px-4 pt-4">
          <TabScrollArea
            activeTab={activeTab}
            allCategories={allCategories}
            onCategoryClick={handleCategoryClick}
          />

          <div className="w-full overflow-hidden">
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-4 -mr-4">
              <CategoryOverview teamId={team.id} teamSlug={teamSlug} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
