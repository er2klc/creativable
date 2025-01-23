import { LeadWithRelations } from "./types/lead";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadFileUpload } from "./files/LeadFileUpload";
import { LeadFileList } from "./files/LeadFileList";
import { AddAppointmentDialog } from "./appointments/AddAppointmentDialog";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
  isLoading: boolean;
  onDeleteClick?: () => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  isLoading,
  onDeleteClick
}: LeadDetailContentProps) => {
  if (isLoading) {
    return <div className="p-6">Lädt...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={onUpdateLead}
          />
          <div className="flex gap-4">
            <LeadFileUpload leadId={lead.id} />
            <AddAppointmentDialog leadId={lead.id} leadName={lead.name} />
          </div>
        </div>
        
        <LeadSummary lead={lead} />
        <LeadInfoCard 
          lead={lead} 
          onUpdate={onUpdateLead} 
          onDelete={onDeleteClick}
        />
        <ContactFieldManager />
        <LeadFileList leadId={lead.id} />
        <LeadTimeline lead={lead} />
        <TaskList leadId={lead.id} />
        <NoteList leadId={lead.id} />
        <LeadMessages leadId={lead.id} messages={lead.messages} />
      </div>
    </div>
  );
};