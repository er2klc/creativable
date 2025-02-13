
import { useSession } from "@supabase/auth-helpers-react";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { usePipelineManagement } from "./hooks/usePipelineManagement";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function CompactPhaseSelector({ 
  lead,
  onUpdateLead
}: CompactPhaseSelectorProps) {
  const session = useSession();
  const { settings } = useSettings();
  const [phaseAnalysisExists, setPhaseAnalysisExists] = useState<{[key: string]: boolean}>({});
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
    
    // Don't update if the phase hasn't changed
    if (phaseId === lead.phase_id && selectedPipelineId === lead.pipeline_id) {
      return;
    }
    
    updateLeadPipeline.mutate({
      leadId: lead.id,
      pipelineId: selectedPipelineId,
      phaseId: phaseId
    });
  };

  const handleContactTypeChange = (type: string, checked: boolean) => {
    const currentTypes = lead.contact_type?.split(',').map(t => t.trim()).filter(Boolean) || [];
    let newTypes: string[];
    
    if (checked) {
      newTypes = [...new Set([...currentTypes, type])];
    } else {
      newTypes = currentTypes.filter(t => t !== type);
    }
    
    onUpdateLead({ contact_type: newTypes.join(', ') });
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const currentPhase = phases.find(p => p.id === lead.phase_id && selectedPipelineId === lead.pipeline_id);
  const currentTypes = lead.contact_type?.split(',').map(t => t.trim()) || [];

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center w-full">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        <div className="relative z-10 flex justify-between w-full">
          {phases.map((phase, index) => {
            const isActive = phase.id === lead.phase_id && selectedPipelineId === lead.pipeline_id;
            const isPast = phase.order_index < (currentPhase?.order_index || 0) && selectedPipelineId === lead.pipeline_id;
            const hasAnalysis = phaseAnalysisExists[phase.id];
            
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
                    isPast ? "bg-blue-200" : "bg-white border-2 border-gray-200",
                    hasAnalysis && "ring-2 ring-purple-500"
                  )}
                  title={hasAnalysis ? (settings?.language === "en" ? "Analysis exists" : "Analyse existiert") : ""}
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

      <div className="flex items-center justify-between gap-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Select
            value={selectedPipelineId}
            onValueChange={handlePipelineChange}
          >
            <SelectTrigger className="h-8 border-none p-0 text-sm hover:text-blue-600 transition-colors">
              <SelectValue>
                <span className="flex items-center gap-1 text-gray-400">
                  Pipeline: {currentPipeline?.name}
                </span>
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

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={currentTypes.includes('Likely Partner')}
              onCheckedChange={(checked) => handleContactTypeChange('Likely Partner', checked as boolean)}
              className="h-4 w-4"
            />
            <span className="text-xs text-gray-400">Likely Partner</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={currentTypes.includes('Likely Kunde')}
              onCheckedChange={(checked) => handleContactTypeChange('Likely Kunde', checked as boolean)}
              className="h-4 w-4"
            />
            <span className="text-xs text-gray-400">Likely Kunde</span>
          </label>
        </div>
      </div>
    </div>
  );
}
