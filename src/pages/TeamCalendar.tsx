
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { TeamCalendarView } from "@/components/teams/calendar/TeamCalendarView";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { ICalButton } from "@/components/calendar/ICalButton";

const TeamCalendar = () => {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) return null;

      const { data: userTeams, error: userTeamsError } = await supabase.rpc("get_user_teams", { uid: user.id });

      if (userTeamsError) {
        console.error("Error fetching user teams:", userTeamsError);
        return null;
      }

      const team = userTeams?.find((t) => t.slug === teamSlug);
      return team || null;
    },
    enabled: !!teamSlug && !!user?.id,
  });

  const { data: teamMember } = useQuery({
    queryKey: ["team-member", team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !!team?.id,
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  if (isTeamLoading || !team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="w-full">
          <div className="h-16 px-4 flex items-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => navigate(`/unity/team/${team.slug}`)}
                  >
                    {team.name}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-foreground">Kalender</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[300px]">
                  <SearchBar />
                </div>
                <ICalButton />
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-20">
        <TeamCalendarView
          teamId={team.id}
          teamName={team.name}
          isAdmin={isAdmin}
          onBack={() => window.history.back()}
        />
      </div>
    </div>
  );
};

export default TeamCalendar;

