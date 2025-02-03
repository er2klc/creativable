import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Users2, Presentation, UserCheck, GraduationCap, Users, Rocket, ArrowRight, ArrowLeft, PartyPopper, Calendar } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const phaseIcons = {
  "Welcome & Setup": PartyPopper,
  "Kontakte & Erste Einladungen": Users,
  "Präsentation & Erste Abschlüsse": Presentation,
  "Follow-Up & Entscheidung": UserCheck,
  "Training & Systemaufbau": GraduationCap,
  "Scaling & Teambuilding": Rocket,
};

const phaseNumbers = {
  "Welcome & Setup": 1,
  "Kontakte & Erste Einladungen": 2,
  "Präsentation & Erste Abschlüsse": 3,
  "Follow-Up & Entscheidung": 4,
  "Training & Systemaufbau": 5,
  "Scaling & Teambuilding": 6,
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

  // Split phases into two rows
  const firstRowPhases = phases.slice(0, 3);
  const secondRowPhases = phases.slice(3, 6);

  // Find maximum number of partners in any phase for consistent height
  const maxPartners = Math.max(...phases.map(phase => 
    partners.filter(partner => 
      partner.partner_onboarding_progress?.some(progress => 
        progress.phase_id === phase.id
      )
    ).length
  ));

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-8 p-4">
          {/* First Row - Left to Right */}
          <div className="flex gap-4 min-w-fit relative">
            {firstRowPhases.map((phase, index) => {
              const Icon = phaseIcons[phase.name as keyof typeof phaseIcons];
              const phasePartners = partners.filter(partner => 
                partner.partner_onboarding_progress?.some(progress => 
                  progress.phase_id === phase.id
                )
              );

              return (
                <div key={phase.id} className="relative flex-1 min-w-[300px]">
                  {index < firstRowPhases.length - 1 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="flex items-center">
                        <div className="h-0.5 w-8 bg-green-600"></div>
                        <ArrowRight className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  )}
                  <div className="bg-green-50 rounded-lg border border-green-100 h-full">
                    {/* Phase Header */}
                    <div className="p-4 border-b border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            {Icon && <Icon className="w-5 h-5 text-green-600" />}
                          </div>
                          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                            {phaseNumbers[phase.name as keyof typeof phaseNumbers]}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{phase.name}</h3>
                          <p className="text-sm text-gray-500">
                            {phasePartners.length} Partner
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Partner Cards */}
                    <div className="p-4 space-y-3" style={{ minHeight: `${maxPartners * 100}px` }}>
                      {phasePartners.map((partner) => (
                        <div
                          key={partner.id}
                          className="bg-white p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Users2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {partner.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(partner.created_at || ''), "dd. MMM yyyy", { locale: de })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Row - Right to Left */}
          <div className="flex flex-row-reverse gap-4 min-w-fit relative">
            {secondRowPhases.map((phase, index) => {
              const Icon = phaseIcons[phase.name as keyof typeof phaseIcons];
              const phasePartners = partners.filter(partner => 
                partner.partner_onboarding_progress?.some(progress => 
                  progress.phase_id === phase.id
                )
              );

              return (
                <div key={phase.id} className="relative flex-1 min-w-[300px]">
                  {index < secondRowPhases.length - 1 && (
                    <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10">
                      <div className="flex items-center">
                        <ArrowLeft className="w-6 h-6 text-green-600" />
                        <div className="h-0.5 w-8 bg-green-600"></div>
                      </div>
                    </div>
                  )}
                  {/* Visual connection between rightmost phases */}
                  {index === 0 && (
                    <div className="absolute -top-8 right-1/2 w-0.5 h-8 bg-green-600" />
                  )}
                  <div className="bg-green-50 rounded-lg border border-green-100 h-full">
                    {/* Phase Header */}
                    <div className="p-4 border-b border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            {Icon && <Icon className="w-5 h-5 text-green-600" />}
                          </div>
                          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                            {phaseNumbers[phase.name as keyof typeof phaseNumbers]}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{phase.name}</h3>
                          <p className="text-sm text-gray-500">
                            {phasePartners.length} Partner
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Partner Cards */}
                    <div className="p-4 space-y-3" style={{ minHeight: `${maxPartners * 100}px` }}>
                      {phasePartners.map((partner) => (
                        <div
                          key={partner.id}
                          className="bg-white p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Users2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {partner.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(partner.created_at || ''), "dd. MMM yyyy", { locale: de })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}