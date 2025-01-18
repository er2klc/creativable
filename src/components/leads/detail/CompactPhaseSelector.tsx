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
    if (pipelineId !== lead.pipeline_id) {
      const firstPhase = phases[0]?.id;
      if (firstPhase) {
        onUpdateLead({ 
          pipeline_id: pipelineId,
          phase_id: firstPhase,
          last_action: "Pipeline geändert",
          last_action_date: new Date().toISOString()
        });
      }
    }
  };

  const handlePhaseChange = async (phaseId: string) => {
    if (phaseId !== lead.phase_id) {
      const oldPhase = phases.find(p => p.id === lead.phase_id)?.name;
      const newPhase = phases.find(p => p.id === phaseId)?.name;
      
      // First create the note to track the phase change
      if (oldPhase && newPhase) {
        await supabase.from("notes").insert({
          lead_id: lead.id,
          user_id: session?.user?.id,
          content: `Phase von "${oldPhase}" zu "${newPhase}" geändert`,
          color: "#E9D5FF", // Light purple color for phase changes
          metadata: {
            type: "phase_change",
            oldPhase,
            newPhase
          }
        });
      }

      // Then update the lead
      onUpdateLead({ 
        phase_id: phaseId,
        last_action: `Phase von "${oldPhase}" zu "${newPhase}" geändert`,
        last_action_date: new Date().toISOString()
      });
    }
  };

  return (
    <div className="w-full space-y-4">
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

      <div className="relative flex items-center gap-2 pt-2">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2 z-0" />
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => handlePhaseChange(phase.id)}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-all relative z-10",
              "hover:scale-105 transform duration-200 ease-in-out",
              lead.phase_id === phase.id
                ? "bg-[#D3E4FD] text-blue-800"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            {phase.name}
          </button>
        ))}
      </div>
    </div>
  );
}