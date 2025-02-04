import { cn } from "@/lib/utils";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle, Calendar, FileText, User, Diamond, Trophy, Gem, Star } from "lucide-react";
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
      switch (item.metadata?.icon) {
        case 'Diamond':
          return <Diamond className="h-4 w-4" />;
        case 'Trophy':
          return <Trophy className="h-4 w-4" />;
        case 'Gem':
          return <Gem className="h-4 w-4" />;
        case 'Star':
          return <Star className="h-4 w-4" />;
        default:
          return <User className="h-4 w-4" />;
      }
    }

    switch (item.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'task':
        return <Calendar className="h-4 w-4" />;
      case 'file_upload':
        return <FileText className="h-4 w-4" />;
      case 'contact_created':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
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
          item.metadata?.type === 'status_change' ? item.color : 'bg-gray-100'
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
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()}`}>
          <p className="text-sm">{item.content}</p>
        </div>
      </div>
    </div>
  );
};