
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PostReactions } from "../reactions/PostReactions";

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

  return (
    <div className="flex items-center gap-2">
      <PostReactions postId={postId} teamId={teamId} />
      <MessageSquare className="h-4 w-4" />
    </div>
  );
};
