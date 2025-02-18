
import { useState } from "react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "../../dialog/useTeamMembers";
import { useParams } from "react-router-dom";

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
    <div className="space-y-4">
      <TiptapEditor
        content={content}
        onChange={setContent}
        placeholder="Schreibe einen Kommentar... (@mention für Erwähnungen)"
        teamMembers={teamMembers}
        preventSubmitOnEnter
      />
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Abbrechen
          </Button>
        )}
        <Button
          onClick={() => onSave(content)}
          disabled={!content.trim()}
        >
          Speichern
        </Button>
      </div>
    </div>
  );
};
