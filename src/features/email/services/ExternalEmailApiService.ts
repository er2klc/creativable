
import { supabase } from '@/integrations/supabase/client';

export class ExternalEmailApiService {
  private static THROTTLE_DURATION = 60000; // 1 minute throttle by default
  private static MAX_BATCH_SIZE = 50; // Max emails to fetch in one batch

  /**
   * Fetches emails from the external email service
   */
  static async fetchEmails(config: {
    host: string;
    port: number;
    username: string;
    password: string;
    folder: string;
    tls: boolean;
  }, options?: {
    limit?: number;
    offset?: number;
    since?: Date;
    onProgress?: (progress: number) => void;
  }): Promise<{ 
    success: boolean; 
    emails?: any[];
    count?: number;
    error?: string;
  }> {
    try {
      // Default options
      const fetchOptions = {
        limit: options?.limit || 25,
        offset: options?.offset || 0,
        since: options?.since,
      };

      console.log(`Fetching emails for ${config.username} from folder ${config.folder}`, {
        ...config, 
        password: '********', // Don't log the password
        options: fetchOptions
      });

      // In a real implementation, this would call your backend API
      // For now, return successful response with mock data
      
      // Mock email data for testing
      const mockEmails = Array.from({ length: Math.min(fetchOptions.limit, 3) }, (_, i) => ({
        id: `mock-${Date.now()}-${i}`,
        message_id: `<mock-${Date.now()}-${i}@example.com>`,
        subject: `Test Email ${i + 1}`,
        from_name: "Test Sender",
        from_email: "sender@example.com",
        to_name: config.username,
        to_email: config.username,
        html_content: `<p>This is test email ${i + 1}</p>`,
        text_content: `This is test email ${i + 1}`,
        sent_at: new Date(Date.now() - i * 3600000).toISOString(),
        folder: config.folder,
        read: false,
        starred: false,
        has_attachments: false
      }));

      // Simulate progress updates
      if (options?.onProgress) {
        for (let i = 0; i <= 100; i += 20) {
          options.onProgress(i);
          await new Promise(r => setTimeout(r, 100));
        }
      }

      return { 
        success: true, 
        emails: mockEmails,
        count: mockEmails.length
      };
    } catch (error) {
      console.error("Error fetching emails:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error while fetching emails"
      };
    }
  }

