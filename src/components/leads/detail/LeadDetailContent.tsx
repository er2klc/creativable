
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { LeadTimeline } from "./LeadTimeline";
import { LeadSummary } from "./LeadSummary";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  isLoading: boolean;
  onDeleteClick?: () => void;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  isLoading,
  onDeleteClick,
  onDeletePhaseChange
}: LeadDetailContentProps) => {
  const { settings } = useSettings();
  
  // Only hide phase selector if lead has a status other than 'lead'
  const showPhaseSelector = !lead.status || lead.status === 'lead';

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  console.log('LeadDetailContent rendering with lead:', {
    id: lead.id,
    phase_id: lead.phase_id,
    status: lead.status,
    hasMessages: Array.isArray(lead.messages),
    hasTasks: Array.isArray(lead.tasks),
    route: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50 min-h-[calc(100vh-10rem)] mt-32">
        <div className="col-span-8 space-y-6">
          {showPhaseSelector && (
            <CompactPhaseSelector
              lead={lead}
              onUpdateLead={onUpdateLead}
            />
          )}
          
          <LeadInfoCard 
            lead={lead} 
            onUpdate={(updates) => {
              const hasChanges = Object.entries(updates).some(
                ([key, value]) => lead[key as keyof typeof lead] !== value
              );
              if (hasChanges) {
                onUpdateLead(updates);
              }
            }} 
            onDelete={onDeleteClick}
          />

          <LeadSummary lead={lead} />

          <LeadTimeline 
            lead={lead} 
            onDeletePhaseChange={onDeletePhaseChange}
          />
        </div>

        <div className="col-span-4 space-y-6">
          <ContactFieldManager />
          <LeadDetailTabs lead={lead} />
        </div>
      </div>
    </div>
  );
};
