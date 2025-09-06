
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CommentEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  teamMembers?: any[];
  teamSlug?: string;
  clearOnSubmit?: boolean;
}

export const CommentEditor = ({ 
  initialContent = "", 
  onSave, 
  onCancel,
  teamMembers,
  teamSlug,
  clearOnSubmit = false
}: CommentEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [key, setKey] = useState(0); // Key für Neurendering des Editors

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content);
      if (clearOnSubmit) {
        setContent("");
        setKey(prev => prev + 1); // Erzwingt Neurendering des Editors
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TiptapEditor
        key={key}
        content={content}
        onChange={setContent}
        teamMembers={teamMembers}
        teamSlug={teamSlug}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Abbrechen
          </Button>
        )}
        <Button type="submit">
          Kommentar senden
        </Button>
      </div>
    </form>
  );
};
