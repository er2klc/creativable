import { Edit, Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteLeadDialog } from "../components/DeleteLeadDialog";

interface LeadCardActionsProps {
  leadId: string;
  createdBy: string;
  onDelete: () => void;
}

export const LeadCardActions = ({ 
  leadId, 
  createdBy, 
  onDelete 
}: LeadCardActionsProps) => {
  const user = useUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Only show actions if user is the lead owner
  if (!user || user.id !== createdBy) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <DeleteLeadDialog
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        onDelete={onDelete}
      />
    </>
  );
};