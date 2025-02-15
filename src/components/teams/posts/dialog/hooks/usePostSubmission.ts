
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";

interface FormValues {
  title: string;
  content: string;
  files?: FileList;
}

export const usePostSubmission = (
  teamId: string,
  categoryId?: string,
  onSuccess?: () => void,
  teamMembers?: any[]
) => {
  const queryClient = useQueryClient();
  const user = useUser();

  const extractMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex) || [];
    return mentions.map(mention => mention.substring(1));
  };

  const findUserIdByName = (name: string) => {
    const member = teamMembers?.find(
      m => m.profiles?.display_name?.toLowerCase() === name.toLowerCase()
    );
    return member?.profiles?.id;
  };

  const handleSubmission = async (values: FormValues, fileUrls: string[], postId?: string) => {
    if (!user?.id) {
      toast.error("Sie müssen angemeldet sein, um einen Beitrag zu erstellen");
      return;
    }

    try {
      const mentions = extractMentions(values.content);
      const mentionedUserIds = mentions
        .map(name => findUserIdByName(name))
        .filter((id): id is string => id !== undefined);

      if (postId) {
        // Update existing post
        const { error: postError } = await supabase
          .from('team_posts')
          .update({
            title: values.title,
            content: values.content,
            file_urls: fileUrls.length > 0 ? fileUrls : null,
          })
          .eq('id', postId);

        if (postError) throw postError;
        toast.success("Beitrag erfolgreich aktualisiert");
      } else {
        // Create new post
        const { data: post, error: postError } = await supabase
          .from('team_posts')
          .insert({
            team_id: teamId,
            category_id: categoryId,
            title: values.title,
            content: values.content,
            created_by: user.id,
            user_id: user.id,
            file_urls: fileUrls.length > 0 ? fileUrls : null,
          })
          .select('id')
          .single();

        if (postError) throw postError;

        if (mentionedUserIds.length > 0) {
          const { error: mentionsError } = await supabase
            .from('team_post_mentions')
            .insert(
              mentionedUserIds.map(userId => ({
                post_id: post.id,
                mentioned_user_id: userId,
              }))
            );

          if (mentionsError) throw mentionsError;
        }
        toast.success("Beitrag erfolgreich erstellt");
      }

      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error handling post:', error);
      toast.error(postId ? "Fehler beim Aktualisieren des Beitrags" : "Fehler beim Erstellen des Beitrags");
      throw error;
    }
  };

  return { handleSubmission };
};
