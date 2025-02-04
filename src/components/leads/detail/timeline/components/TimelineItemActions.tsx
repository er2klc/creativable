import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TimelineItemActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  type: string;
}

export const TimelineItemActions = ({ onEdit, onDelete, type }: TimelineItemActionsProps) => {
  const showEdit = ['note', 'task', 'appointment'].includes(type);
  
  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
        </Button>
      )}
    </div>
  );
};