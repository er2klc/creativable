import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";

export const DashboardMetrics = () => {
  const session = useSession();
  const { settings } = useSettings();

  // First get the default pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching pipeline:", error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the completion phase for that pipeline
  const { data: completionPhase } = useQuery({
    queryKey: ["completion-phase", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return null;

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .eq("name", "Abschluss")
        .single();

      if (error) {
        console.error("Error fetching completion phase:", error);
        return null;
      }

      return data;
    },
    enabled: !!pipeline?.id,
  });

  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics", completionPhase?.id, pipeline?.id],
    queryFn: async () => {
      if (!session?.user?.id || !pipeline?.id) return null;

      const [leadsResult, tasksResult, completedLeadsResult] = await Promise.all([
        supabase
          .from("leads")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("pipeline_id", pipeline.id),
        supabase
          .from("tasks")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("completed", false),
        supabase
          .from("leads")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("pipeline_id", pipeline.id)
          .eq("phase_id", completionPhase?.id),
      ]);

      const totalLeads = leadsResult.data?.length || 0;
      const openTasks = tasksResult.data?.length || 0;
      const completedLeads = completedLeadsResult.data?.length || 0;
      const completionRate = totalLeads > 0 
        ? Math.round((completedLeads / totalLeads) * 100) 
        : 0;

      return {
        totalLeads,
        openTasks,
        completionRate
      };
    },
    enabled: !!session?.user?.id && !!completionPhase?.id && !!pipeline?.id,
  });

  return (
    <div className="grid grid-cols-3 gap-6 w-full mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium truncate">
            {settings?.language === "en" ? "Active Leads" : "Leads in Bearbeitung"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{metrics?.totalLeads || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium truncate">
            {settings?.language === "en" ? "Open Tasks" : "Offene Aufgaben"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{metrics?.openTasks || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium truncate">
            {settings?.language === "en" ? "Completion Rate" : "Abschlussquote"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{metrics?.completionRate || 0}%</p>
        </CardContent>
      </Card>
    </div>
  );
};