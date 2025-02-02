import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  MessageCircle,
  Phone,
  Save,
  Trash2,
  Video,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "./utils/dateUtils";
import { cn } from "@/lib/utils";

interface TimelineItemCardProps {
  type: string;
  content: string;
  metadata?: any;
  id: string;
  onDelete?: () => void;
  created_at: string;
  isCompleted?: boolean;
}

const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call":
      return <Phone className="h-4 w-4" />;
    case "video_call":
      return <Video className="h-4 w-4" />;
    case "in_person":
      return <Users className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getMeetingTypeLabel = (type: string, settings: any) => {
  switch (type) {
    case "phone_call":
      return settings?.language === "en" ? "Phone Call" : "Telefongespräch";
    case "video_call":
      return settings?.language === "en" ? "Video Call" : "Videogespräch";
    case "in_person":
      return settings?.language === "en" ? "In Person" : "Persönliches Treffen";
    default:
      return type;
  }
};

export const TimelineItemCard = ({
  type,
  content,
  metadata,
  id,
  onDelete,
  created_at,
  isCompleted
}: TimelineItemCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const { settings } = useSettings();

  const handleEdit = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("timeline_items")
        .update({ content: editedContent })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        settings?.language === "en" 
          ? "Item updated successfully" 
          : "Element erfolgreich aktualisiert"
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        settings?.language === "en" 
          ? "Error updating item" 
          : "Fehler beim Aktualisieren des Elements"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    const items = [];

    if (metadata.dueDate) {
      items.push(
        <div key="due-date" className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatDateTime(metadata.dueDate)}</span>
        </div>
      );
    }

    if (metadata.meetingType) {
      items.push(
        <div key="meeting-type" className="flex items-center gap-2 text-sm text-gray-600">
          {getMeetingTypeIcon(metadata.meetingType)}
          <span>{getMeetingTypeLabel(metadata.meetingType, settings)}</span>
        </div>
      );
    }

    return items.length > 0 ? <div className="mt-2 space-y-1">{items}</div> : null;
  };

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 mb-4 shadow-sm",
      isCompleted && "opacity-50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getMeetingTypeIcon(type)}
          <span className="ml-2 font-semibold">{getMeetingTypeLabel(type, settings)}</span>
        </div>
        <span className="text-sm text-gray-500">{formatDateTime(created_at)}</span>
      </div>
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="mt-2"
        />
      ) : (
        <p className="mt-2">{content}</p>
      )}
      {renderMetadata()}
      <div className="flex justify-end mt-4">
        {isEditing ? (
          <>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? (
                settings?.language === "en" ? "Saving..." : "Speichert..."
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)} 
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} className="mr-2">
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};