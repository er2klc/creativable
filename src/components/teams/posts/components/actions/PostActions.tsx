
import { Bell, Link2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  teamId: string;
  isSubscribed: boolean;
}

export const PostActions = ({ 
  postId, 
  teamId,
  isSubscribed 
}: PostActionsProps) => {
  const queryClient = useQueryClient();

  const handleSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('team_post_subscriptions')
        .upsert({
          post_id: postId,
          user_id: user.id,
          subscribed: !isSubscribed
        });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['post-subscription', postId] });
      
      toast.success(isSubscribed 
        ? "Benachrichtigungen deaktiviert" 
        : "Benachrichtigungen aktiviert"
      );
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error("Fehler beim Ändern der Benachrichtigungen");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link kopiert!");
  };

  const handleReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('team_post_reports')
        .insert({
          post_id: postId,
          reported_by: user.id,
          reason: "Unangemessener Inhalt"
        });

      if (error) throw error;
      toast.success("Beitrag wurde gemeldet");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Fehler beim Melden des Beitrags");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSubscription}
        className={cn(
          "text-muted-foreground hover:text-primary",
          isSubscribed && "text-primary"
        )}
      >
        <Bell className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyUrl}
        className="text-muted-foreground hover:text-primary"
      >
        <Link2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleReport}
        className="text-muted-foreground hover:text-primary"
      >
        <Flag className="h-4 w-4" />
      </Button>
    </div>
  );
};