  /**
   * Synchronizes emails with pagination and throttling
   */
  static async syncEmailsWithPagination(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    folder: string;
    tls: boolean;
  }): Promise<{
    success: boolean;
    emailsCount?: number;
    message?: string;
    error?: string;
  }> {
    try {
      console.log(`Starting email sync for ${config.user} in folder ${config.folder}`);
      
      // Check if there's an active throttle for this folder
      const throttleTime = await this.getThrottleTimeRemaining(config.folder);
      if (throttleTime > 0) {
        return {
          success: false,
          error: `Too many requests. Please wait ${Math.ceil(throttleTime / 1000)} seconds before trying again.`
        };
      }
      
      // Get the current user to ensure we have a user_id for database operations
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          error: "User not authenticated" 
        };
      }

      // Update the sync status to indicate sync is in progress
      await this.updateSyncStatus(user.id, config.folder, true);

      try {
        // Fetch emails with progress tracking
        let progress = 0;
        const result = await this.fetchEmails(
          {
            host: config.host,
            port: config.port,
            username: config.user,
            password: config.password,
            folder: config.folder,
            tls: config.tls
          }, 
          {
            limit: this.MAX_BATCH_SIZE,
            onProgress: (p) => {
              progress = p;
              console.log(`Sync progress: ${progress}%`);
            }
          }
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch emails");
        }

        // Save emails to database
        if (result.emails && result.emails.length > 0) {
          const savedCount = await this.saveEmailsToDatabase(user.id, config.folder, result.emails);
          console.log(`Saved ${savedCount} emails to database`);
        }

        // Set throttle for this folder
        await this.setThrottle(config.folder);

        // Update sync status to indicate sync is complete
        await this.updateSyncStatus(user.id, config.folder, false);

        return { 
          success: true, 
          emailsCount: result.emails?.length || 0,
          message: `Successfully synced ${result.emails?.length || 0} emails` 
        };
      } catch (error) {
        // Update sync status with error
        await this.updateSyncStatus(user.id, config.folder, false, error instanceof Error ? error.message : "Unknown error");
        throw error;
      }
    } catch (error) {
      console.error("Email sync error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error during email sync"
      };
    }
  }

  /**
   * Save emails to database, avoiding duplicates
   */
  private static async saveEmailsToDatabase(userId: string, folder: string, emails: any[]): Promise<number> {
    if (!emails.length) return 0;
    
    try {
      console.log(`Saving ${emails.length} emails to database for folder ${folder}`);
      
      let savedCount = 0;
      
      // Process emails in chunks to avoid large transactions
      const chunkSize = 10;
      for (let i = 0; i < emails.length; i += chunkSize) {
        const chunk = emails.slice(i, i + chunkSize);
        
        // Prepare email records for insertion
        const emailRecords = chunk.map(email => ({
          user_id: userId,
          message_id: email.message_id,
          folder: folder,
          subject: email.subject,
          from_name: email.from_name,
          from_email: email.from_email,
          to_name: email.to_name,
          to_email: email.to_email,
          cc: email.cc || [],
          bcc: email.bcc || [],
          html_content: email.html_content,
          text_content: email.text_content,
          sent_at: email.sent_at,
          received_at: new Date().toISOString(),
          read: false,
          starred: false,
          has_attachments: !!email.has_attachments,
          flags: email.flags || {},
          headers: email.headers || {}
        }));
        
        // Insert emails with upsert to avoid duplicates
        const { data, error } = await supabase
          .from('emails')
          .upsert(emailRecords, { 
            onConflict: 'user_id,message_id',
            ignoreDuplicates: true
          });
        
        if (error) {
          console.error("Error saving emails batch to database:", error);
        } else {
          savedCount += chunk.length;
          console.log(`Saved batch of ${chunk.length} emails`);
        }
      }
      
      return savedCount;
    } catch (error) {
      console.error("Error saving emails to database:", error);
      return 0;
    }
  }

  /**
   * Update the sync status in the database
   */
  private static async updateSyncStatus(
    userId: string, 
    folder: string, 
    inProgress: boolean, 
    error?: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Check if a record exists
      const { data } = await supabase
        .from('email_sync_status')
        .select('*')
        .eq('user_id', userId)
        .eq('folder', folder)
        .single();
      
      if (data) {
        // Update existing record
        await supabase
          .from('email_sync_status')
          .update({
            sync_in_progress: inProgress,
            last_error: error || null,
            updated_at: now,
            ...(inProgress ? {} : { last_sync_date: now }) // Only update last_sync_date if sync is complete
          })
          .eq('id', data.id);
      } else {
        // Create new record
        await supabase
          .from('email_sync_status')
          .insert({
            user_id: userId,
            folder: folder,
            sync_in_progress: inProgress,
            last_error: error || null,
            last_sync_date: inProgress ? null : now
          });
      }
    } catch (error) {
      console.error("Error updating sync status:", error);
    }
  }

  /**
   * Set a throttle for the specified folder
   */
  private static async setThrottle(folder: string): Promise<void> {
    try {
      // In a real implementation, this would set a timestamp in storage/cache
      // For now, we'll use localStorage as a simple example
      const throttleKey = `email_throttle_${folder}`;
      const expiresAt = Date.now() + this.THROTTLE_DURATION;
      localStorage.setItem(throttleKey, expiresAt.toString());
    } catch (error) {
      console.error("Error setting throttle:", error);
    }
  }

  /**
   * Get the remaining throttle time for the specified folder
   */
  static async getThrottleTimeRemaining(folder: string): Promise<number> {
    try {
      // In a real implementation, this would check for a timestamp in storage/cache
      // For now, we'll use localStorage as a simple example
      const throttleKey = `email_throttle_${folder}`;
      const expiresAtStr = localStorage.getItem(throttleKey);
      
      if (!expiresAtStr) return 0;
      
      const expiresAt = parseInt(expiresAtStr);
      const now = Date.now();
      
      if (now >= expiresAt) {
        // Throttle has expired, clean up
        localStorage.removeItem(throttleKey);
        return 0;
      }
      
      return expiresAt - now;
    } catch (error) {
      console.error("Error checking throttle:", error);
      return 0;
    }
  }

  /**
   * Test email connection
   */
  static async testConnection(config: {
    host: string;
    port: number;
    username: string;
    password: string;
    folder: string;
    tls: boolean;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log("Testing email connection:", {
        ...config,
        password: "********" // Don't log the actual password
      });
      
      // Try to fetch a single email to test connection
      const result = await this.fetchEmails(
        {
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          folder: config.folder,
          tls: config.tls
        },
        { limit: 1 }
      );
      
      if (result.success) {
        return { 
          success: true, 
          message: "Connection successful" 
        };
      } else {
        return { 
          success: false, 
          error: result.error || "Failed to connect to email server" 
        };
      }
    } catch (error) {
      console.error("Email connection test error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error testing connection" 
      };
    }
  }
}
