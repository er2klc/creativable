import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "../LeadInfoCard";
import { LeadSummary } from "../LeadSummary";
import { CompactPhaseSelector } from "../CompactPhaseSelector";
import { LeadTimeline } from "../LeadTimeline";
import { ContactFieldManager } from "../contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "../LeadDetailTabs";

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - 8/12 */}
        <div className="col-span-8 space-y-6">
          {showPhaseSelector && (
            <CompactPhaseSelector
              lead={lead}
              onUpdateLead={onUpdateLead}
            />
          )}
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
              </h3>
            </div>
            <LeadSummary lead={lead} />
          </div>
          
          <LeadInfoCard 
            lead={lead} 
            onUpdate={onUpdateLead} 
            onDelete={onDeleteClick}
          />

          <LeadTimeline 
            lead={lead} 
            onDeletePhaseChange={onDeletePhaseChange}
          />
        </div>

        {/* Right Column - 4/12 */}
        <div className="col-span-4 space-y-6">
          <ContactFieldManager />
          <LeadDetailTabs lead={lead} />
        </div>
      </div>
    </div>
  );
};