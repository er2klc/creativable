import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface LeadDetailHeaderProps {
  lead: any;
  onUpdateLead: (updates: any) => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead }: LeadDetailHeaderProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Delete all related data first
      await Promise.all([
        supabase.from('messages').delete().eq('lead_id', lead.id),
        supabase.from('tasks').delete().eq('lead_id', lead.id),
        supabase.from('notes').delete().eq('lead_id', lead.id),
        supabase.from('lead_files').delete().eq('lead_id', lead.id)
      ]);

      // Then delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast.success("Kontakt erfolgreich gelöscht");
      navigate("/contacts");
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error("Fehler beim Löschen des Kontakts");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1A1F2C] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Kontakt löschen</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Möchten Sie diesen Kontakt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
            >
              {isDeleting ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};