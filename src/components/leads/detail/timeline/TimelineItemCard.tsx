
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface TimelineItemCardProps {
  type: string;
  content: string;
  metadata?: {
    type?: string;
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: "completed" | "cancelled" | "outdated";
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
    oldStatus?: string;
    newStatus?: string;
    last_edited_at?: string;
    meetingType?: string;
    color?: string;
    timestamp?: string;
    emoji?: string;
  };
  status?: string;
  onDelete?: () => void;
  id?: string;
  created_at?: string;
  isCompleted?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export const TimelineItemCard = ({
  type,
  content,
  metadata,
  status,
  onDelete,
  id,
  created_at,
  isCompleted,
  onToggleComplete,
}: TimelineItemCardProps) => {
  const { settings } = useSettings();

  const getBorderColor = () => {
    if (type === "status_change") {
      switch (metadata?.newStatus) {
        case "partner":
          return "border-pink-500";
        case "customer":
          return "border-sky-500";
        case "not_for_now":
          return "border-stone-500";
        case "no_interest":
          return "border-rose-500";
        case "lead":
          return "border-blue-500";
        default:
          return "border-gray-500";
      }
    }

    // Fallback colors for other types
    switch (type) {
      case "task":
        return status === "completed" ? "border-green-500" : "border-cyan-500";
      case "appointment":
        return status === "cancelled" ? "border-gray-400" : "border-orange-500";
      case "note":
        return "border-yellow-500";
      case "phase_change":
        return "border-purple-500";
      case "message":
        return "border-blue-500";
      case "contact_created":
        return "border-emerald-500";
      case "file_upload":
        return "border-blue-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <div
      className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-sm border ${getBorderColor()} group relative`}
    >
      <div className="relative group">
        <div className="flex items-center">
          {metadata?.emoji && (
            <span className="mr-2">{metadata.emoji}</span>
          )}
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};
