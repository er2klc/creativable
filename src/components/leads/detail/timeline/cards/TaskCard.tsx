import { useState } from "react";
import { Check, Trash2, Edit, Calendar } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { TaskEditForm } from "./TaskEditForm";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TaskCardProps {
  id: string;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: string;
    completedAt?: string;
    color?: string;
  };
  isCompleted?: boolean;
  onDelete?: () => void;
  onComplete?: () => void;
}

export const TaskCard = ({
  id,
  content,
  metadata,
  isCompleted,
  onDelete,
  onComplete
}: TaskCardProps) => {
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <TaskEditForm
        id={id}
        title={content}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="relative group bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        <div className="font-medium">{content}</div>
        {metadata?.meetingType && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MeetingTypeIcon type={metadata.meetingType} className="h-4 w-4" />
            <span>{metadata.meetingType}</span>
          </div>
        )}
        {metadata?.dueDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(metadata.dueDate), "dd. MMM yyyy", {
                locale: settings?.language === "en" ? undefined : de
              })}
            </span>
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};