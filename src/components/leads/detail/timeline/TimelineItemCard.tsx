import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Save, X, Trash2, Edit, Mic, Calendar, Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";

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
      return <Phone className="h-4 w-4 text-gray-600" />;
    case "on_site":
      return <MapPin className="h-4 w-4 text-gray-600" />;
    case "zoom":
      return <Video className="h-4 w-4 text-gray-600" />;
    case "initial_meeting":
      return <Users className="h-4 w-4 text-gray-600" />;
    case "presentation":
      return <BarChart className="h-4 w-4 text-gray-600" />;
    case "follow_up":
      return <RefreshCw className="h-4 w-4 text-gray-600" />;
    default:
      return <Calendar className="h-4 w-4 text-gray-600" />;
  }
};

const formatDateTime = (dateString: string, language: string = 'de') => {
  const date = new Date(dateString);
  return format(date, "EEE'.' dd'.' MMM'.' yyyy HH:mm 'Uhr'", { 
    locale: language === 'en' ? undefined : de 
  });
};

interface TimelineItemCardProps {
  type: string;
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
  const [showPreview, setShowPreview] = useState(false);

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

    if (type === 'task' && metadata?.meetingType) {
      return (
        <div className="relative group">
          <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
            <div className="font-medium">{content}</div>
            {metadata.meetingType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getMeetingTypeIcon(metadata.meetingType)}
                {getMeetingTypeLabel(metadata.meetingType)}
              </div>
            )}
            {metadata.dueDate && (
              <div className="text-sm text-gray-600">
                {formatDateTime(metadata.dueDate, settings?.language)}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {type === 'task' && !isCompleted && (
              <button
                onClick={handleTaskComplete}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center hover:border-green-500 hover:bg-green-50">
                  <Check className="h-3 w-3 text-transparent hover:text-green-500" />
                </div>
              </button>
            )}
          </div>
        </div>
      );
    }

    if (type === 'appointment') {
      return (
        <div className="relative group">
          <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
            <div className="font-medium">{content}</div>
            {metadata?.dueDate && (
              <div className="text-sm text-gray-600">
                {formatDateTime(metadata.dueDate, settings?.language)}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDelete && (
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
    }

    if (type === 'file_upload' && metadata?.filePath) {
      const isImage = metadata.fileType?.toLowerCase().match(/^(image\/jpeg|image\/png|image\/gif|image\/webp)$/);
      
      if (isImage) {
        const imageUrl = supabase.storage
          .from('documents')
          .getPublicUrl(metadata.filePath).data.publicUrl;

        return (
          <div className="relative group">
            <div 
              className="cursor-pointer" 
              onClick={() => setShowPreview(true)}
            >
              <div className={`whitespace-pre-wrap break-words ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {content}
              </div>
              <img 
                src={imageUrl} 
                alt={content}
                className="mt-2 max-h-32 rounded-lg object-contain"
              />
            </div>
            {showPreview && (
              <DocumentPreview
                document={{
                  name: content,
                  url: imageUrl,
                  file_type: metadata.fileType
                }}
                open={showPreview}
                onOpenChange={setShowPreview}
              />
            )}
          </div>
        );
      }
    }

    return (
      <div className="relative group">
        <div className={`whitespace-pre-wrap break-words ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {content}
        </div>
        <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {type === 'task' && !isCompleted && (
            <button
              onClick={handleTaskComplete}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center hover:border-green-500 hover:bg-green-50">
                <Check className="h-3 w-3 text-transparent hover:text-green-500" />
              </div>
            </button>
          )}
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
