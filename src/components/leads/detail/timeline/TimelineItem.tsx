import { cn } from "@/lib/utils";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle, ListTodo, FileText, User, Diamond, Trophy, Gem, Star, Edit } from "lucide-react";
import { de } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";
import { useState } from "react";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TimelineItem = ({ item, onDelete, onEdit }: TimelineItemProps) => {
  const { settings } = useSettings();
  const isGerman = settings?.language !== "en";
  const [showPreview, setShowPreview] = useState(false);

  const getIcon = () => {
    if (item.metadata?.type === 'status_change') {
      const bgColor = getIconBackgroundColor();
      switch (item.metadata?.icon) {
        case 'Diamond':
          return <Diamond className="h-4 w-4 text-white" />;
        case 'Trophy':
          return <Trophy className="h-4 w-4 text-white" />;
        case 'Gem':
          return <Gem className="h-4 w-4 text-white" />;
        case 'Star':
          return <Star className="h-4 w-4 text-white" />;
        default:
          return <User className="h-4 w-4 text-white" />;
      }
    }

    switch (item.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-white" />;
      case 'task':
        return <ListTodo className="h-4 w-4 text-white" />;
      case 'file_upload':
        return <FileText className="h-4 w-4 text-white" />;
      case 'contact_created':
        return <User className="h-4 w-4 text-white" />;
      default:
        return <User className="h-4 w-4 text-white" />;
    }
  };

  const getIconBackgroundColor = () => {
    if (item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'bg-[#4CAF50]';
        case 'customer':
          return 'bg-[#2196F3]';
        case 'not_for_now':
          return 'bg-[#FFC107]';
        case 'no_interest':
          return 'bg-[#F44336]';
        default:
          return 'bg-gray-500';
      }
    }

    switch (item.type) {
      case 'task':
        return item.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
      case 'appointment':
        return 'bg-orange-500';
      case 'note':
        return 'bg-yellow-500';
      case 'phase_change':
        return 'bg-purple-500';
      case 'message':
        return 'bg-blue-500';
      case 'file_upload':
        return 'bg-cyan-500';
      case 'contact_created':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
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
      case 'file_upload':
        return 'border-cyan-500';
      case 'contact_created':
        return 'border-emerald-500';
      default:
        return 'border-gray-500';
    }
  };

  const handleFileClick = () => {
    if (item.type === 'file_upload' && item.metadata?.filePath) {
      setShowPreview(true);
    }
  };

  return (
    <div className="relative pl-8">
      <div
        className={cn(
          "absolute left-0 p-2 rounded-full",
          getIconBackgroundColor()
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
        <div 
          className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} relative group cursor-pointer`}
          onClick={handleFileClick}
        >
          <p className="text-sm pr-16">{item.content}</p>
          {item.type === 'file_upload' && item.metadata?.filePath && (
            <div className="mt-2">
              <img 
                src={item.metadata.previewPath || item.metadata.filePath} 
                alt={item.content}
                className="max-h-32 rounded-lg object-contain"
              />
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {item.type === 'note' && onEdit && (
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
        </div>
      </div>

      {item.type === 'file_upload' && item.metadata?.filePath && (
        <DocumentPreview
          document={{
            name: item.metadata.fileName || item.content,
            url: item.metadata.filePath,
            file_type: item.metadata.fileType,
          }}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  );
};