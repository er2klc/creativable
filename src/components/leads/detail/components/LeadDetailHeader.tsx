import { LeadWithRelations } from "../types/lead";
import { UseMutateFunction } from "@tanstack/react-query";

interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: UseMutateFunction<any, Error, Partial<LeadWithRelations>, unknown>;
  onClose: () => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead, onClose }: LeadDetailHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-2xl font-semibold">{lead.name}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
};