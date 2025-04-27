
import { supabase } from "@/integrations/supabase/client";
import { transformEmailForStorage, EmailData } from "../utils/emailTransform";
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

      // Process and save emails in batches to avoid excessive payload size
      const batchSize = 20;
      const totalEmails = result.data.length;
      let savedCount = 0;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Process emails in batches
      for (let i = 0; i < totalEmails; i += batchSize) {
        const batch = result.data.slice(i, i + batchSize);
        const emailsToSave = batch.map((email: EmailData) => 
          transformEmailForStorage(email, userId, config.folder || 'INBOX')
        );

        try {
          const { error: saveError } = await supabase
            .from('emails')
            .upsert(emailsToSave, {
              onConflict: 'user_id,message_id',
              ignoreDuplicates: false
            });

          if (saveError) {
            console.error("Error saving batch:", saveError);
            // Continue with other batches even if one fails
          } else {
            savedCount += batch.length;
          }
        } catch (batchError) {
          console.error("Error saving a batch:", batchError);
        }
      }

      // Update the user settings with sync info
      await supabase.from('user_settings').upsert({
        user_id: userId,
        email_configured: true,
        last_email_sync: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

      // Update throttle time
      this.throttleMap.set(config.folder || 'INBOX', Date.now());

      return {
        success: true,
        totalSaved: savedCount
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found for creating sample emails");
        return false;
      }

      const sampleEmails = [
        {
          user_id: user.id,
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
          flags: [],
          direction: 'incoming'
        },
        {
          user_id: user.id,
          folder: folder,
          message_id: `sample-${Date.now()}-2`,
          subject: 'Getting Started with Email Features',
          from_name: 'Support Team',
          from_email: 'support@example.com',
          to_name: user.email?.split('@')[0] || '',
          to_email: user.email || '',
          html_content: '<h3>Email Features</h3><p>Here are some features you can use:</p><ul><li>Compose new emails</li><li>Reply to messages</li><li>Forward emails</li><li>Organize with folders</li></ul>',
          text_content: 'Email Features\n\nHere are some features you can use:\n- Compose new emails\n- Reply to messages\n- Forward emails\n- Organize with folders',
          sent_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          received_at: new Date(Date.now() - 3540000).toISOString(), // 59 minutes ago
          read: false,
          starred: true,
          has_attachments: false,
          flags: [],
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
