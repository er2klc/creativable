import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "@/components/leads/detail/LeadInfoCard";
import { LeadSummary } from "@/components/leads/detail/LeadSummary";
import { CompactPhaseSelector } from "@/components/leads/detail/CompactPhaseSelector";
import { LeadTimeline } from "@/components/leads/detail/LeadTimeline";
import { ContactFieldManager } from "@/components/leads/detail/contact-info/ContactFieldManager";
import { LeadDetailTabs } from "@/components/leads/detail/LeadDetailTabs";
import { LeadWithRelations } from "@/components/leads/detail/types/lead";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  isLoading: boolean;
  onDeleteClick?: () => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  isLoading,
  onDeleteClick
}: LeadDetailContentProps) => {
  const { settings } = useSettings();

  // Only hide phase selector if lead has a status other than 'lead'
  const showPhaseSelector = !lead.status || lead.status === 'lead';

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
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
          <ContactFieldManager />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {showPhaseSelector && (
            <CompactPhaseSelector
              lead={lead}
              onUpdateLead={onUpdateLead}
            />
          )}

          <LeadDetailTabs lead={lead} />
          
          <LeadTimeline lead={lead} />
        </div>
      </div>
    </div>
  );
};