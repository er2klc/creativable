
import { useState } from "react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "../../dialog/useTeamMembers";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CommentEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
}

export const CommentEditor = ({ 
  initialContent = "", 
  onSave,
  onCancel 
}: CommentEditorProps) => {
  const { teamSlug } = useParams();
  const { data: teamMembers } = useTeamMembers(teamSlug || "");
  const [content, setContent] = useState(initialContent);

  const { data: enrichedTeamMembers } = useQuery({
    queryKey: ['team-members-with-levels', teamSlug],
    queryFn: async () => {
      if (!teamMembers?.length) return [];
      
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!team) return teamMembers;

      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('user_id, level')
        .eq('team_id', team.id)
        .in('user_id', teamMembers.map(m => m.id));

      return teamMembers.map(member => ({
        ...member,
        level: memberPoints?.find(mp => mp.user_id === member.id)?.level || 1
      }));
    },
    enabled: !!teamMembers?.length && !!teamSlug
  });

  return (
    <div className="border rounded-lg p-4 bg-muted/5">
      <div className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Schreibe einen Kommentar... (@mention für Erwähnungen)"
          teamMembers={enrichedTeamMembers}
          onMention={(userId) => {
            console.log('Mentioned user:', userId);
          }}
          editorProps={{
            attributes: {
              class: 'prose-sm focus:outline-none min-h-[50px] max-h-[150px] p-3 whitespace-pre-wrap rounded-lg bg-background',
            }
          }}
        />
        <div className="flex items-center justify-between">
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              size="sm"
            >
              Abbrechen
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={() => onSave(content)}
              disabled={!content.trim()}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Senden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
