import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Users2, Presentation, UserCheck, GraduationCap, Users, Rocket } from "lucide-react";

const phaseIcons = {
  "Welcome & Setup": Users2,
  "Kontakte & Erste Einladungen": Users,
  "Präsentation & Erste Abschlüsse": Presentation,
  "Follow-Up & Entscheidung": UserCheck,
  "Training & Systemaufbau": GraduationCap,
  "Scaling & Teambuilding": Rocket,
};

export function PartnerOnboardingPipeline() {
  const { data: phases = [] } = useQuery({
    queryKey: ["partner-onboarding-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_onboarding_phases")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="relative">
        {/* Vertical line connecting phases */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-200 -translate-x-1/2" />
        
        {/* Phases */}
        <div className="relative space-y-12">
          {phases.map((phase, index) => {
            const Icon = phaseIcons[phase.name as keyof typeof phaseIcons];
            
            return (
              <div key={phase.id} className={cn(
                "relative flex items-center gap-8",
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              )}>
                {/* Line and Icon */}
                <div className="flex-1 flex items-center justify-end">
                  <div className={cn(
                    "w-full h-px bg-green-200",
                    index % 2 === 0 ? "mr-4" : "ml-4"
                  )} />
                </div>
                
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 border-4 border-white shadow-lg">
                  {Icon && <Icon className="w-6 h-6 text-green-600" />}
                </div>
                
                <div className="flex-1">
                  {/* Card */}
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {phase.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {phase.description || "Beschreibung folgt..."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}