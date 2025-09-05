
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";

interface LeadContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeletePhaseChange: (noteId: string) => void;
}

export const LeadContent = ({ lead, onUpdateLead, onDeletePhaseChange }: LeadContentProps) => {
  const { settings } = useSettings();

  // Only hide phase selector if lead has a status other than 'lead'
  const showPhaseSelector = !lead.status || lead.status === 'lead';

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {showPhaseSelector && (
          <CompactPhaseSelector
            lead={lead as any}
            onUpdateLead={onUpdateLead}
          />
        )}
        
        <LeadInfoCard
          lead={lead as any} 
          onUpdate={onUpdateLead}
        />
        <ContactFieldManager />
        <LeadTimeline 
          lead={lead as any} 
          onDeletePhaseChange={onDeletePhaseChange}
        />
        <TaskList leadId={lead.id} />
        <NoteList leadId={lead.id} />
        <LeadMessages leadId={lead.id} messages={lead.messages || []} />
      </div>
    </div>
  );
};
