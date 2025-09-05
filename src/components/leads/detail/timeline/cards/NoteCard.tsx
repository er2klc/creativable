import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NoteCardEdit } from "./NoteCardEdit";
import { NoteCardView } from "./NoteCardView";
import { DeleteNoteDialog } from "./DeleteNoteDialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface NoteCardProps {
  id: string;
  content: string;
  metadata?: {
    last_edited_at?: string;
  };
}

export const NoteCard = ({ id, content, metadata }: NoteCardProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      toast.success(
        settings?.language === "en"
          ? "Note deleted successfully"
          : "Notiz erfolgreich gelöscht"
      );
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting note"
          : "Fehler beim Löschen der Notiz"
      );
    },
  });

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

  const handleDelete = () => {
    deleteNoteMutation.mutate();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleStartRecording = () => {
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
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
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

  const handleStopRecording = () => {
    if ((window as any).recognition) {
      (window as any).recognition.stop();
    }
    setIsRecording(false);
  };

  if (isEditing) {
    return (
      <>
        <NoteCardEdit
          editedContent={editedContent}
          setEditedContent={setEditedContent}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={() => setShowDeleteDialog(true)}
          isRecording={isRecording}
          isSaving={isSaving}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        <DeleteNoteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <NoteCardView
        content={content}
        onEdit={() => setIsEditing(true)}
      />
      <DeleteNoteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};