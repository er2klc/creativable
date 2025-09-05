
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { NoteCard } from "./cards/NoteCard";
import { TaskCard } from "./cards/TaskCard";
import { FileCard } from "./cards/FileCard";
import { AppointmentCard } from "./cards/AppointmentCard";
import { MetadataDisplay } from "./cards/MetadataDisplay";
import { DeleteButton } from "./cards/DeleteButton";
import { StatusCard } from "./cards/StatusCard";
import { NexusTimelineCard } from "./cards/NexusTimelineCard";
import { CallScriptCard } from "./cards/CallScriptCard";
import { MessageTemplateCard } from "./cards/MessageTemplateCard";

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
    script_type?: string;
    message_type?: string;
    platform?: string;
    phase?: {
      id: string;
      name: string;
    };
    analysis?: {
      social_media_bio?: string;
      hashtags?: string[];
      engagement_metrics?: {
        followers?: number;
        engagement_rate?: number;
      };
    };
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

  // If this is a phase analysis, use the NexusTimelineCard
  if (metadata?.type === 'phase_analysis') {
    return (
      <NexusTimelineCard
        content={content}
        metadata={{
          type: metadata?.type || 'phase_analysis',
          analysis_type: metadata?.type,
          completed: false,
          completed_at: metadata?.completedAt,
          phase: metadata?.phase,
          phaseInfo: {
            position: '1',
            index: 0,
            total: 1,
            positionLabel: 'Phase 1'
          },
          timestamp: created_at,
          analysis: metadata?.analysis
        }}
        onDelete={onDelete}
      />
    );
  }

  // For call scripts
  if (metadata?.type === 'call_script') {
    return (
      <CallScriptCard
        content={content}
        scriptType={metadata.script_type || 'introduction'}
        created_at={created_at}
        onDelete={onDelete}
      />
    );
  }

  // For message templates
  if (metadata?.type === 'message_template') {
    return (
      <MessageTemplateCard
        content={content}
        messageType={metadata.message_type || 'introduction'}
        platform={metadata.platform || 'Generic'}
        created_at={created_at}
        onDelete={onDelete}
      />
    );
  }

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

    // Fallback-Farben für andere Typen
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

  const renderContent = () => {
    // Separate case for appointments
    if (type === "appointment" && id) {
      return (
        <AppointmentCard
          id={id}
          content={content}
          metadata={metadata}
          onDelete={onDelete}
        />
      );
    }

    if (type === "task" && id) {
      return (
        <TaskCard
          id={id}
          content={content}
          metadata={metadata}
          isCompleted={isCompleted}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      );
    }

    if (type === "file_upload") {
      return <FileCard content={content} metadata={metadata} />;
    }

    if (type === "note" && id) {
        return (
          <NoteCard 
            id={id}
            content={content}
            metadata={metadata}
          />
        );
    }

    if (type === "status_change") {
      return (
        <StatusCard
          content={content}
          timestamp={metadata?.timestamp || new Date().toISOString()}
          metadata={metadata}
          onDelete={onDelete ? () => onDelete() : undefined}
        />
      );
    }

    // For phase_change and other types
    return (
      <div className="relative group">
        <div className="flex items-center">
          {metadata?.emoji && (
            <span className="mr-2">{metadata.emoji}</span>
          )}
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
    );
  };

  return (
    <div
      className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-sm border ${getBorderColor()} group relative`}
    >
      {renderContent()}
      <MetadataDisplay
        last_edited_at={metadata?.last_edited_at}
        created_at={created_at}
      />
    </div>
  );
};
