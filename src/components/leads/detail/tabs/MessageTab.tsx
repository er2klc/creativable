import { LeadWithRelations } from "../types/lead";
import { LeadMessages } from "../LeadMessages";

export interface MessageTabProps {
  lead: LeadWithRelations;
}

export const MessageTab = ({ lead }: MessageTabProps) => {
  return (
    <div className="p-4">
      <LeadMessages leadId={lead.id} messages={lead.messages} />
    </div>
  );
};