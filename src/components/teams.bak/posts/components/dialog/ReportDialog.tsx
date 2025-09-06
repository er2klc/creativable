
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export const ReportDialog = ({ isOpen, onClose, postId, postTitle }: ReportDialogProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('team_post_reports')
        .insert({
          post_id: postId,
          reported_by: user.id,
          reason: reason.trim()
        });

      if (error) throw error;
      
      toast.success("Beitrag wurde gemeldet");
      onClose();
      setReason("");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Fehler beim Melden des Beitrags");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Beitrag melden</DialogTitle>
          <DialogDescription>
            Bitte beschreiben Sie, warum Sie den Beitrag "{postTitle}" melden möchten.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Beschreiben Sie den Grund für die Meldung..."
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Wird gemeldet..." : "Melden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
