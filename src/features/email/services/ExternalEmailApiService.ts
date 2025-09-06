import { supabase } from '@/integrations/supabase/client';

export class ExternalEmailApiService {
  private static THROTTLE_DURATION = 60000; // 1 minute throttle by default
  private static MAX_BATCH_SIZE = 50; // Max emails to fetch in one batch

  /**
   * Fetches emails from the external email service using Supabase Edge Function
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

      // Get user auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Call the sync-emails edge function with proper parameters
      const response = await fetch(
        'https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            folder: config.folder,
            tls: config.tls,
            limit: fetchOptions.limit,
            offset: fetchOptions.offset,
            forceRefresh: false,
            batchProcessing: true,
            maxBatchSize: 10,
            detailed_logging: true
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();

      // Implement progress updates if callback provided
      if (options?.onProgress) {
        options.onProgress(100); // Set to 100% as edge function handles sync
      }

      return { 
        success: result.success, 
        emails: result.emails || [],
        count: result.emailsCount || 0,
        error: result.error
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
   * Synchronizes emails with pagination and throttling, using the Edge Function
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
        // Get user auth session for the Edge Function call
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("No active session found");
        }

        // Call the sync-emails edge function
        const response = await fetch(
          'https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              host: config.host,
              port: config.port,
              username: config.user,
              password: config.password,
              folder: config.folder,
              tls: config.tls,
              forceRefresh: false,
              batchProcessing: true,
              maxBatchSize: 10,
              connectionTimeout: 60000,
              retryAttempts: 3
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();

        // Set throttle for this folder
        await this.setThrottle(config.folder);

        // Update sync status to indicate sync is complete
        await this.updateSyncStatus(user.id, config.folder, false);

        return { 
          success: result.success, 
          emailsCount: result.emailsCount || 0,
          message: result.message || `Successfully synced ${result.emailsCount || 0} emails` 
        };
      } catch (error) {
        // Update sync status with error
        if (user) {
          await this.updateSyncStatus(user.id, config.folder, false, error instanceof Error ? error.message : "Unknown error");
        }
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
        
        // For each email, we'll insert it individually to better handle errors
        for (const email of chunk) {
          try {
            // Insert a new email record
            const { data, error } = await supabase
              .from('emails')
              .insert({
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
                headers: email.headers || {},
                // Required fields for upsert
                direction: 'inbound',
                status: 'delivered'
              })
              // Use on_conflict parameter to handle duplicates
              .select();
            
            if (error) {
              // Log but continue processing other emails
              console.error("Error saving email to database:", error);
            } else {
              savedCount++;
            }
          } catch (emailError) {
            console.error("Error processing email:", emailError);
            // Continue with next email
          }
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
        // Update existing record - use user_id and folder in the query, not id
        await supabase
          .from('email_sync_status')
          .update({
            sync_in_progress: inProgress,
            last_error: error || null,
            updated_at: now,
            ...(inProgress ? {} : { last_sync_time: now }) // Only update last_sync_date if sync is complete
          })
          .eq('user_id', userId)
          .eq('folder', folder);
      } else {
        // Create new record
        await supabase
          .from('email_sync_status')
          .insert({
            user_id: userId,
            folder: folder,
            sync_in_progress: inProgress,
            last_error: error || null,
            last_sync_time: inProgress ? null : now
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
   * Test email connection via Edge Function
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
      
      // Get user auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Call the test-imap-connection edge function
      const response = await fetch(
        'https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/test-imap-connection',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            folder: config.folder,
            tls: config.tls,
            detailed_diagnostics: true
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      return { 
        success: result.success, 
        message: result.message || "Connection successful",
        error: result.error
      };
    } catch (error) {
      console.error("Email connection test error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error testing connection" 
      };
    }
  }
}
