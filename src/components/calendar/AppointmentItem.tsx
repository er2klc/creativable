import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText, Video, Flame, Phone, MapPin, Users, BarChart, RefreshCw, Check, X, Crown, Rocket } from "lucide-react";
import { format } from "date-fns";

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call": return <Phone className="h-4 w-4" />;
    case "on_site": return <MapPin className="h-4 w-4" />;
    case "zoom": return <Video className="h-4 w-4" />;
    case "initial_meeting": return <Users className="h-4 w-4" />;
    case "presentation": return <BarChart className="h-4 w-4" />;
    case "follow_up": return <RefreshCw className="h-4 w-4" />;
    default: return null;
  }
};

export const AppointmentItem = ({ appointment, onClick, isDragging }: AppointmentItemProps) => {
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
  const isStartDay = currentDay && appointment.start_time ? 
    currentDay === format(new Date(appointment.start_time), "yyyy-MM-dd") : false;
  const isEndDay = currentDay && appointment.end_date ? 
    currentDay === format(new Date(appointment.end_date), "yyyy-MM-dd") : false;

  // Get the appropriate icon based on event type
  const getEventIcon = () => {
    if (appointment.isTeamEvent) {
      if (isMultiDayEvent) {
        return <Rocket className="h-4 w-4 text-black" />;
      }
      if (appointment.is_admin_only) {
        return <Crown className="h-4 w-4 text-black" />;
      }
      return <Flame className="h-4 w-4 text-orange-500" />;
    }
    if (appointment.isRecurring) {
      return <Video className="h-4 w-4 text-primary" />;
    }
    return getMeetingTypeIcon(appointment.meeting_type);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: appointment.isTeamEvent ? "default" : "pointer",
      }}
      {...(appointment.isTeamEvent ? {} : { ...listeners, ...attributes })}
      className={cn(
        "p-2 rounded hover:opacity-80 space-y-1",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black",
        (appointment.completed || appointment.cancelled) && "opacity-50"
      )}
      onClick={(e) => !appointment.isTeamEvent && onClick(e)}
    >
      <div className="flex items-center gap-1 text-xs">
        <div className="flex items-center gap-1 flex-1">
          {getEventIcon()}
          <span className="font-bold truncate">{appointment.title}</span>
        </div>
        {appointment.completed && <div className="text-green-500"><Check className="h-4 w-4" /></div>}
        {appointment.cancelled && <div className="text-red-500"><X className="h-4 w-4" /></div>}
      </div>

      {(!isMultiDayEvent || (isMultiDayEvent && isStartDay)) && !appointment.isTeamEvent && appointment.start_time && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          {format(new Date(appointment.start_time), "HH:mm")}
        </div>
      )}

      {appointment.leads?.name && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <User className="h-3 w-3" />
          <span className="truncate">{appointment.leads.name}</span>
        </div>
      )}

      {isMultiDayEvent && (
        <div className="text-xs text-gray-500">
          {isStartDay && "Start"}
          {!isStartDay && !isEndDay && "Zwischen"}
          {isEndDay && "Ende"}
        </div>
      )}
    </div>
  );
};