
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";

interface CreateCommentFormProps {
  postId: string;
}

export const CreateCommentForm = ({ postId }: CreateCommentFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('team_post_comments')
        .insert({
          post_id: postId,
          content: content.trim(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      setContent("");
      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
      toast.success("Kommentar wurde erstellt");
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <RichTextEditor
        placeholder="Schreibe einen Kommentar..."
        content={content}
        onChange={setContent}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          Kommentieren
        </Button>
      </div>
    </form>
  );
};
