import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";
import { NoteCard } from "./cards/NoteCard";
import { TaskCard } from "./cards/TaskCard";
import { AppointmentCard } from "./cards/AppointmentCard";
import { FileCard } from "./cards/FileCard";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";

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

  const getBorderColor = () => {
    if (type === 'phase_change' && metadata?.type === 'status_change') {
      switch(metadata.newStatus) {
        case 'partner':
          return 'border-[#8B5CF6]';
        case 'customer':
          return 'border-[#D946EF]';
        case 'not_for_now':
          return 'border-[#F2FCE2]';
        case 'no_interest':
          return 'border-[#ea384c]';
        default:
          return 'border-gray-500';
      }
    }

    switch (type) {
      case 'task':
        return status === 'completed' ? 'border-green-500' : 'border-cyan-500';
      case 'appointment':
        return status === 'cancelled' ? 'border-red-500' : 'border-indigo-600';
      case 'note':
        return 'border-yellow-500';
      case 'phase_change':
        return 'border-purple-500';
      case 'message':
        return 'border-blue-500';
      case 'file_upload':
        return 'border-cyan-500';
      case 'contact_created':
        return 'border-emerald-500';
      default:
        return 'border-gray-200';
    }
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

  const renderContent = () => {
    return (
      <>
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
        {renderMetadata()}
      </>
    );
  };

  if (type === 'task' && id) {
    return (
      <TaskCard
        id={id}
        content={content}
        metadata={metadata}
        isCompleted={isCompleted}
        onDelete={onDelete}
        onComplete={onDelete}
      />
    );
  }

  if (type === 'appointment') {
    return (
      <AppointmentCard
        content={content}
        metadata={metadata}
        isCompleted={isCompleted}
        onDelete={onDelete}
      />
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

  if (type === 'note' && id) {
    return (
      <NoteCard
        id={id}
        content={content}
        metadata={metadata}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} group relative`}>
      {renderContent()}
    </div>
  );
};