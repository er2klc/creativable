
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export interface EmailMessage {
  id: string;
  user_id: string;
  folder: string;
  message_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  cc: string[];
  bcc: string[];
  html_content: string | null;
  text_content: string | null;
  sent_at: string;
  received_at: string;
  read: boolean;
  starred: boolean;
  has_attachments: boolean;
  flags: string[];
}

export function useEmailMessages(folderPath: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["emails", user?.id, folderPath],
    queryFn: async () => {
      if (!user || !folderPath) {
        return { emails: [], unreadCount: 0 };
      }

      console.log("Fetching emails for folder:", folderPath);

      try {
        // Query emails for the current folder
        const { data: emails, error } = await supabase
          .from('emails')
          .select("*")
          .eq("user_id", user.id)
          .eq("folder", folderPath)
          .order("sent_at", { ascending: false });

        if (error) {
          console.error("Error fetching emails:", error);
          throw error;
        }

        // Count unread messages
        const unreadCount = emails?.filter(email => !email.read)?.length || 0;

        console.log(`Loaded ${emails?.length || 0} emails, ${unreadCount} unread`);
        
        return {
          emails: emails || [],
          unreadCount
        };
      } catch (err: any) {
        console.error("Error in useEmailMessages:", err);
        throw err;
      }
    },
    enabled: !!user && !!folderPath,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}
