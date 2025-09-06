import { useEffect } from 'react';
import { useMutation } from "@tanstack/react-query";
import { differenceInHours, isSameHour } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAppointmentNotificationProps {
  id: string;
  leadId?: string;
  dueDate?: string;
  content: string;
}

type NotifyVars = { leadId: string; startsAtISO: string };
type NotifyRes = { ok: true };

const createNotificationMutation = () => {
  return useMutation<NotifyRes, Error, NotifyVars>({
    mutationFn: async ({ leadId, startsAtISO }) => {
      const { data: lead } = await supabase
        .from('leads')
        .select('name')
        .eq('id', leadId)
        .single();

      if (!lead) throw new Error('Lead not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Termin in 4 Stunden',
          message: `Dein Termin mit ${lead.name} ist in 4 Stunden.`,
          content: `Dein Termin mit ${lead.name} ist in 4 Stunden.`,
          type: 'appointment_reminder',
          metadata: {
            leadId,
            dueDate: startsAtISO
          },
          target_page: `/contacts/${leadId}`
        });

      if (error) throw error;
      return { ok: true };
    },
  });
};

export const useAppointmentNotification = ({ id, leadId, dueDate, content }: UseAppointmentNotificationProps) => {
  const notificationMutation = createNotificationMutation();

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
          .eq('type', 'appointment_reminder')
          .is('deleted_at', null)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (existingNotifications && existingNotifications.length > 0) {
          return; // Notification already exists
        }

        notificationMutation.mutate({
          leadId,
          startsAtISO: dueDate
        });
      }
    };

    // Initial check
    checkAndNotify();
    
    // Check every 15 minutes instead of every minute
    const timer = setInterval(checkAndNotify, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [id, dueDate, leadId, content, notificationMutation]);
};