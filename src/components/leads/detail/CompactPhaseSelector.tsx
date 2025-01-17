import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function CompactPhaseSelector({ 
  lead, 
  onUpdateLead,
}: CompactPhaseSelectorProps) {
  const session = useSession();
  
  // Get all pipelines
  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Get phases for the selected pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", lead.pipeline_id],
    queryFn: async () => {
      if (!lead.pipeline_id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", lead.pipeline_id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!lead.pipeline_id,
  });

  const handlePipelineChange = (pipelineId: string) => {
    // Only update if the pipeline actually changed
    if (pipelineId !== lead.pipeline_id) {
      // Get first phase of new pipeline
      const firstPhase = phases[0]?.id;
      if (firstPhase) {
        onUpdateLead({ 
          pipeline_id: pipelineId,
          phase_id: firstPhase 
        });
      }
    }
  };

  const handlePhaseChange = (phaseId: string) => {
    // Only update if the phase actually changed
    if (phaseId !== lead.phase_id) {
      onUpdateLead({ phase_id: phaseId });
    }
  };

  return (
    <div className="w-full px-4 py-2 space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={lead.pipeline_id}
          onValueChange={handlePipelineChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pipeline wählen" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            onClick={() => handlePhaseChange(phase.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all relative",
              "hover:scale-105 transform duration-200 ease-in-out",
              "after:content-[''] after:absolute after:top-1/2 after:-right-4 after:w-2 after:h-2 after:border-t-2 after:border-r-2 after:border-gray-300 after:transform after:-translate-y-1/2 after:rotate-45",
              lead.phase_id === phase.id
                ? "bg-[#D3E4FD] text-blue-800 shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100",
              index === phases.length - 1 && "after:hidden"
            )}
          >
            {phase.name}
          </div>
        ))}
      </div>
    </div>
  );
}