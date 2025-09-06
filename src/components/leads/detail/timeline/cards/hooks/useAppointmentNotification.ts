
import { useEffect } from 'react';
import { toast } from 'sonner';

interface UseAppointmentNotificationProps {
  dueDate?: string;
  content?: string;
}

export const useAppointmentNotification = ({ 
  dueDate, 
  content
}: UseAppointmentNotificationProps) => {
  useEffect(() => {
    if (!dueDate) return;
    
    const appointmentDate = new Date(dueDate);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));
    
    // Show notification 15 minutes before
    if (minutesUntil === 15) {
      toast.info(`Termin "${content}" beginnt in 15 Minuten`);
    }
  }, [dueDate, content]);
};
