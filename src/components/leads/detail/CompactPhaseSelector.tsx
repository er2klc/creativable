import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

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
  
  const handlePhaseChange = (newPhase: string) => {
    onUpdateLead({ phase: newPhase });
  };

  // Split phases into two rows
  const midPoint = Math.ceil(phases.length / 2);
  const firstRow = phases.slice(0, midPoint);
  const secondRow = phases.slice(midPoint);

  return (
    <div className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-sm font-medium mb-3 text-center text-gray-700">
        {settings?.language === "en" ? "Contact Phase" : "Kontaktphase"}
      </h3>
      <div className="flex flex-col gap-2 max-w-full overflow-x-hidden">
        {/* First Row */}
        <div className="flex flex-wrap gap-2 justify-center">
          {firstRow.map((phase) => (
            <div
              key={phase.id}
              onClick={() => handlePhaseChange(phase.name)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all",
                "hover:scale-105 transform duration-200 ease-in-out",
                lead.phase === phase.name
                  ? "bg-[#D3E4FD] text-blue-800 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {phase.name}
            </div>
          ))}
        </div>
        
        {/* Second Row */}
        {secondRow.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {secondRow.map((phase) => (
              <div
                key={phase.id}
                onClick={() => handlePhaseChange(phase.name)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all",
                  "hover:scale-105 transform duration-200 ease-in-out",
                  lead.phase === phase.name
                    ? "bg-[#D3E4FD] text-blue-800 shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {phase.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}