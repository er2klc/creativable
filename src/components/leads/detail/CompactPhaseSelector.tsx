import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function CompactPhaseSelector({ 
  lead, 
  onUpdateLead,
}: CompactPhaseSelectorProps) {
  const session = useSession();
  const [selectedPipelineId, setSelectedPipelineId] = useState(lead.pipeline_id);
  
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
    queryKey: ["pipeline-phases", selectedPipelineId],
    queryFn: async () => {
      if (!selectedPipelineId) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", selectedPipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPipelineId,
  });

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
  };

  const handlePhaseChange = async (phaseId: string) => {
    if (session?.user?.id) {
      const oldPhase = phases.find(p => p.id === lead.phase_id);
      const newPhase = phases.find(p => p.id === phaseId);
      const oldPipeline = pipelines.find(p => p.id === lead.pipeline_id);
      const newPipeline = pipelines.find(p => p.id === selectedPipelineId);
      
      if (oldPhase && newPhase && oldPipeline && newPipeline) {
        const oldPhaseName = `${oldPipeline.name} → ${oldPhase.name}`;
        const newPhaseName = `${newPipeline.name} → ${newPhase.name}`;
        
        // First create the phase change note
        const { error: noteError } = await supabase
          .from("notes")
          .insert({
            lead_id: lead.id,
            user_id: session.user.id,
            content: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
            color: "#E9D5FF",
            metadata: {
              type: "phase_change",
              oldPhase: oldPhaseName,
              newPhase: newPhaseName
            }
          });

        if (noteError) {
          console.error("Error creating phase change note:", noteError);
        }

        // Then update the lead with both new pipeline and phase
        onUpdateLead({ 
          pipeline_id: selectedPipelineId,
          phase_id: phaseId,
          last_action: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
          last_action_date: new Date().toISOString()
        });
      }
    }
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const currentPhase = phases.find(p => p.id === lead.phase_id);

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center w-full">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        <div className="relative z-10 flex justify-between w-full">
          {phases.map((phase, index) => {
            const isActive = phase.id === lead.phase_id && selectedPipelineId === lead.pipeline_id;
            const isPast = phase.order_index < (currentPhase?.order_index || 0) && selectedPipelineId === lead.pipeline_id;
            
            return (
              <div 
                key={phase.id}
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => handlePhaseChange(phase.id)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all relative",
                    "hover:scale-110 transform duration-200 ease-in-out mb-2",
                    isActive ? "bg-blue-600 text-white" :
                    isPast ? "bg-blue-200" : "bg-white border-2 border-gray-200"
                  )}
                >
                  {index + 1}
                </button>
                <span className="text-xs font-medium">
                  {phase.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Select
          value={selectedPipelineId}
          onValueChange={handlePipelineChange}
        >
          <SelectTrigger className="h-8 w-[200px] text-sm">
            <SelectValue>
              <div className="flex items-center gap-2">
                {currentPipeline?.name}
                <ChevronDown className="h-4 w-4" />
              </div>
            </SelectValue>
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
    </div>
  );
}