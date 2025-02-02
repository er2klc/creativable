import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Save, 
  X, 
  Trash2, 
  Edit, 
  Mic, 
  Phone, 
  MapPin, 
  Video, 
  Users, 
  BarChart, 
  RefreshCw,
  Calendar 
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";
import { AppointmentCard } from "./components/AppointmentCard";
import { TaskCard } from "./components/TaskCard";
import { FileCard } from "./components/FileCard";
import { formatDateTime } from "./utils/dateUtils";
import { TimelineItemType } from "./TimelineUtils";

const getMeetingTypeLabel = (type: string) => {
  switch (type) {
    case "phone_call":
      return "Telefongespräch";
    case "on_site":
      return "Vor-Ort-Termin";
    case "zoom":
      return "Zoom Meeting";
    case "initial_meeting":
      return "Erstgespräch";
    case "presentation":
      return "Präsentation";
    case "follow_up":
      return "Folgetermin";
    default:
      return type;
  }
};

const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call":
      return <Phone className="h-4 w-4" />;
    case "on_site":
      return <MapPin className="h-4 w-4" />;
    case "zoom":
      return <Video className="h-4 w-4" />;
    case "initial_meeting":
      return <Users className="h-4 w-4" />;
    case "presentation":
      return <BarChart className="h-4 w-4" />;
    case "follow_up":
      return <RefreshCw className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: 'completed' | 'cancelled' | 'outdated';
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    last_edited_at?: string;
    meetingType?: string;
    color?: string;
  };
  status?: string;
  onDelete?: () => void;
  id?: string;
  created_at?: string;
  isCompleted?: boolean;
}

export const TimelineItemCard = ({ 
  type,
  content,
  metadata,
  status,
  onDelete,
  id,
  created_at,
  isCompleted
}: TimelineItemCardProps) => {
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleTaskComplete = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(
        isCompleted
          ? (settings?.language === "en" ? "Task uncompleted" : "Aufgabe nicht erledigt")
          : (settings?.language === "en" ? "Task completed! 🎉" : "Aufgabe erledigt! 🎉")
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(
        settings?.language === "en"
          ? "Error updating task"
          : "Fehler beim Aktualisieren der Aufgabe"
      );
    }
  };

  const handleSave = async () => {
    if (!id || type !== 'note') return;
    
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

  const renderContent = () => {
    if (isEditing && type === 'note') {
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

    if (type === 'task') {
      return (
        <TaskCard
          content={content}
          metadata={metadata}
          isCompleted={isCompleted}
          onDelete={onDelete}
          onComplete={handleTaskComplete}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
        />
      );
    }

    if (type === 'appointment') {
      return (
        <div className="relative group">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {metadata?.meetingType && getMeetingTypeIcon(metadata.meetingType)}
                <span className="font-medium">{content}</span>
              </div>
              {metadata?.meetingType && (
                <div className="text-sm text-gray-600 ml-6">
                  {getMeetingTypeLabel(metadata.meetingType)}
                </div>
              )}
            </div>
            <div className="text-right">
              {metadata?.dueDate && (
                <div className="text-sm font-medium">
                  {format(new Date(metadata.dueDate), "dd. MMM yyyy", { locale: de })}
                </div>
              )}
              <div className="text-sm text-gray-600">
                {metadata?.dueDate && format(new Date(metadata.dueDate), "HH:mm 'Uhr'", { locale: de })}
              </div>
            </div>
          </div>
          {onDelete && (
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onDelete}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (type === 'file_upload') {
      return (
        <FileCard
          content={content}
          metadata={metadata}
        />
      );
    }

    return (
      <div className="relative group">
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
        <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {type === 'note' && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
            </button>
          )}
          {type === 'phase_change' && onDelete && (
            <button
              onClick={onDelete}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    if (metadata?.last_edited_at) {
      return (
        <div className="text-xs text-gray-500 mt-2">
          {settings?.language === "en" ? "Created" : "Erstellt"}: {format(new Date(created_at || ''), 'PPp', { locale: settings?.language === "en" ? undefined : de })}
          <br />
          {settings?.language === "en" ? "Last edited" : "Zuletzt bearbeitet"}: {format(new Date(metadata.last_edited_at), 'PPp', { locale: settings?.language === "en" ? undefined : de })}
        </div>
      );
    }
    
    if (type === 'task' && isCompleted && metadata?.completedAt) {
      return (
        <div className="text-xs text-gray-500 mt-2">
          {settings?.language === "en" ? "Completed" : "Erledigt"}: {format(new Date(metadata.completedAt), 'PPp', { locale: settings?.language === "en" ? undefined : de })}
        </div>
      );
    }
    return null;
  };

  const getBorderColor = () => {
    if (status === 'completed') return 'border-green-500';
    if (status === 'cancelled') return 'border-red-500';
    if (type === 'phase_change') return 'border-blue-500';
    if (type === 'note') return 'border-yellow-400';
    if (type === 'message') return 'border-purple-500';
    if (type === 'task') {
      if (metadata?.meetingType) return 'border-indigo-500';
      return 'border-orange-500';
    }
    if (type === 'file_upload') return 'border-cyan-500';
    if (type === 'contact_created') return 'border-emerald-500';
    return 'border-gray-200';
  };

  return (
    <div className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} group relative`}>
      {renderContent()}
      {renderMetadata()}
    </div>
  );
};