import { Calendar, Edit, Trash2, Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { de } from "date-fns/locale";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { useState, useEffect } from "react";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppointmentCardProps {
  id: string;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: string;
    completedAt?: string;
    color?: string;
  };
  onDelete?: () => void;
}

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

const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call":
      return <Phone className="h-4 w-4 text-blue-500" />;
    case "on_site":
      return <MapPin className="h-4 w-4 text-blue-500" />;
    case "zoom":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "initial_meeting":
      return <Users className="h-4 w-4 text-blue-500" />;
    case "presentation":
      return <BarChart className="h-4 w-4 text-blue-500" />;
    case "follow_up":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return <Calendar className="h-4 w-4 text-blue-500" />;
  }
};

export const AppointmentCard = ({
  id,
  content,
  metadata,
  onDelete,
}: AppointmentCardProps) => {
  const { settings } = useSettings();
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const { leadId } = useParams<{ leadId: string }>();
  
  useEffect(() => {
    const checkAndNotify = async () => {
      if (!metadata?.dueDate || !leadId) return;
      
      const appointmentDate = new Date(metadata.dueDate);
      const now = new Date();
      const hoursUntil = differenceInHours(appointmentDate, now);
      
      // Check if it's exactly 4 hours before the appointment
      if (hoursUntil === 4) {
        const { data: lead } = await supabase
          .from('leads')
          .select('name')
          .eq('id', leadId)
          .single();

        if (!lead) return;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Termin in 4 Stunden',
            content: `Dein Termin "${content}" mit ${lead.name} ist in 4 Stunden.`,
            type: 'appointment_reminder',
            metadata: {
              appointmentId: id,
              leadId: leadId,
              dueDate: metadata.dueDate
            }
          });

        if (error) {
          console.error('Error creating notification:', error);
          toast.error('Fehler beim Erstellen der Erinnerung');
        }
      }
    };

    const timer = setInterval(checkAndNotify, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [id, metadata?.dueDate, leadId, content]);

  const getTimeDisplay = (date: string) => {
    const days = differenceInDays(new Date(date), new Date());
    const hours = differenceInHours(new Date(date), new Date());
    
    if (days === 0) {
      if (hours < 0) return null;
      if (hours === 0) return "Jetzt";
      return `Heute in ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    if (days < 0) return null;
    return `In ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  };

  return (
    <>
      <div className="relative group">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {metadata?.meetingType ? (
              <MeetingTypeIcon iconName={metadata.meetingType} className="h-4 w-4 text-blue-500" />
            ) : (
              <Calendar className="h-4 w-4 text-blue-500" />
            )}
            <div className="font-medium">{content}</div>
          </div>
          
          {metadata?.meetingType && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getMeetingTypeIcon(metadata.meetingType)}
              {getMeetingTypeLabel(metadata.meetingType)}
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            {metadata?.dueDate && (
              <div>
                {format(new Date(metadata.dueDate), 'PPp', {
                  locale: settings?.language === "en" ? undefined : de
                })}
              </div>
            )}
            {metadata?.dueDate && getTimeDisplay(metadata.dueDate) && (
              <div className="text-blue-500">
                {getTimeDisplay(metadata.dueDate)}
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
