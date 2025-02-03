import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Save, X, Mic } from "lucide-react";

interface NoteCardProps {
  id: string;
  content: string;
  metadata?: {
    last_edited_at?: string;
  };
  onDelete?: () => void;
}

export const NoteCard = ({ id, content, metadata, onDelete }: NoteCardProps) => {
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          content: editedContent,
          metadata: {
            ...metadata,
            last_edited_at: new Date().toISOString()
          }
        })
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

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error(
        settings?.language === "en"
          ? "Speech recognition is not supported in your browser"
          : "Spracherkennung wird in Ihrem Browser nicht unterstützt"
      );
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings?.language === "en" ? 'en-US' : 'de-DE';

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
    return recognition;
  };

  const stopRecording = () => {
    if ((window as any).recognition) {
      (window as any).recognition.stop();
    }
    setIsRecording(false);
  };

  if (isEditing) {
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
            onClick={() => {
              setIsEditing(false);
              setEditedContent(content);
            }}
          >
            <X className="h-4 w-4 mr-1" />
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || editedContent.trim() === content.trim()}
          >
            <Save className="h-4 w-4 mr-1" />
            {settings?.language === "en" ? "Save" : "Speichern"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "bg-red-50 text-red-600" : ""}
          >
            <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};