import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

export const DashboardMetrics = () => {
  const session = useSession();
  const { settings } = useSettings();

  // Get all pipelines
  const { data: pipelines } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) {
        console.error("Error fetching pipelines:", error);
        return [];
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Get phases and lead counts for each pipeline
  const { data: pipelineStats } = useQuery({
    queryKey: ["pipeline-stats"],
    queryFn: async () => {
      if (!session?.user?.id || !pipelines) return [];

      const stats = await Promise.all(
        pipelines.map(async (pipeline) => {
          // Get phases for this pipeline
          const { data: phases } = await supabase
            .from("pipeline_phases")
            .select("*")
            .eq("pipeline_id", pipeline.id)
            .order("order_index");

          // Get leads for this pipeline
          const { data: leads } = await supabase
            .from("leads")
            .select(`
              phase_id,
              pipeline_phases (
                name
              )
            `)
            .eq("pipeline_id", pipeline.id)
            .eq("user_id", session.user.id);

          // Calculate percentages
          const total = leads?.length || 0;
          const phaseStats = {};
          
          leads?.forEach(lead => {
            const phaseName = lead.pipeline_phases?.name;
            if (phaseName) {
              phaseStats[phaseName] = (phaseStats[phaseName] || 0) + 1;
            }
          });

          // Convert to percentages
          const phasePercentages = {};
          Object.keys(phaseStats).forEach(phase => {
            phasePercentages[phase] = total > 0 
              ? Math.round((phaseStats[phase] / total) * 100) 
              : 0;
          });

          return {
            pipeline,
            phases,
            stats: phasePercentages
          };
        })
      );

      return stats;
    },
    enabled: !!session?.user?.id && !!pipelines,
  });

  if (!pipelineStats?.length) {
    return (
      <div className="text-center p-4">
        {settings?.language === "en" 
          ? "No pipelines found. Create your first pipeline in the Leads section." 
          : "Keine Pipelines gefunden. Erstellen Sie Ihre erste Pipeline im Leads-Bereich."}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pipelineStats.map(({ pipeline, phases, stats }) => (
          <Card key={pipeline.id}>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                {pipeline.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {phases?.map(phase => (
                <div key={phase.id}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>{phase.name}</span>
                    <span>{stats[phase.name] || 0}%</span>
                  </div>
                  <Progress value={stats[phase.name] || 0} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};