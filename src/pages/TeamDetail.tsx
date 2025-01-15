import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamTabs } from "@/components/teams/TeamTabs";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TeamSnaps } from "@/components/teams/detail/TeamSnaps";
import { TeamCalendarView } from "@/components/teams/calendar/TeamCalendarView";
import { cn } from "@/lib/utils";

const TeamDetail = () => {
  const { teamSlug } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const [activeSnapView, setActiveSnapView] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("slug", teamSlug)
        .single();

      if (error) {
        toast.error("Fehler beim Laden des Teams");
        navigate("/dashboard");
        throw error;
      }

      return data;
    },
  });

  const { data: memberRole } = useQuery({
    queryKey: ['team-member-role', team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching member role:', error);
        return null;
      }

      return data?.role;
    },
    enabled: !!user?.id && !!team?.id,
  });

  const isAdmin = memberRole === 'admin' || memberRole === 'owner' || team?.created_by === user?.id;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  const handleCalendarClick = () => {
    setShowCalendar(true);
    setActiveSnapView('calendar');
  };

  const handleSnapClick = (snapId: string) => {
    setActiveSnapView(snapId);
  };

  const handleBack = () => {
    setActiveSnapView(null);
    setShowCalendar(false);
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        "bg-background border-b transition-all duration-300 ease-in-out transform",
        activeSnapView ? "opacity-0 -translate-y-full h-0 overflow-hidden" : "opacity-100 translate-y-0 h-auto"
      )}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <TeamHeader team={team} isInSnapView={!!activeSnapView} />
          </div>
          <TeamTabs defaultValue="posts" isAdmin={isAdmin}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Team Snaps</h2>
            </div>
          </TeamTabs>
        </div>
      </div>

      {!showCalendar && (
        <TeamSnaps 
          teamId={team.id}
          isAdmin={isAdmin}
          isManaging={false}
          onCalendarClick={handleCalendarClick}
          onSnapClick={handleSnapClick}
          onBack={handleBack}
          activeSnapView={activeSnapView}
        />
      )}

      {showCalendar && (
        <TeamCalendarView 
          teamId={team.id}
          isAdmin={isAdmin}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default TeamDetail;
