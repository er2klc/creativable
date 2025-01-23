import { LeadWithRelations } from "../types/lead";
import { LeadInfoCard } from "../LeadInfoCard";
import { LeadDetailTabs } from "../LeadDetailTabs";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
  isLoading: boolean;
  onDeleteClick: () => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead, 
  isLoading,
  onDeleteClick
}: LeadDetailContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeadInfoCard 
            lead={lead} 
            onUpdate={onUpdateLead} 
            onDelete={onDeleteClick}
          />
        </div>
        <div className="lg:col-span-2">
          <LeadDetailTabs lead={lead} onUpdate={onUpdateLead} />
        </div>
      </div>
    </div>
  );
};