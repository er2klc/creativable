import { Check, Trash2, Edit } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";
import { MEETING_TYPES } from "@/constants/meetingTypes";

interface TaskCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: 'completed' | 'cancelled' | 'outdated';
  };
  isCompleted?: boolean;
  onDelete?: () => void;
  onComplete?: () => void;
  isEditing?: boolean;
  onEdit?: () => void;
}

const getMeetingTypeLabel = (meetingType?: string) => {
  if (!meetingType) return null;
  const meetingTypeObj = MEETING_TYPES.find(type => type.value === meetingType);
  return meetingTypeObj?.label;
};

export const TaskCard = ({
  content,
  metadata,
  isCompleted,
  onDelete,
  onComplete,
  isEditing,
  onEdit
}: TaskCardProps) => {
  const { settings } = useSettings();

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
        {!isCompleted && onComplete && (
          <button
            onClick={onComplete}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center hover:border-green-500 hover:bg-green-50">
              <Check className="h-3 w-3 text-transparent hover:text-green-500" />
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
};