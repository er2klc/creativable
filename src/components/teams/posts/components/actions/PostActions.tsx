
import { useState } from "react";
import { Bell, Link2, Flag, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface PostActionsProps {
  postId: string;
  teamId: string;
  isSubscribed: boolean;
}

export const PostActions = ({ postId, teamId, isSubscribed }: PostActionsProps) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link wurde in die Zwischenablage kopiert");
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Bitte geben Sie einen Grund an");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('team_post_reports')
        .insert({
          post_id: postId,
          reason: reportReason,
          reported_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      toast.success("Beitrag wurde gemeldet");
      setShowReportDialog(false);
      setReportReason("");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Fehler beim Melden des Beitrags");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const { error } = await supabase
        .from('team_post_subscriptions')
        .upsert({
          post_id: postId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          subscribed: !isSubscribed
        });

      if (error) throw error;
      
      toast.success(isSubscribed 
        ? "Benachrichtigungen deaktiviert" 
        : "Benachrichtigungen aktiviert"
      );
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error("Fehler beim Ändern der Benachrichtigungen");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSubscription}
          disabled={subscriptionLoading}
        >
          {isSubscribed ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowReportDialog(true)}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beitrag melden</DialogTitle>
            <DialogDescription>
              Bitte geben Sie einen Grund für die Meldung an.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Grund für die Meldung..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleReport}
                disabled={isSubmitting}
              >
                Melden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
