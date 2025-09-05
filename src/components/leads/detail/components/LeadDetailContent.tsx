
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "../LeadInfoCard";
import { CompactPhaseSelector } from "../CompactPhaseSelector";
import { ContactFieldManager } from "../contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "../LeadDetailTabs";
import { LeadTimeline } from "../LeadTimeline";
import { LeadSummary } from "../LeadSummary";

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
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50 min-h-[calc(100vh-10rem)] mt-32">
        {/* Left Column - 8/12 */}
        <div className="col-span-8 space-y-6">
          {showPhaseSelector && (
            <CompactPhaseSelector
              lead={lead as any}
              onUpdateLead={onUpdateLead}
            />
          )}
          
          {/* AI Analysis Section */}
          <LeadSummary lead={lead as any} />
          
          <LeadInfoCard 
            lead={lead as any}
            onUpdate={(updates) => {
              // Only call onUpdateLead if we're actually changing something
              const hasChanges = Object.entries(updates).some(
                ([key, value]) => lead[key as keyof typeof lead] !== value
              );
              if (hasChanges) {
                onUpdateLead(updates);
              }
            }} 
            onDelete={onDeleteClick}
          />

          <LeadTimeline 
            lead={lead as any} 
            onDeletePhaseChange={onDeletePhaseChange}
          />
        </div>

        {/* Right Column - 4/12 */}
        <div className="col-span-4 space-y-6">
          <ContactFieldManager />
          <LeadDetailTabs lead={lead as any} />
        </div>
      </div>
    </div>
  );
};
