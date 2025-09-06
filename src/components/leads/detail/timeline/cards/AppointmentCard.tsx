
import { Calendar, Edit, Trash2, Clock, MapPin, Video, PhoneCall } from "lucide-react";
import { useParams } from "react-router-dom";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { useState } from "react";
import { getMeetingTypeLabel, getMeetingTypeIcon } from "./utils/meetingTypeUtils";
import { useAppointmentNotification } from "./hooks/useAppointmentNotification";
import { TimeDisplay } from "./components/TimeDisplay";
import { format, addHours, parseISO } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface AppointmentCardProps {
  id: string;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: string;
    completedAt?: string;
    color?: string;
    duration?: number; // in minutes
  };
  onDelete?: () => void;
}

export const AppointmentCard = ({
  id,
  content,
  metadata,
  onDelete,
}: AppointmentCardProps) => {
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const { leadId } = useParams<{ leadId: string }>();
  const { settings } = useSettings();
  
  useAppointmentNotification({
    dueDate: metadata?.dueDate,
    content: content
  });

  // Get the appropriate icon component based on meeting type
  const IconComponent = metadata?.meetingType ? 
    getMeetingTypeIcon(metadata.meetingType) : 
    <Calendar className="h-4 w-4 text-blue-500" />;

  const isCancelled = metadata?.status === 'cancelled';

  // Parse date and calculate end time
  const startDate = metadata?.dueDate ? parseISO(metadata.dueDate) : new Date();
  const duration = metadata?.duration || 60; // Default 60 minutes if not specified
  const endDate = addHours(startDate, duration / 60);
  
  const locale = settings?.language === "de" ? de : enUS;
  
  const getStatusColor = () => {
    if (isCancelled) return "text-gray-400";
    if (metadata?.status === 'completed') return "text-green-500";
    
    // Default color for active appointments
    return "text-blue-600";
  };

  const getBorderClass = () => {
    if (isCancelled) return "border-gray-300";
    if (metadata?.status === 'completed') return "border-green-500";
    
    return metadata?.color ? `border-[${metadata.color}]` : "border-blue-500";
  };

  const getDateDisplay = () => {
    if (!metadata?.dueDate) return "";
    
    return format(startDate, 'EEEE, dd. MMMM yyyy', { locale });
  };

  const getTimeDisplay = () => {
    if (!metadata?.dueDate) return "";
    
    const startTime = format(startDate, 'HH:mm', { locale });
    const endTime = format(endDate, 'HH:mm', { locale });
    
    return `${startTime} - ${endTime}`;
  };

  const getMeetingIcon = () => {
    if (!metadata?.meetingType) return <Calendar className="h-5 w-5 text-blue-500" />;
    
    switch (metadata.meetingType) {
      case 'in_person':
        return <MapPin className="h-5 w-5 text-pink-500" />;
      case 'video_call':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'phone_call':
        return <PhoneCall className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <>
      <div className={cn(
        "relative group p-4 rounded-lg border-l-4 bg-white",
        getBorderClass(),
        isCancelled && "bg-gray-50"
      )}>
        <div className="flex flex-col gap-2">
          {/* Header with title and type */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full bg-blue-50",
                isCancelled && "bg-gray-100"
              )}>
                {getMeetingIcon()}
              </div>
              <div>
                <h3 className={cn(
                  "font-medium text-base",
                  getStatusColor(),
                  isCancelled && "line-through"
                )}>
                  {content}
                </h3>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  {IconComponent}
                  <span>{getMeetingTypeLabel(metadata?.meetingType || 'other')}</span>
                </div>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditingAppointment(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Calendar-style date display */}
          <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              <span>{getDateDisplay()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4" />
              <span>{getTimeDisplay()}</span>
            </div>
          </div>

          {/* Status display */}
          {isCancelled && (
            <div className="text-xs text-red-500 font-medium mt-1">
              {settings?.language === "en" ? "Cancelled" : "Abgesagt"}
            </div>
          )}
          {metadata?.status === 'completed' && (
            <div className="text-xs text-green-500 font-medium mt-1">
              {settings?.language === "en" ? "Completed" : "Abgeschlossen"}
            </div>
          )}
        </div>
      </div>

      {isEditingAppointment && (
        <NewAppointmentDialog
          open={isEditingAppointment}
          onOpenChange={setIsEditingAppointment}
          initialSelectedDate={metadata?.dueDate ? new Date(metadata.dueDate) : null}
          appointmentToEdit={{
            id,
            leadId: leadId || '',
            time: metadata?.dueDate ? format(new Date(metadata.dueDate), 'HH:mm') : '09:00',
            title: content,
            color: metadata?.color || '#40E0D0',
            meeting_type: metadata?.meetingType || 'phone_call',
          }}
        />
      )}
    </>
  );
};
