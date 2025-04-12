
import { FC } from 'react';
import { format } from 'date-fns';
import { CalendarDays, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadDetailAppointmentProps {
  appointment: any;
  locale: Locale;
}

export const LeadDetailAppointment: FC<LeadDetailAppointmentProps> = ({ appointment, locale }) => {
  const appointmentDate = new Date(appointment.date || appointment.created_at);
  const formattedDate = format(appointmentDate, 'PPpp', { locale });
  
  const getBadgeVariant = () => {
    if (appointment.cancelled) return 'destructive';
    if (appointment.completed) return 'success';
    return 'warning';
  };
  
  const getBadgeText = () => {
    if (appointment.cancelled) return 'Abgesagt';
    if (appointment.completed) return 'Abgeschlossen';
    const now = new Date();
    return appointmentDate < now ? 'Überfällig' : 'Ausstehend';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{appointment.title}</h3>
        <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
      </div>
      
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>{formattedDate}</span>
        </div>
        
        {appointment.location && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{appointment.location}</span>
          </div>
        )}
        
        {appointment.attendees && appointment.attendees.length > 0 && (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{appointment.attendees.join(', ')}</span>
          </div>
        )}
      </div>
      
      {appointment.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-sm">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
};
