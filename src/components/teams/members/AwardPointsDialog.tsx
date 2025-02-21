
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AwardPointsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  teamId: string;
}

export function AwardPointsDialog({ isOpen, onClose, memberId, memberName, teamId }: AwardPointsDialogProps) {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!points || !reason) {
      toast.error("Bitte Punkte und Begründung angeben");
      return;
    }

    const pointsNum = parseInt(points);
    if (pointsNum < 10 || pointsNum > 1000) {
      toast.error("Punkte müssen zwischen 10 und 1000 liegen");
      return;
    }

    setIsSubmitting(true);
    try {
      // Award points using the existing function
      await supabase.rpc('award_team_points', {
        p_team_id: teamId,
        p_user_id: memberId,
        p_event_type: 'admin_award',
        p_points: pointsNum,
        p_metadata: {
          reason,
          awarded_by_admin: true
        }
      });

      // Create notification for the user
      await supabase.from('notifications').insert({
        user_id: memberId,
        title: 'Punkte erhalten! 🎉',
        content: `Ein Admin hat dir ${pointsNum} Punkte vergeben: "${reason}"`,
        type: 'points_awarded',
        metadata: {
          points: pointsNum,
          reason,
          team_id: teamId
        }
      });

      toast.success("Punkte erfolgreich vergeben");
      onClose();
      setPoints("");
      setReason("");
    } catch (error) {
      console.error('Error awarding points:', error);
      toast.error("Fehler beim Vergeben der Punkte");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Punkte vergeben an {memberName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="points">Punkte (10-1000)</Label>
            <Input
              id="points"
              type="number"
              min="10"
              max="1000"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Begründung</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Begründung für die Punktevergabe..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird vergeben..." : "Punkte vergeben"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
