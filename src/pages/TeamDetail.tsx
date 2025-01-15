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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          <TeamTabs team={team} />
        </div>
      </div>

      <TeamSnaps teamSlug={teamSlug} activeSnapView={activeSnapView} setActiveSnapView={setActiveSnapView} />
      <TeamCalendarView teamSlug={teamSlug} />
    </div>
  );
};

export default TeamDetail;
