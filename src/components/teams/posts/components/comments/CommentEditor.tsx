
import { useState } from "react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "../../dialog/useTeamMembers";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4">
      <div className="max-w-[1200px] mx-auto flex items-end gap-2">
        <div className="flex-1">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Schreibe einen Kommentar... (@mention für Erwähnungen)"
            teamMembers={teamMembers}
            editorProps={{
              attributes: {
                class: 'prose-sm focus:outline-none min-h-[50px] max-h-[150px] p-3 whitespace-pre-wrap rounded-lg bg-muted/30',
              }
            }}
          />
        </div>
        <Button
          onClick={() => onSave(content)}
          disabled={!content.trim()}
          size="icon"
          className="mb-1"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
