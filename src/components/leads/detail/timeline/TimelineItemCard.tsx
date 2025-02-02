import { CalendarDays, FileText, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimelineItemType, TimelineItemStatus } from "../types/lead";
import { TaskCard } from "./components/TaskCard";
import { AppointmentCard } from "./components/AppointmentCard";
import { FileCard } from "./components/FileCard";
import { formatDateTime } from "./utils/dateUtils";

const getMeetingTypeLabel = (type: string): string => {
  switch (type) {
    case "phone_call":
      return "Telefongespräch";
    case "on_site":
      return "Vor-Ort-Termin";
    case "zoom":
      return "Zoom Meeting";
    case "initial_meeting":
      return "Erstgespräch";
    case "presentation":
      return "Präsentation";
    case "follow_up":
      return "Folgetermin";
    default:
      return type;
  }
};

export interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: TimelineItemStatus;
    meetingType?: string;
    color?: string;
    oldStatus?: string;
    newStatus?: string;
    oldPhase?: string;
    newPhase?: string;
    type?: string;
  };
  date: string;
  isCompleted: boolean;
}

export const TimelineItemCard = ({
  type,
  content,
  metadata,
  date,
  isCompleted
}: TimelineItemCardProps) => {
  const renderIcon = () => {
    switch (type) {
      case "task":
        return <CalendarDays className="h-5 w-5" />;
      case "appointment":
        return <Phone className="h-5 w-5" />;
      case "file_upload":
      case "file":
        return <FileText className="h-5 w-5" />;
      case "phase_change":
      case "status_change":
        return <MessageCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: TimelineItemStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderMetadata = () => {
    switch (type) {
      case "task":
        return (
          <TaskCard
            title={content}
            status={metadata?.status}
            color={metadata?.color}
            date={metadata?.dueDate}
          />
        );
      case "appointment":
        return (
          <AppointmentCard
            title={content}
            type={metadata?.meetingType ? getMeetingTypeLabel(metadata.meetingType) : undefined}
            date={metadata?.dueDate}
          />
        );
      case "file_upload":
      case "file":
        return (
          <FileCard
            name={metadata?.fileName}
            type={metadata?.fileType}
            size={metadata?.fileSize}
            path={metadata?.filePath}
          />
        );
      case "phase_change":
      case "status_change":
        return (
          <div className="mt-2">
            <Badge variant="outline">
              {metadata?.oldStatus} → {metadata?.newStatus}
            </Badge>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border bg-card p-4",
        isCompleted && "opacity-60"
      )}
    >
      <div className="mt-1">{renderIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{content}</div>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(date)}
          </div>
        </div>
        {renderMetadata()}
      </div>
    </div>
  );
};