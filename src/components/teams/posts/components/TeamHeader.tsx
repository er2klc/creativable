
import { MessageSquare } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useNavigate } from "react-router-dom";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { CreatePostDialog } from "../CreatePostDialog";
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/supabase-utils";

interface TeamHeaderProps {
  teamName: string;
  teamSlug: string;
  userEmail?: string;
}

export const TeamHeader = ({ teamName, teamSlug, userEmail }: TeamHeaderProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const [{ data: team, isLoading: isTeamLoading }, { data: teamMember, isLoading: isTeamMemberLoading }] = useQueries({
    queries: [
      {
        queryKey: ['team', teamSlug],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('teams')
            .select('id, logo_url')
            .eq('slug', teamSlug)
            .maybeSingle();

          if (error) throw error;
          return data;
        },
        enabled: !!teamSlug,
      },
      {
        queryKey: ['team-member-role', teamSlug],
        queryFn: async () => {
          if (!user?.id || !teamSlug) return null;

          const { data: team } = await supabase
            .from('teams')
            .select('id')
            .eq('slug', teamSlug)
            .maybeSingle();

          if (!team?.id) return null;

          const { data, error } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', team.id)
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          return data;
        },
        enabled: !!teamSlug && !!user?.id,
      }
    ]
  });

  const isLoading = isTeamLoading || isTeamMemberLoading;
  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate(`/unity/team/${teamSlug}`)}>
                  {team?.logo_url ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAvatarUrl(team.logo_url)} alt={teamName} />
                      <AvatarFallback>{teamName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{teamName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <span>{teamName}</span>
                </div>
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
              {!isLoading && isAdmin && <EditCategoryDialog teamSlug={teamSlug} />}
              {!isLoading && team?.id && <CreatePostDialog teamId={team.id} />}
            </div>
            <HeaderActions profile={null} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};
