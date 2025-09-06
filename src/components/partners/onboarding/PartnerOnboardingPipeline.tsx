
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Presentation, UserCheck, CalendarCheck } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const phaseIcons = {
  "Start & Setup": Users,
  "Ziele & Kontakte": Presentation,
  "Präsentation & Abschluss": UserCheck,
};

const phaseNumbers = {
  "Start & Setup": 1,
  "Ziele & Kontakte": 2,
  "Präsentation & Abschluss": 3,
};

export function PartnerOnboardingPipeline() {
  const navigate = useNavigate();

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("leads")
        .select("*, partner_onboarding_progress(*)")
        .eq("status", "partner");
      
      if (error) throw error;
      console.log("Fetched partners:", data?.length);
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

  // Find maximum number of partners in any phase for consistent height
  const maxPartners = Math.max(...phases.map(phase => 
    partners.filter(partner => 
      partner.partner_onboarding_progress?.some(progress => 
        progress.phase_id === phase.id
      )
    ).length
  ));

  // Get partners without any progress to show in first phase
  const getPartnersForPhase = (phase: any) => {
    if (phase.order_index === 0) {
      return partners.filter(partner => 
        !partner.partner_onboarding_progress?.length || 
        partner.partner_onboarding_progress.some(progress => 
          progress.phase_id === phase.id
        )
      );
    }
    return partners.filter(partner => 
      partner.partner_onboarding_progress?.some(progress => 
        progress.phase_id === phase.id
      )
    );
  };

  const handlePartnerClick = (partnerId: string) => {
    navigate(`/contacts/${partnerId}`);
  };

  // Calculate dynamic width for each phase based on total number of phases
  const getPhaseWidth = () => {
    const minWidth = 300; // Minimum width for each phase in pixels
    const maxPhases = 6; // Maximum number before scrolling
    const totalPhases = phases.length;
    
    if (totalPhases <= maxPhases) {
      // If we have 6 or fewer phases, distribute space evenly
      return `calc((100% - 2rem) / ${totalPhases})`; // 2rem accounts for gap-4
    }
    
    // If more than 6 phases, fix width to minimum
    return `${minWidth}px`;
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {phases.map((phase) => {
            const Icon = phaseIcons[phase.name as keyof typeof phaseIcons];
            const phasePartners = getPartnersForPhase(phase);

            return (
              <div 
                key={phase.id} 
                className="flex-shrink-0"
                style={{ width: getPhaseWidth() }}
              >
                <div className="bg-green-50 rounded-lg border border-green-100 h-full">
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

                  <div className="p-4 space-y-3" style={{ minHeight: `${maxPartners * 100}px` }}>
                    {phasePartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="bg-white p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handlePartnerClick(partner.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {partner.social_media_profile_image_url ? (
                              <img 
                                src={partner.social_media_profile_image_url} 
                                alt={partner.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-lg font-semibold">
                                {partner.name?.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {partner.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <CalendarCheck className="w-4 h-4" />
                              {format(new Date(partner.updated_at || ''), "dd. MMM yyyy", { locale: de })}
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
    </DndContext>
  );
}
