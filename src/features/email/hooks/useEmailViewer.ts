
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { EmailMessage } from "./useEmailMessages";

export function useEmailViewer(emailId: string | null) {
  const { user } = useAuth();
  
  const {
    data: email,
    isLoading,
    error
  } = useQuery({
    queryKey: ["email", emailId],
    queryFn: async () => {
      if (!user || !emailId) return null;
      
      try {
        // Check if emails table exists
        const { error: tableCheckError } = await supabase
          .from('emails')
          .select('id')
          .limit(1)
          .single();
        
        // If table doesn't exist, return null rather than throwing an error
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.warn("emails table doesn't exist yet");
          return null;
        }
        
        const { data, error } = await supabase
          .from("emails")
          .select("*")
          .eq("id", emailId)
          .single();
        
        if (error) throw error;
        
        // Format dates
        return {
          ...data,
          sent_at: data.sent_at ? new Date(data.sent_at) : null,
          received_at: data.received_at ? new Date(data.received_at) : null
        } as EmailMessage;
      } catch (err: any) {
        console.error("Error fetching email:", err);
        return null;
      }
    },
    enabled: !!user && !!emailId
  });

  // Mark email as read when opened
  useEffect(() => {
    const markAsRead = async () => {
      if (!user || !emailId || !email || email.read) return;
      
      try {
        // Check if emails table exists before updating
        const { error: tableCheckError } = await supabase
          .from('emails')
          .select('id')
          .limit(1)
          .single();
        
        // If table doesn't exist, return rather than throwing an error
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.warn("emails table doesn't exist yet");
          return;
        }
        
        await supabase
          .from("emails")
          .update({ read: true })
          .eq("id", emailId)
          .eq("user_id", user.id);
          
        // Also update folder unread counts
        await supabase
          .from("email_folders")
          .update({ 
            unread_messages: supabase.rpc('decrement', { x: 1 }) 
          })
          .eq("path", email.folder)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error marking email as read:", error);
      }
    };
    
    markAsRead();
  }, [email, emailId, user]);

  return {
    email,
    isLoading,
    error
  };
}
