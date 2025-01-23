import { LeadWithRelations } from "../types/lead";
import { TaskList } from "../TaskList";

export interface TaskTabProps {
  lead: LeadWithRelations;
}

export const TaskTab = ({ lead }: TaskTabProps) => {
  return (
    <div className="p-4">
      <TaskList leadId={lead.id} />
    </div>
  );
};