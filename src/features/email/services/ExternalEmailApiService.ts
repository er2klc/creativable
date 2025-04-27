
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  folder?: string;
  tls?: boolean;
}

interface SyncResult {
  success: boolean;
  error?: string;
  totalSaved?: number;
}

const EMAIL_SERVER_URL = "https://email-server.kreative-webdesign.de";
const EMAIL_SERVER_API_KEY = "7b5d3a9f2c4e1d6a8b0e5f3c7a9d2e4f1b8c5a0d3e6f7c2a9b8e5d4f3a1c7e";

export class ExternalEmailApiService {
  private static throttleMap = new Map<string, number>();

  static async getThrottleTimeRemaining(folder: string): Promise<number> {
    const lastSync = this.throttleMap.get(folder) || 0;
    const now = Date.now();
    const timePassed = now - lastSync;
    const THROTTLE_TIME = 10000; // 10 seconds between syncs
    return Math.max(0, THROTTLE_TIME - timePassed);
  }

  static async syncEmailsWithPagination(config: EmailConfig): Promise<SyncResult> {
    try {
      const response = await fetch(`${EMAIL_SERVER_URL}/fetch-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EMAIL_SERVER_API_KEY
        },
        body: JSON.stringify({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          folder: config.folder || 'INBOX',
          tls: config.tls ?? true,
          limit: 50,
          page: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Email server error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error fetching emails');
      }

      // Save the emails to Supabase
      const { data: savedEmails, error: saveError } = await supabase
        .from('emails')
        .upsert(result.data.map((email: any) => ({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          folder: config.folder || 'INBOX',
          message_id: email.id,
          subject: email.subject,
          from_name: email.from?.value?.[0]?.name || '',
          from_email: email.from?.value?.[0]?.address || '',
          to_name: email.to?.value?.[0]?.name || '',
          to_email: email.to?.value?.[0]?.address || '',
          html_content: email.html || '',
          text_content: email.text || '',
          sent_at: email.date,
          received_at: new Date().toISOString(),
          read: email.seen || false,
          starred: false,
          has_attachments: (email.attachments?.length || 0) > 0,
          flags: email.flags || [],
          direction: 'incoming'
        })), {
          onConflict: 'user_id,message_id'
        });

      if (saveError) {
        console.error("Error saving emails:", saveError);
        throw saveError;
      }

      // Update the user settings with sync info
      await supabase.from('user_settings').upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        email_configured: true,
        last_email_sync: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

      // Update throttle time
      this.throttleMap.set(config.folder || 'INBOX', Date.now());

      return {
        success: true,
        totalSaved: result.data.length
      };

    } catch (error: any) {
      console.error("Error syncing emails:", error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  static async createSampleEmails(folder: string = 'INBOX'): Promise<boolean> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.error("No user found for creating sample emails");
        return false;
      }

      const sampleEmails = [
        {
          user_id: userId,
          folder: folder,
          message_id: `sample-${Date.now()}-1`,
          subject: 'Welcome to Your Email',
          from_name: 'System',
          from_email: 'system@example.com',
          to_name: '',
          to_email: '',
          html_content: '<p>Welcome to your email system! This is a sample email.</p>',
          text_content: 'Welcome to your email system! This is a sample email.',
          sent_at: new Date().toISOString(),
          received_at: new Date().toISOString(),
          read: false,
          starred: false,
          has_attachments: false,
          direction: 'incoming'
        }
      ];

      const { error } = await supabase
        .from('emails')
        .upsert(sampleEmails, {
          onConflict: 'user_id,message_id'
        });

      if (error) {
        console.error("Error inserting sample emails:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error creating sample emails:", error);
      return false;
    }
  }
}
