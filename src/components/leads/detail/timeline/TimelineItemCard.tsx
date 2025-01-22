import { Button } from "@/components/ui/button";
import { TimelineItemType, TimelineItemStatus } from "./types";
import { X } from "lucide-react";

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    status?: TimelineItemStatus;
    oldPhase?: string;
    newPhase?: string;
    meetingType?: string;
    color?: string;
  };
  status?: TimelineItemStatus;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ 
  type,
  content,
  metadata,
  status,
  onDelete 
}: TimelineItemCardProps) => {
  return (
    <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border relative group">
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="pr-8">
        <p className="text-sm text-gray-600">{content}</p>
        
        {metadata?.dueDate && (
          <p className="text-sm text-gray-500 mt-2">
            Fällig am: {new Date(metadata.dueDate).toLocaleDateString('de-DE')}
          </p>
        )}
        
        {type === 'phase_change' && metadata?.oldPhase && metadata?.newPhase && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span>{metadata.oldPhase}</span>
            <span>→</span>
            <span>{metadata.newPhase}</span>
          </div>
        )}
        
        {metadata?.fileName && (
          <p className="text-sm text-gray-500 mt-2">
            Datei: {metadata.fileName}
          </p>
        )}
      </div>
    </div>
  );
};