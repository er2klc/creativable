
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { CommentEditor } from "./CommentEditor";
import { CommentReactions } from "./CommentReactions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    created_by: string;
    post_id: string;
    author: {
      display_name: string | null;
      avatar_url: string | null;
    };
    edited?: boolean;
    last_edited_at?: string;
  };
  onDelete: (id: string) => void;
}

export const CommentItem = ({ comment, onDelete }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const user = useUser();
  const isAuthor = user?.id === comment.created_by;

  const handleSaveEdit = async (newContent: string) => {
    try {
      const { error } = await supabase
        .from('team_post_comments')
        .update({ 
          content: newContent,
          edited: true,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', comment.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast.success("Kommentar wurde aktualisiert");
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error("Fehler beim Aktualisieren des Kommentars");
    }
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar_url || ""} />
        <AvatarFallback>
          {comment.author.display_name?.substring(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.author.display_name}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: de,
              })}
              {comment.edited && (
                <>
                  <span className="mx-1">•</span>
                  <span>
                    Bearbeitet {formatDistanceToNow(new Date(comment.last_edited_at!), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </>
              )}
            </span>
          </div>
          
          {isAuthor && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentEditor
            initialContent={comment.content}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div 
              className="prose prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: comment.content }} 
            />
            <CommentReactions commentId={comment.id} />
          </>
        )}
      </div>
    </div>
  );
};
