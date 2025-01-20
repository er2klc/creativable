import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";
import { Eye, Download, Trash, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { formatDate } from "./TimelineUtils";

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    color?: string;
    oldPhase?: string;
    newPhase?: string;
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
  };
  status?: string;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ type, content, metadata, status, onDelete }: TimelineItemCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getBorderColor = () => {
    switch (type) {
      case 'contact_created':
        return 'border-green-500';
      case 'message':
        return 'border-blue-500';
      case 'task':
        return status === 'completed' ? 'border-green-500' : 'border-cyan-500';
      case 'appointment':
        if (status === 'cancelled' || metadata?.status === 'outdated') {
          return 'border-gray-400';
        }
        return 'border-orange-500';
      case 'note':
        return 'border-yellow-500';
      case 'phase_change':
        return 'border-purple-500';
      case 'file_upload':
        return 'border-gray-500';
      default:
        return 'border-gray-500';
    }
  };

  const handleDownload = async () => {
    if (metadata?.filePath) {
      try {
        const { data, error } = await supabase.storage
          .from('lead-files')
          .download(metadata.filePath);
        
        if (error) throw error;
        
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = metadata.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Error downloading file');
      }
    }
  };

  const isOutdated = type === 'appointment' && 
    (status === 'cancelled' || metadata?.status === 'outdated');

  return (
    <div className={cn(
      "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border group relative",
      getBorderColor(),
      isOutdated && "opacity-70"
    )}>
      <div className={cn(
        "font-medium mb-1",
        isOutdated && "text-gray-400"
      )}>{content}</div>
      
      {metadata?.dueDate && !isOutdated && (
        <div className="text-sm text-gray-500">
          Fällig am: {formatDate(metadata.dueDate)}
        </div>
      )}

      {metadata?.oldDate && metadata?.newDate && (
        <div className="text-sm">
          <div className="text-gray-400">
            Alter Termin: {formatDate(metadata.oldDate)}
          </div>
          <div className="text-blue-600">
            Neuer Termin: {formatDate(metadata.newDate)}
          </div>
        </div>
      )}

      {metadata?.completedAt && (
        <div className="text-sm text-green-600">
          Erledigt am: {formatDate(metadata.completedAt)}
        </div>
      )}

      {metadata?.cancelledAt && (
        <div className="text-sm text-red-600">
          Verschoben am: {formatDate(metadata.cancelledAt)}
        </div>
      )}

      {type === 'file_upload' && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Preview"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 hover:bg-gray-100 rounded"
              title="Delete"
            >
              <Trash className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && metadata?.filePath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
            {metadata.fileType?.startsWith('image/') ? (
              <img
                src={`${supabase.storage.from('lead-files').getPublicUrl(metadata.filePath).data.publicUrl}`}
                alt={metadata.fileName}
                className="max-w-full h-auto"
              />
            ) : (
              <div className="p-4 text-center">
                Preview not available for this file type
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};