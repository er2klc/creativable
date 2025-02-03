import { Check, Trash2, Edit } from "lucide-react";

interface AppointmentCardProps {
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
  onEdit?: () => void;
}

export const AppointmentCard = ({
  content,
  metadata,
  isCompleted,
  onDelete,
  onEdit
}: AppointmentCardProps) => {
  return (
    <div className="relative group">
      <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        <div className="font-medium">{content}</div>
        {metadata?.meetingType && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {metadata.meetingType}
          </div>
        )}
        {metadata?.dueDate && (
          <div className="text-sm text-gray-600">
            {new Date(metadata.dueDate).toLocaleString('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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