
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
        const { data, error } = await supabase
          .from("emails")
          .select("*")
          .eq("id", emailId)
          .single();
        
        if (error) throw error;
        
        // Format dates
        return {
          ...data,
          sent_at: new Date(data.sent_at),
          received_at: new Date(data.received_at)
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
        await supabase
          .from("emails")
          .update({ read: true })
          .eq("id", emailId)
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
