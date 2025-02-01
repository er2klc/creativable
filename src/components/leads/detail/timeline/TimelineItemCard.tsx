import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mic, Check, X } from "lucide-react";

interface TimelineItemCardProps {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  metadata?: any;
  onDelete?: () => void;
}

export const TimelineItemCard = ({
  id,
  type,
  content,
  timestamp,
  metadata,
  onDelete
}: TimelineItemCardProps) => {
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  let recognition: any;
  if (typeof window !== 'undefined') {
    recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings?.language === "en" ? 'en-US' : 'de-DE';
  }

  const handleTaskComplete = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', id);

      if (error) throw error;

      toast.success(
        settings?.language === "en"
          ? "Task marked as complete"
          : "Aufgabe als erledigt markiert"
      );
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(
        settings?.language === "en"
          ? "Error completing task"
          : "Fehler beim Abschließen der Aufgabe"
      );
    }
  };

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editedContent })
        .eq('id', id);

      if (error) throw error;

      setIsEditing(false);
      toast.success(
        settings?.language === "en"
          ? "Note updated successfully"
          : "Notiz erfolgreich aktualisiert"
      );
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error(
        settings?.language === "en"
          ? "Error updating note"
          : "Fehler beim Aktualisieren der Notiz"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
    if (isRecording) {
      stopRecording();
    }
  };

  const startRecording = () => {
    if (!recognition) {
      toast.error(
        settings?.language === "en"
          ? "Speech recognition is not supported in your browser"
          : "Spracherkennung wird in Ihrem Browser nicht unterstützt"
      );
      return;
    }

    recognition.onstart = () => {
      setIsRecording(true);
      toast.success(
        settings?.language === "en"
          ? "Recording started..."
          : "Aufnahme gestartet..."
      );
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setEditedContent(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast.error(
        settings?.language === "en"
          ? "Error during speech recognition"
          : "Fehler bei der Spracherkennung"
      );
    };

    recognition.onend = () => {
      setIsRecording(false);
      toast.success(
        settings?.language === "en"
          ? "Recording stopped"
          : "Aufnahme beendet"
      );
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded"
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "bg-red-50 text-red-600" : ""}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return <p className="text-gray-600">{content}</p>;
  };

  const getBorderColor = () => {
    switch (type) {
      case 'phase_change':
        return 'border-purple-200';
      case 'note':
        return 'border-yellow-200';
      case 'task':
        return 'border-blue-200';
      case 'message':
        return 'border-green-200';
      case 'file_upload':
        return 'border-orange-200';
      case 'contact_created':
        return 'border-gray-200';
      default:
        return 'border-gray-200';
    }
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    if (type === 'task') {
      return (
        <div className="mt-2 text-sm">
          {metadata.dueDate && (
            <div className="text-gray-500">
              {settings?.language === "en" ? "Due date: " : "Fälligkeitsdatum: "}
              {format(new Date(metadata.dueDate), "PPp", {
                locale: settings?.language === "en" ? undefined : de,
              })}
            </div>
          )}
          {metadata.status === 'completed' && (
            <div className="text-green-600">
              {settings?.language === "en" ? "Completed" : "Abgeschlossen"}
            </div>
          )}
          {metadata.status === 'cancelled' && (
            <div className="text-red-600">
              {settings?.language === "en" ? "Cancelled" : "Abgebrochen"}
            </div>
          )}
        </div>
      );
    }

    if (type === 'file_upload') {
      return (
        <div className="mt-2 text-sm text-gray-500">
          <div>{metadata.fileName}</div>
          <div>{Math.round(metadata.fileSize / 1024)} KB</div>
        </div>
      );
    }

    if (type === 'phase_change' && metadata.oldPhase && metadata.newPhase) {
      return (
        <div className="mt-2 text-sm text-gray-500">
          <div>
            {settings?.language === "en" ? "From: " : "Von: "}
            {metadata.oldPhase}
          </div>
          <div>
            {settings?.language === "en" ? "To: " : "Zu: "}
            {metadata.newPhase}
          </div>
        </div>
      );
    }

    return null;
  };

  const formattedDate = timestamp ? format(new Date(timestamp), "PPp", {
    locale: settings?.language === "en" ? undefined : de,
  }) : "";

  return (
    <div className={`p-4 border rounded-lg ${getBorderColor()} bg-white`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-500">
          {formattedDate}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {renderContent()}
      {renderMetadata()}
    </div>
  );
};