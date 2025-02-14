
import { MessageSquare, Plus } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useNavigate } from "react-router-dom";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { CreatePostDialog } from "../CreatePostDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

interface TeamHeaderProps {
  teamName: string;
  teamSlug: string;
  userEmail?: string;
}

export const TeamHeader = ({ teamName, teamSlug, userEmail }: TeamHeaderProps) => {
  const navigate = useNavigate();
  const user = useUser();

  // First fetch team by slug to get the correct UUID
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  // Then fetch member role using the team's UUID
  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', team?.id],
    queryFn: async () => {
      if (!team?.id || !user?.id) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id && !!user?.id,
  });

  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span 
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => navigate(`/unity/team/${teamSlug}`)}
                >
                  {teamName}
                </span>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-foreground">Community</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchBar />
              </div>
              {isAdmin && <EditCategoryDialog teamSlug={teamSlug} />}
              {team?.id && <CreatePostDialog teamId={team.id} />}
            </div>
            <HeaderActions profile={null} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};
