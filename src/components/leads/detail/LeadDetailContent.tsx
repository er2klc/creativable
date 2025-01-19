import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";

interface LeadDetailContentProps {
  lead: Tables<"leads"> & {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeletePhaseChange: (noteId: string) => void;
  isLoading: boolean;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead, 
  onDeletePhaseChange,
  isLoading 
}: LeadDetailContentProps) => {
  const { settings } = useSettings();
  console.log('LeadDetailContent rendering with lead:', lead);

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <CompactPhaseSelector
          lead={lead}
          onUpdateLead={onUpdateLead}
        />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
            </h3>
          </div>
          <LeadSummary lead={lead} />
        </div>
        
        <LeadInfoCard lead={lead} />
        <ContactFieldManager />
        <LeadTimeline 
          lead={lead} 
          onDeletePhaseChange={onDeletePhaseChange}
        />
        <TaskList leadId={lead.id} />
        <NoteList leadId={lead.id} />
        <LeadMessages leadId={lead.id} messages={lead.messages} />
      </div>
    </div>
  );
};