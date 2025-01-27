import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadSummary } from "./LeadSummary";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { LeadWithRelations } from "./types/lead";

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

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 4 columns */}
        <div className="col-span-4 space-y-6">
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

        {/* Right Column - 8 columns */}
        <div className="col-span-8 space-y-6">
          <LeadDetailTabs lead={lead} />
          <LeadTimeline lead={lead} />
        </div>
      </div>
    </div>
  );
};