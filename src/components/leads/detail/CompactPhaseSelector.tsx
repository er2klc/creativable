import { useSession } from "@supabase/auth-helpers-react";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { usePipelineManagement } from "./hooks/usePipelineManagement";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function CompactPhaseSelector({ 
  lead,
}: CompactPhaseSelectorProps) {
  const session = useSession();
  const {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
    updateLeadPipeline
  } = usePipelineManagement(lead.pipeline_id);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
  };

  const handlePhaseChange = async (phaseId: string) => {
    if (!session?.user?.id || !selectedPipelineId) return;
    
    if (phaseId === lead.phase_id && selectedPipelineId === lead.pipeline_id) {
      return;
    }
    
    updateLeadPipeline.mutate({
      leadId: lead.id,
      pipelineId: selectedPipelineId,
      phaseId: phaseId
    });
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const currentPhase = phases.find(p => p.id === lead.phase_id && selectedPipelineId === lead.pipeline_id);

  return (
    <div className="w-full space-y-3">
      <div className="relative flex items-center w-full pl-2">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2" />
        <div className="relative z-10 flex justify-between w-full style={{ gap: '-15px' }}">
          {phases.map((phase, index) => {
            const isActive = phase.id === lead.phase_id && selectedPipelineId === lead.pipeline_id;
            const isPast = phase.order_index < (currentPhase?.order_index || 0) && selectedPipelineId === lead.pipeline_id;
            const isLast = index === phases.length - 1;
            
            return (
              <div 
                key={phase.id}
                className="flex flex-col items-center"
                style={{ 
                  width: `${100 / phases.length}%`,
                  left: '-16px',
                  position: 'relative'
                }}
              >
                <button
                  onClick={() => handlePhaseChange(phase.id)}
                  className={cn(
                    "w-full h-7 relative flex items-center justify-center transition-all",
                    "hover:brightness-105 transform duration-200 ease-in-out",
                    index === 0 ? "clip-chevron-first" : isLast ? "clip-chevron-last" : "clip-chevron",
                    "shadow-sm",
                    isActive ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" :
                    isPast ? "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800" : 
                    "bg-gray-200 text-gray-700 border border-gray-400"
                  )}
                >
                  <span className="text-xs font-medium px-2 truncate">
                    {phase.name}
                  </span>
                </button>
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
