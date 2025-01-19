import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";

interface LeadContentProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeletePhaseChange: (noteId: string) => void;
}

export const LeadContent = ({ lead, onUpdateLead, onDeletePhaseChange }: LeadContentProps) => {
  const { settings } = useSettings();

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