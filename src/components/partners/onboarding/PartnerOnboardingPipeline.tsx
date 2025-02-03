import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Users2, Presentation, UserCheck, GraduationCap, Users, Rocket } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";

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

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, partner_onboarding_progress(*)")
        .eq("status", "partner");
      
      if (error) throw error;
      return data as Tables<"leads">[];
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const partnerId = active.id as string;
    const newPhaseId = over.id as string;

    try {
      await supabase
        .from("partner_onboarding_progress")
        .upsert({
          lead_id: partnerId,
          phase_id: newPhaseId,
          status: "in_progress",
        });
    } catch (error) {
      console.error("Error updating partner phase:", error);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-4 p-4 min-w-fit">
          {phases.map((phase) => {
            const Icon = phaseIcons[phase.name as keyof typeof phaseIcons];
            const phasePartners = partners.filter(partner => 
              partner.partner_onboarding_progress?.some(progress => 
                progress.phase_id === phase.id
              )
            );

            return (
              <div
                key={phase.id}
                className="flex-1 min-w-[300px] bg-green-50 rounded-lg p-4 border border-green-100"
              >
                {/* Phase Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    {Icon && <Icon className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{phase.name}</h3>
                    <p className="text-sm text-gray-500">
                      {phasePartners.length} Partner
                    </p>
                  </div>
                </div>

                {/* Partner Cards */}
                <div className="space-y-3">
                  {phasePartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {partner.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {partner.company_name || "Kein Unternehmen"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}