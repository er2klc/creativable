import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import {
  Clock,
  User,
  Video,
  Flame,
  Phone,
  MapPin,
  Users,
  BarChart,
  RefreshCw,
  Check,
  X,
  Crown,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";

// Debugging-Log hinzufügen
console.log("AppointmentItem.tsx version 1.4 geladen");

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  isAdmin?: boolean;
}

const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call":
      return <Phone className="h-4 w-4" />;
    case "on_site":
      return <MapPin className="h-4 w-4" />;
    case "zoom":
      return <Video className="h-4 w-4" />;
    case "initial_meeting":
      return <Users className="h-4 w-4" />;
    case "presentation":
      return <BarChart className="h-4 w-4" />;
    case "follow_up":
      return <RefreshCw className="h-4 w-4" />;
    default:
      return null;
  }
};

const getMeetingTypeLabel = (type: string) => {
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
      return "";
  }
};

export const AppointmentItem = ({
  appointment,
  onClick,
  isDragging,
  isAdmin = false,
}: AppointmentItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: { ...appointment, type: "appointment" },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const isMultiDayEvent = appointment.is_multi_day && appointment.end_date;

  // Determine if current day is start, middle, or end day
  const currentDay = appointment.current_day || null;
  const isStartDay = currentDay && appointment.start_time
    ? currentDay === format(new Date(appointment.start_time), "yyyy-MM-dd")
    : false;
  const isEndDay = currentDay && appointment.end_date
    ? currentDay === format(new Date(appointment.end_date), "yyyy-MM-dd")
    : false;

  // Get the appropriate icon based on event type
  const getEventIcon = () => {
    console.log("Appointment Icon Logic:", appointment);
    if (appointment.isTeamEvent) {
      if (isMultiDayEvent) {
        return <Rocket className="h-4 w-4 text-primary" />;
      }
      if (appointment.is_admin_only) {
        return <Crown className="h-4 w-4 text-primary" />;
      }
      return <Flame className="h-4 w-4 text-orange-500" />;
    }
    if (appointment.isRecurring) {
      return <Video className="h-4 w-4 text-primary" />; // Zoom Icon
    }
    return getMeetingTypeIcon(appointment.meeting_type);
  };

  // Format time range
  const formatTimeRange = () => {
    if (!appointment.start_time) return null;
    const startTime = format(new Date(appointment.start_time), "HH:mm");
    if (appointment.end_time && appointment.end_time !== appointment.start_time) {
      const endTime = format(new Date(appointment.end_time), "HH:mm");
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  // Determine if the appointment should be draggable
  const shouldBeDraggable = !appointment.isTeamEvent || isAdmin;
  const dragAttributes = shouldBeDraggable ? { ...listeners, ...attributes } : {};

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#40E0D0",
        cursor: shouldBeDraggable ? "pointer" : "default",
      }}
      {...dragAttributes}
      className={cn(
        "p-2 rounded hover:opacity-80 space-y-2",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black",
        (appointment.completed || appointment.cancelled) && "opacity-50"
      )}
      onClick={(e) => onClick(e)}
    >
      {/* Title */}
      <div className="font-bold truncate">
        {appointment.title}
      </div>

      {/* Meeting Type */}
      <div className="flex items-center gap-1 text-sm">
        {getEventIcon()}
        <span>{getMeetingTypeLabel(appointment.meeting_type)}</span>
      </div>

      {/* Contact Name */}
      {appointment.leads?.name && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <User className="h-3 w-3" />
          <span className="truncate">{appointment.leads.name}</span>
        </div>
      )}

      {/* Date and Time */}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Clock className="h-3 w-3" />
        <span>
          {format(new Date(appointment.start_time), "dd.MM.yyyy")} | {formatTimeRange()}
        </span>
      </div>

      {/* Status indicators */}
      {(appointment.completed || appointment.cancelled) && (
        <div className={cn(
          "flex items-center gap-1",
          appointment.completed ? "text-green-500" : "text-red-500"
        )}>
          {appointment.completed ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </div>
      )}
    </div>
  );
};