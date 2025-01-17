import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function CompactPhaseSelector({ 
  lead, 
  onUpdateLead,
}: CompactPhaseSelectorProps) {
  const session = useSession();
  
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

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!pipeline?.id,
  });

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
        Phase
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