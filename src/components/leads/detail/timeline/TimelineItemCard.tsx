import { useSettings } from "@/hooks/use-settings";
import { NoteCard } from "./cards/NoteCard";
import { TaskCard } from "./cards/TaskCard";
import { FileCard } from "./cards/FileCard";
import { AppointmentCard } from "./cards/AppointmentCard";
import { MetadataDisplay } from "./cards/MetadataDisplay";
import { DeleteButton } from "./cards/DeleteButton";
import { TimelineItemType } from "./TimelineUtils";

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
    phase?: string;
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
    if (type === 'status_change' && metadata?.newStatus) {
      switch(metadata.newStatus) {
        case 'partner':
          return 'border-[#8B5CF6]';
        case 'customer':
          return 'border-[#FEC6A1]';
        case 'not_for_now':
          return 'border-[#8E9196]';
        case 'no_interest':
          return 'border-[#ea384c]';
        default:
          return 'border-gray-200';
      }
    }

    if (status === 'completed') return 'border-green-500';
    if (status === 'cancelled') return 'border-red-500';
    if (type === 'phase_change') return 'border-blue-500';
    if (type === 'note') return 'border-yellow-400';
    if (type === 'message') return 'border-purple-500';
    if (type === 'appointment') return 'border-indigo-500';
    if (type === 'task') return 'border-orange-500';
    if (type === 'file_upload') return 'border-cyan-500';
    if (type === 'contact_created') return 'border-emerald-500';
    return 'border-gray-200';
  };

  const renderStatusChangeContent = () => {
    if (type === 'status_change' && metadata?.newStatus) {
      let statusText = '';
      switch(metadata.newStatus) {
        case 'partner':
          statusText = `Status zu Partner geändert${metadata.phase ? ` - Phase: ${metadata.phase}` : ''}`;
          break;
        case 'customer':
          statusText = 'Status zu Kunde geändert';
          break;
        case 'not_for_now':
          statusText = 'Status zu Not For Now geändert';
          break;
        case 'no_interest':
          statusText = 'Status zu Kein Interesse geändert';
          break;
      }
      return (
        <div className="relative group">
          <div className="whitespace-pre-wrap break-words">
            {statusText}
          </div>
          {onDelete && <DeleteButton onDelete={onDelete} />}
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    const statusChangeContent = renderStatusChangeContent();
    if (statusChangeContent) return statusChangeContent;

    if (type === 'task' && id) {
      return (
        <TaskCard
          id={id}
          content={content}
          metadata={metadata}
          isCompleted={isCompleted}
          onDelete={onDelete}
        />
      );
    }

    if (type === 'appointment' && id) {
      return (
        <AppointmentCard
          id={id}
          content={content}
          metadata={metadata}
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
      <div className="relative group">
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
    );
  };

  return (
    <div className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} group relative`}>
      {renderContent()}
      <MetadataDisplay 
        last_edited_at={metadata?.last_edited_at}
        created_at={created_at}
      />
    </div>
  );
};