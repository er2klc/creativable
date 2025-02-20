
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MessageSquare } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { CommentEditor } from "./CommentEditor";
import { CommentReactions } from "./CommentReactions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    created_by: string;
    post_id: string;
    parent_id?: string;
    author: {
      display_name: string | null;
      avatar_url: string | null;
    };
    edited?: boolean;
    last_edited_at?: string;
  };
  onDelete: (id: string) => void;
  level?: number;
  replies?: typeof CommentItemProps.comment[];
}

export const CommentItem = ({ comment, onDelete, level = 0, replies = [] }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const user = useUser();
  const isAuthor = user?.id === comment.created_by;

  const handleSaveEdit = async (newContent: string) => {
    try {
      const { error } = await supabase
        .from('team_post_comments')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', comment.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast.success("Kommentar wurde aktualisiert");
      
      // Optimistic update
      comment.content = newContent;
      comment.edited = true;
      comment.last_edited_at = new Date().toISOString();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error("Fehler beim Aktualisieren des Kommentars");
    }
  };

  const handleReply = async (content: string) => {
    try {
      const { data, error } = await supabase
        .from('team_post_comments')
        .insert({
          content,
          post_id: comment.post_id,
          parent_id: comment.id,
          created_by: user?.id
        })
        .select(`
          id,
          content,
          created_at,
          created_by,
          post_id,
          parent_id,
          author:profiles!team_post_comments_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setIsReplying(false);
      toast.success("Antwort wurde hinzugefügt");
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error("Fehler beim Hinzufügen der Antwort");
    }
  };

  const hasReplies = replies && replies.length > 0;

  return (
    <div className={cn(
      "space-y-4",
      level > 0 && "ml-8 pt-4"
    )}>
      <div className="flex gap-4 p-4 border rounded-lg bg-background">
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
            
            <div className="flex items-center gap-1">
              {isAuthor && (
                <>
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
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
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
              {hasReplies && !isReplying && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showReplies ? "Antworten ausblenden" : `${replies.length} Antwort${replies.length !== 1 ? 'en' : ''} anzeigen`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="ml-8">
          <CommentEditor
            initialContent={`@${comment.author.display_name} `}
            onSave={handleReply}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {hasReplies && showReplies && (
        <div className="space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
