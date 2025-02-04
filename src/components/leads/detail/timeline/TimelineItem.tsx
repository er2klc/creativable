import { cn } from "@/lib/utils";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle, Calendar, FileText, User, Diamond, Trophy, Gem, Star, Edit } from "lucide-react";
import { de } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const { settings } = useSettings();
  const isGerman = settings?.language !== "en";

  const getIcon = () => {
    if (item.metadata?.type === 'status_change') {
      const color = getIconColor();
      switch (item.metadata?.icon) {
        case 'Diamond':
          return <Diamond className={`h-4 w-4 ${color}`} />;
        case 'Trophy':
          return <Trophy className={`h-4 w-4 ${color}`} />;
        case 'Gem':
          return <Gem className={`h-4 w-4 ${color}`} />;
        case 'Star':
          return <Star className={`h-4 w-4 ${color}`} />;
        default:
          return <User className={`h-4 w-4 ${color}`} />;
      }
    }

    switch (item.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'task':
        return <Calendar className={`h-4 w-4 ${item.status === 'completed' ? 'text-green-500' : 'text-cyan-500'}`} />;
      case 'file_upload':
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case 'contact_created':
        return <User className="h-4 w-4 text-emerald-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIconColor = () => {
    if (item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'text-[#4CAF50]';
        case 'customer':
          return 'text-[#2196F3]';
        case 'not_for_now':
          return 'text-[#FFC107]';
        case 'no_interest':
          return 'text-[#F44336]';
        default:
          return 'text-gray-500';
      }
    }
    return '';
  };

  const getBorderColor = () => {
    if (item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'border-[#4CAF50]';
        case 'customer':
          return 'border-[#2196F3]';
        case 'not_for_now':
          return 'border-[#FFC107]';
        case 'no_interest':
          return 'border-[#F44336]';
        default:
          return 'border-gray-500';
      }
    }

    switch (item.type) {
      case 'task':
        return item.status === 'completed' ? 'border-green-500' : 'border-cyan-500';
      case 'appointment':
        return 'border-orange-500';
      case 'note':
        return 'border-yellow-500';
      case 'phase_change':
        return 'border-purple-500';
      case 'message':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="relative pl-8">
      <div
        className={cn(
          "absolute left-0 p-2 rounded-full",
          item.metadata?.type === 'status_change' ? 'bg-gray-100' : 'bg-gray-100'
        )}
      >
        {getIcon()}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {format(new Date(item.timestamp), isGerman ? "dd.MM.yyyy HH:mm" : "MMM d, yyyy HH:mm", {
              locale: isGerman ? de : undefined
            })}
          </span>
        </div>
        <div className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} relative group`}>
          <p className="text-sm pr-16">{item.content}</p>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {item.type === 'note' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};