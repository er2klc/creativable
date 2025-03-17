
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export interface EmailMessage {
  id: string;
  user_id: string;
  message_id: string;
  folder: string;
  subject: string | null;
  from_name: string | null;
  from_email: string | null;
  to_name: string | null;
  to_email: string | null;
  cc: string[] | null;
  bcc: string[] | null;
  content: string | null;
  html_content: string | null;
  text_content: string | null;
  sent_at: Date | null;
  received_at: Date | null;
  read: boolean;
  starred: boolean;
  has_attachments: boolean;
  flags: any;
  headers: any;
}

export function useEmailMessages(folderId: string | null, folderPath: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["emails", user?.id, folderId, folderPath],
    queryFn: async () => {
      if (!user || (!folderId && !folderPath)) return [];
      
      try {
        // Check if emails table exists
        const { error: tableCheckError } = await supabase
          .from('emails')
          .select('id')
          .limit(1)
          .single();
        
        // If table doesn't exist, return empty array rather than throwing an error
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.warn("emails table doesn't exist yet");
          return [];
        }
        
        let query = supabase
          .from("emails")
          .select("*")
          .eq("user_id", user.id);
        
        if (folderPath) {
          query = query.eq("folder", folderPath);
        } else if (folderId) {
          // Get folder path from ID first
          const { data: folderData } = await supabase
            .from("email_folders")
            .select("path")
            .eq("id", folderId)
            .single();
          
          if (folderData?.path) {
            query = query.eq("folder", folderData.path);
          }
        }
        
        // Order by received date, newest first
        query = query.order("received_at", { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Format dates and return
        return (data || []).map(email => ({
          ...email,
          sent_at: email.sent_at ? new Date(email.sent_at) : null,
          received_at: email.received_at ? new Date(email.received_at) : null
        }));
      } catch (err: any) {
        console.error("Error fetching emails:", err);
        return [];
      }
    },
    enabled: !!user && !!(folderId || folderPath)
  });
}
