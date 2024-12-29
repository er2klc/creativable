import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-['Orbitron'] text-primary">
            {team.name}
          </h1>
        </div>
        <button
          onClick={() => navigate('/unity')}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Zurück zur Übersicht
        </button>
      </div>

      <div className="space-y-6">
        {/* Team management content will be implemented in the next iteration */}
        <Card>
          <CardContent className="p-6">
            <p>Team Management Funktionen werden hier implementiert...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamDetail;