
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const TeamPulse = () => {
  const { teamSlug } = useParams();
  const navigate = useNavigate();

  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      return team;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/unity/team/${teamSlug}`)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück zum Team
        </Button>
        <h1 className="text-2xl font-bold">Team Pulse</h1>
      </div>

      {/* Placeholder for future pulse content */}
      <div className="grid gap-6">
        <div className="p-6 rounded-lg border bg-card text-card-foreground">
          <p className="text-muted-foreground">
            Pulse-Funktion wird hier implementiert...
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamPulse;
