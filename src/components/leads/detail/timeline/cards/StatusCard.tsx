import { Heart, ThumbsDown, Clock, UserPlus } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  content: string;
  timestamp: string;
  metadata?: {
    newStatus?: string;
  };
  onDelete?: () => void;
}

export const StatusCard = ({ content, timestamp, metadata, onDelete }: StatusCardProps) => {
  const { settings } = useSettings();
  
  const getStatusIcon = () => {
    switch(metadata?.newStatus) {
      case 'partner': return <Heart className="h-4 w-4" />;
      case 'customer': return <UserPlus className="h-4 w-4" />;
      case 'not_for_now': return <Clock className="h-4 w-4" />;
      case 'no_interest': return <ThumbsDown className="h-4 w-4" />;
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch(metadata?.newStatus) {
      case 'partner': return 'bg-pink-100 text-pink-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'not_for_now': return 'bg-yellow-100 text-yellow-800';
      case 'no_interest': return 'bg-red-100 text-red-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    const status = metadata?.newStatus || 'unknown';
    return settings?.language === 'en' 
      ? `Status changed to ${status}`
      : `Status wurde zu ${status} geändert`;
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-gray-200 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-full", getStatusColor())}>
            {getStatusIcon()}
          </div>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="h-4 w-4 text-gray-500 hover:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-sm text-gray-500">
        {formatDateTime(timestamp, settings?.language)}
      </div>
    </div>
  );
};