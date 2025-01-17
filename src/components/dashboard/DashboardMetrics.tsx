import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DashboardMetrics = () => {
  const session = useSession();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { pipelineId } = useParams();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(pipelineId || null);

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

  // Set default pipeline when pipelines are loaded
  useEffect(() => {
    if (pipelines && pipelines.length > 0 && !selectedPipelineId) {
      const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
      
      // Try to find the last used pipeline first
      if (lastUsedPipelineId) {
        const lastPipeline = pipelines.find(p => p.id === lastUsedPipelineId);
        if (lastPipeline) {
          setSelectedPipelineId(lastPipeline.id);
          return;
        }
      }
      
      // Otherwise, try to find the Standard Pipeline or use the first one
      const defaultPipeline = pipelines.find(p => p.name === "Standard Pipeline") || pipelines[0];
      setSelectedPipelineId(defaultPipeline.id);
    }
  }, [pipelines, selectedPipelineId]);

  // Then get the completion phase for selected pipeline
  const { data: completionPhase } = useQuery({
    queryKey: ["completion-phase", selectedPipelineId],
    queryFn: async () => {
      if (!selectedPipelineId) return null;

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", selectedPipelineId)
        .eq("name", "Abschluss")
        .maybeSingle();

      if (error) {
        console.error("Error fetching completion phase:", error);
        return null;
      }

      return data;
    },
    enabled: !!selectedPipelineId,
  });

  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics", completionPhase?.id, selectedPipelineId],
    queryFn: async () => {
      if (!session?.user?.id || !selectedPipelineId) return null;

      const [leadsResult, tasksResult, completedLeadsResult] = await Promise.all([
        supabase
          .from("leads")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("pipeline_id", selectedPipelineId),
        supabase
          .from("tasks")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("completed", false),
        supabase
          .from("leads")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("pipeline_id", selectedPipelineId)
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
    enabled: !!session?.user?.id && !!completionPhase?.id && !!selectedPipelineId,
  });

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    localStorage.setItem('lastUsedPipelineId', pipelineId);
  };

  return (
    <div className="space-y-6 w-full mb-8">
      <div className="flex items-center gap-4">
        <Select
          value={selectedPipelineId || ""}
          onValueChange={handlePipelineChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pipeline auswählen" />
          </SelectTrigger>
          <SelectContent>
            {pipelines?.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-6">
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
    </div>
  );
};
