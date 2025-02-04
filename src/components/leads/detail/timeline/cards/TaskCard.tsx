import { useState } from "react";
import { Check, Edit } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";
import { MEETING_TYPES } from "@/constants/meetingTypes";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface TaskCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: string;
    completedAt?: string;
    color?: string;
  };
  isCompleted?: boolean;
  onComplete?: () => void;
  isEditing?: boolean;
  onEdit?: () => void;
}

const getMeetingTypeLabel = (meetingType?: string) => {
  if (!meetingType) return null;
  const meetingTypeObj = MEETING_TYPES.find(type => type.value === meetingType);
  if (!meetingTypeObj) return null;
  
  return (
    <div className="flex items-center gap-2">
      <MeetingTypeIcon iconName={meetingTypeObj.iconName} />
      <span>{meetingTypeObj.label}</span>
    </div>
  );
};

export const TaskCard = ({
  content,
  metadata,
  isCompleted,
  onComplete,
  isEditing,
  onEdit
}: TaskCardProps) => {
  const { settings } = useSettings();
  const [editedContent, setEditedContent] = useState(content);

  const handleComplete = () => {
    if (!isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#98FB98', '#87CEEB'],
      });
      toast.success(
        settings?.language === "en" 
          ? "Task completed! 🎉" 
          : "Aufgabe erledigt! 🎉"
      );
    }
    if (onComplete) {
      onComplete();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Input
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Check className="h-4 w-4 text-green-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        <div className="font-medium">{content}</div>
        {metadata?.meetingType && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getMeetingTypeLabel(metadata.meetingType)}
          </div>
        )}
        {metadata?.dueDate && (
          <div className="text-sm text-gray-600">
            {formatDateTime(metadata.dueDate, settings?.language)}
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onComplete && (
          <button
            onClick={handleComplete}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <div className={`w-4 h-4 border border-gray-400 rounded flex items-center justify-center ${isCompleted ? 'bg-green-500 border-green-500' : ''} hover:border-green-500 hover:bg-green-50`}>
              {isCompleted && <Check className="h-3 w-3 text-white" />}
            </div>
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};