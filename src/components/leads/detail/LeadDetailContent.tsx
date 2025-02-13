
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "./LeadDetailTabs";

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

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50 min-h-[calc(100vh-10rem)] mt-32">
        {/* Left Column - 4/12 */}
        <div className="col-span-4 space-y-6">
          <LeadInfoCard 
            lead={lead} 
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
        </div>

        {/* Right Column - 8/12 */}
        <div className="col-span-8 space-y-6">
          <ContactFieldManager />
          <LeadDetailTabs lead={lead} />
          <LeadTimeline 
            lead={lead} 
            onDeletePhaseChange={onDeletePhaseChange}
          />
        </div>
      </div>
    </div>
  );
};
