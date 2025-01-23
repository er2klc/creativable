import { LeadWithRelations } from "../types/lead";
import { NoteList } from "../NoteList";

export interface NoteTabProps {
  lead: LeadWithRelations;
}

export const NoteTab = ({ lead }: NoteTabProps) => {
  return (
    <div className="p-4">
      <NoteList leadId={lead.id} />
    </div>
  );
};