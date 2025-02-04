import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TimelineItemType } from "../TimelineUtils";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";
import { useState } from "react";

interface TimelineItemContentProps {
  item: TimelineItemType;
  isGerman: boolean;
}

export const TimelineItemContent = ({ item, isGerman }: TimelineItemContentProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleFileClick = () => {
    if (item.type === 'file_upload' && item.metadata?.filePath) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {format(new Date(item.timestamp), isGerman ? "dd.MM.yyyy HH:mm" : "MMM d, yyyy HH:mm", {
            locale: isGerman ? de : undefined
          })}
        </span>
      </div>
      <div 
        className="whitespace-pre-wrap break-words"
        onClick={handleFileClick}
      >
        {item.content}
        {item.type === 'file_upload' && item.metadata?.filePath && (
          <div className="mt-2">
            <img 
              src={item.metadata.previewPath || item.metadata.filePath} 
              alt={item.content}
              className="max-h-32 rounded-lg object-contain"
            />
          </div>
        )}
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
    </>
  );
};