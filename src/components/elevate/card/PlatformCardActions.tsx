import { Edit, Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useState } from "react";
import { EditPlatformDialog } from "../platform/EditPlatformDialog";

interface PlatformCardActionsProps {
  platformId: string;
  inviteCode: string;
  createdBy: string;
  onDelete: (e: React.MouseEvent) => void;
}

export const PlatformCardActions = ({ 
  platformId, 
  inviteCode,
  createdBy, 
  onDelete 
}: PlatformCardActionsProps) => {
  const user = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Only show actions if user is the platform owner
  if (!user || user.id !== createdBy) {
    return null;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      toast.success("Einladungscode kopiert!");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <EditPlatformDialog 
        platformId={platformId} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
      />
    </>
  );
};