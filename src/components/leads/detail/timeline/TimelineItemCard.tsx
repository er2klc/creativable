import { useState } from "react";
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
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./components/TaskCard";
import { FileCard } from "./components/FileCard";
import { formatDateTime } from "./utils/dateUtils";
import { cn } from "@/lib/utils";

interface TimelineItemCardProps {
  type: string;
  content: string;
  metadata: any;
  id: string;
  onDelete: () => void;
  created_at: string;
  isCompleted: boolean;
}

export const TimelineItemCard = ({ 
  type,
  content,
  metadata,
  id,
  onDelete,
  created_at,
  isCompleted
}: TimelineItemCardProps) => {
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("timeline_items")
        .update({ content: editedContent })
        .eq("id", id);

      if (error) throw error;

      toast.success(settings?.language === "en" ? "Item updated successfully" : "Element erfolgreich aktualisiert");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(settings?.language === "en" ? "Error updating item" : "Fehler beim Aktualisieren des Elements");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    onDelete();
  };

  const getMeetingTypeLabel = (type: string) => {
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

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "phone_call":
        return Phone;
      case "video_call":
        return Video;
      case "in_person":
        return Users;
      default:
        return Calendar;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getMeetingTypeIcon(type)({ className: "h-5 w-5" })}
          <span className="ml-2 font-semibold">{getMeetingTypeLabel(type)}</span>
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
      <div className="flex justify-end mt-4">
        {isEditing ? (
          <>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="ml-2">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} className="mr-2">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
