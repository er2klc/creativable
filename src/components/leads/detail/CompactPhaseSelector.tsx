import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  phases: Tables<"lead_phases">[];
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onUpdatePhases?: (phases: Tables<"lead_phases">[]) => void;
}

export function CompactPhaseSelector({ 
  lead, 
  phases,
  onUpdateLead 
}: CompactPhaseSelectorProps) {
  const { settings } = useSettings();
  const isMobile = useIsMobile();
  
  const currentPhaseIndex = phases.findIndex(p => p.name === lead.phase);
  
  const handlePhaseChange = (newPhase: string) => {
    onUpdateLead({ phase: newPhase });
  };

  const movePhase = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentPhaseIndex - 1)
      : Math.min(phases.length - 1, currentPhaseIndex + 1);
    
    if (newIndex !== currentPhaseIndex) {
      handlePhaseChange(phases[newIndex].name);
    }
  };

  return (
    <div className="w-full p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3 text-gray-700">
        {settings?.language === "en" ? "Contact Phase" : "Kontaktphase"}
      </h3>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => movePhase('prev')}
          disabled={currentPhaseIndex <= 0}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={() => handlePhaseChange(phase.name)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all whitespace-nowrap",
                lead.phase === phase.name
                  ? "bg-[#D3E4FD] text-blue-800 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {phase.name}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => movePhase('next')}
          disabled={currentPhaseIndex >= phases.length - 1}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}