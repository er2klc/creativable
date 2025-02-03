import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  UserPlus, 
  Users, 
  Network, 
  Presentation, 
  GraduationCap, 
  Scale 
} from "lucide-react";

interface VerticalPhaseTimelineProps {
  currentPhaseId: string;
  pipelineId: string;
}

export const VerticalPhaseTimeline = ({ currentPhaseId, pipelineId }: VerticalPhaseTimelineProps) => {
  const { data: phases } = useQuery({
    queryKey: ["pipeline-phases", pipelineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("order_index");

      if (error) throw error;
      return data as Tables<"pipeline_phases">[];
    },
    enabled: !!pipelineId,
  });

  const getPhaseIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "erstkontakt":
        return <UserPlus className="h-5 w-5" />;
      case "interesse geweckt":
        return <Users className="h-5 w-5" />;
      case "produktvorstellung":
        return <Network className="h-5 w-5" />;
      case "geschäftspräsentation":
        return <Presentation className="h-5 w-5" />;
      case "nachfassen":
        return <Scale className="h-5 w-5" />;
      case "onboarding":
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  if (!phases) return null;

  return (
    <div className="flex flex-col space-y-2 px-4">
      {phases.map((phase, index) => {
        const isActive = phase.id === currentPhaseId;
        const isPast = phases.findIndex(p => p.id === currentPhaseId) > index;

        return (
          <div key={phase.id} className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  isActive ? "bg-blue-500 text-white" : 
                  isPast ? "bg-green-500 text-white" : 
                  "bg-gray-200 text-gray-500"
                )}
              >
                {getPhaseIcon(phase.name)}
              </div>
              {index < phases.length - 1 && (
                <div 
                  className={cn(
                    "absolute h-full w-0.5 top-8 left-1/2 transform -translate-x-1/2",
                    isPast ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <span 
              className={cn(
                "text-sm font-medium",
                isActive ? "text-blue-500" :
                isPast ? "text-green-500" :
                "text-gray-500"
              )}
            >
              {phase.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};