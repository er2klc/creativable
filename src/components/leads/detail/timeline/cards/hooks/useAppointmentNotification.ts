
import { useEffect } from 'react';
import { differenceInHours, isSameHour } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAppointmentNotificationProps {
  id: string;
  leadId?: string;
  dueDate?: string;
  content: string;
}

export const useAppointmentNotification = ({ id, leadId, dueDate, content }: UseAppointmentNotificationProps) => {
  useEffect(() => {
    const checkAndNotify = async () => {
      if (!dueDate || !leadId) return;
      
      const appointmentDate = new Date(dueDate);
      const now = new Date();
      const hoursUntil = differenceInHours(appointmentDate, now);
      
      // Only proceed if exactly 4 hours until appointment
      if (hoursUntil === 4 && isSameHour(now, new Date())) {
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('metadata->appointmentId', id)
          .eq('type', 'appointment_reminder')
          .is('deleted_at', null)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) as any;

        if (existingNotifications && existingNotifications.length > 0) {
          return; // Notification already exists
        }

        const { data: lead } = await supabase
          .from('leads')
          .select('name')
          .eq('id', leadId)
          .single();

        if (!lead) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Termin in 4 Stunden',
            message: `Dein Termin "${content}" mit ${lead.name} ist in 4 Stunden.`,
            content: `Dein Termin "${content}" mit ${lead.name} ist in 4 Stunden.`,
            type: 'appointment_reminder',
            metadata: {
              appointmentId: id,
              leadId,
              dueDate
            },
            target_page: `/contacts/${leadId}`
          });

        if (error) {
          console.error('Error creating notification:', error);
          toast.error('Fehler beim Erstellen der Erinnerung');
        }
      }
    };

    // Initial check
    checkAndNotify();
    
    // Check every 15 minutes instead of every minute
    const timer = setInterval(checkAndNotify, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [id, dueDate, leadId, content]);
};
