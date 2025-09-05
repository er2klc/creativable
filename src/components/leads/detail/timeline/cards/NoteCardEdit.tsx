import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { Save, X, Mic, Trash2 } from "lucide-react";

interface NoteCardEditProps {
  editedContent: string;
  setEditedContent: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isRecording: boolean;
  isSaving: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const NoteCardEdit = ({
  editedContent,
  setEditedContent,
  onSave,
  onCancel,
  onDelete,
  isRecording,
  isSaving,
  onStartRecording,
  onStopRecording,
}: NoteCardEditProps) => {
  const { settings } = useSettings();

  return (
    <div className="space-y-2">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="min-h-[100px] w-full"
      />
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-1" />
          {settings?.language === "en" ? "Cancel" : "Abbrechen"}
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {settings?.language === "en" ? "Save" : "Speichern"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={isRecording ? "bg-red-50 text-red-600" : ""}
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};