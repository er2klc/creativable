import { LeadWithRelations } from "../types/lead";
import { UseMutateFunction } from "@tanstack/react-query";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: UseMutateFunction<any, Error, Partial<LeadWithRelations>, unknown>;
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
    <div className="p-4">
      <button
        onClick={onDeleteClick}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Delete Contact
      </button>
    </div>
  );
};