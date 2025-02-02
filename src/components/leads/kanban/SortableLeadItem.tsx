import { useDraggable } from "@dnd-kit/core";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const SortableLeadItem = ({ lead, onDelete, onEdit }: SortableLeadItemProps) => {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: lead.id,
  });

  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(lead.id);
    toast.success("Lead deleted successfully");
  };

  const handleEdit = () => {
    onEdit(lead.id);
  };

  const getBackgroundColor = (contactType: string | null) => {
    if (!contactType) return "bg-white";
    
    const types = contactType.split(",");
    const isPartner = types.includes("Partner");
    const isKunde = types.includes("Kunde");

    if (isPartner && isKunde) {
      return "bg-gradient-to-r from-[#60A5FA]/30 to-[#4ADE80]/30";
    } else if (isPartner) {
      return "bg-gradient-to-r from-[#60A5FA]/30 to-[#BFDBFE]/30";
    } else if (isKunde) {
      return "bg-gradient-to-r from-[#4ADE80]/30 to-[#BBF7D0]/30";
    }
    return "bg-white";
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg shadow-md ${getBackgroundColor(lead.contact_type)}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{lead.name}</h3>
          <p className="text-sm text-gray-500">{lead.platform}</p>
        </div>
        <div className="flex items-center">
          <Checkbox
            checked={lead.contact_type?.includes("Partner")}
            onCheckedChange={(checked) => handleEdit()}
          />
          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
