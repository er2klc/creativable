import { useState } from "react";
import { SocialMediaPost } from "../types/lead";
import { formatDateTime } from "./utils/dateUtils";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
  onDeletePost: (postId: string) => void;
}

export const SocialMediaTimeline = ({ posts, onDeletePost }: SocialMediaTimelineProps) => {
  const { settings } = useSettings();

  const handleDelete = async (postId: string) => {
    try {
      await supabase.from("social_media_posts").delete().eq("id", postId);
      onDeletePost(postId);
      toast.success(settings?.language === "en" ? "Post deleted successfully" : "Beitrag erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(settings?.language === "en" ? "Error deleting post" : "Fehler beim Löschen des Beitrags");
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{post.content}</h3>
            <Button variant="outline" onClick={() => handleDelete(post.id)}>
              Delete
            </Button>
          </div>
          <p className="text-sm text-gray-500">{formatDateTime(post.posted_at)}</p>
        </div>
      ))}
    </div>
  );
};
