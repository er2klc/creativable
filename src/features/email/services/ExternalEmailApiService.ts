import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// External email API configuration
const API_ENDPOINT = 'https://creativable-email-api.onrender.com/fetch-emails';
const API_KEY = '7b5d3a9f2c4e1d6a8b0e5f3c7a9d2e4f1b8c5a0d3e6f7c2a9b8e5d4f3a1c7e';

interface EmailApiSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  folder: string;
  tls: boolean;
}

interface EmailSyncOptions {
  limit?: number;
  offset?: number;
  since?: string;
  forceRefresh?: boolean;
}

interface EmailApiResponse {
  success: boolean;
  emails?: any[];
  error?: string;
  message?: string;
  hasMore?: boolean;
  total?: number;
}

/**
 * Service to handle communication with the external Email API
 */
export class ExternalEmailApiService {
  private static isSyncing = false;
  private static lastSyncTime: Record<string, Date> = {};
  private static THROTTLE_TIME = 15000; // 15 seconds throttle

  /**
   * Fetch emails from the external API
   */
  public static async fetchEmails(
    settings: EmailApiSettings, 
    options: EmailSyncOptions = {}
  ): Promise<EmailApiResponse> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          error: "Not authenticated"
        };
      }
      
      // Default options
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      
      // Get last sync date if not provided and not forcing refresh
      let since = options.since;
      if (!since && !options.forceRefresh) {
        const { data: syncStatus } = await supabase
          .from('email_sync_status')
          .select('last_sync_date')
          .eq('user_id', user.id)
          .eq('folder', settings.folder)
          .maybeSingle();
          
        // Typensichere Überprüfung mit type guard
        if (syncStatus && typeof syncStatus === 'object') { 
          const status = syncStatus as {last_sync_date?: string};
          if (status.last_sync_date) {
            since = status.last_sync_date;
          }
        }
      }

      // Throttle check based on folder
      const folderKey = `${user.id}:${settings.folder}`;
      const now = new Date();
      if (
        this.lastSyncTime[folderKey] && 
        now.getTime() - this.lastSyncTime[folderKey].getTime() < this.THROTTLE_TIME
      ) {
        return {
          success: false,
          error: "Rate limited. Please wait before making another request.",
          message: "Too many requests. Please wait a moment before trying again."
        };
      }
      
      // Set last sync time
      this.lastSyncTime[folderKey] = now;
      
      // Make request to external API
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({
            host: settings.host,
            port: settings.port,
            user: settings.user,
            password: settings.password,
            folder: settings.folder,
            tls: settings.tls,
            limit,
            offset,
            since
          }),
          // Timeout nach 30 Sekunden
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          return {
            success: false,
            error: result.message || "Failed to fetch emails"
          };
        }
        
        return {
          success: true,
          emails: result.data || [],
          hasMore: result.pagination ? (result.pagination.page < result.pagination.totalPages) : false,
          total: result.pagination?.totalItems || 0,
          message: result.message
        };
      } catch (fetchError: any) {
        // Spezifische Fehlerbehandlung für Netzwerkprobleme
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            error: "Die Anfrage hat zu lange gedauert und wurde abgebrochen. Bitte versuchen Sie es später erneut.",
            message: "Timeout bei der API-Anfrage"
          };
        }
        
        if (fetchError.message && fetchError.message.includes('Failed to fetch')) {
          return {
            success: false,
            error: "Der E-Mail-Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.",
            message: "E-Mail-API nicht erreichbar"
          };
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Error fetching emails from external API:", error);
      return {
        success: false,
        error: error.message || "Ein unbekannter Fehler ist aufgetreten."
      };
    }
  }

  /**
   * Save fetched emails to Supabase database
   */
  public static async saveEmailsToDatabase(
    emails: any[],
    folder: string
  ): Promise<{ success: boolean; savedCount: number; error?: string }> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          savedCount: 0, 
          error: "Not authenticated"
        };
      }
      
      if (!emails || emails.length === 0) {
        return {
          success: true,
          savedCount: 0
        };
      }
      
      // Process emails in batches to prevent memory issues
      const batchSize = 25;
      const batches = [];
      
      for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
      }
      
      let savedCount = 0;
      
      // Process each batch
      for (const batch of batches) {
        // Format emails for insertion
        const formattedEmails = batch.map((email: any) => ({
          user_id: user.id,
          folder: folder,
          // Unterstütze beide Formate: das neue Server-Format und das alte Format
          message_id: email.id || email.messageId || email.message_id || `${email.date}_${email.subject}_${email.from}`,
          imap_uid: email.uid || email.imap_uid || null,
          from: typeof email.from === 'object' ? (email.from?.text || email.from?.value || JSON.stringify(email.from)) : email.from,
          subject: email.subject || "(No Subject)",
          text: email.text || null,
          html: email.html || null,
          date: email.date,
          created_at: new Date().toISOString()
        }));
        
        // Insert emails, skipping conflicts by message_id
        const { data, error } = await supabase
          .from('emails')
          .upsert(formattedEmails, { 
            onConflict: 'message_id,user_id',
            ignoreDuplicates: true 
          });
        
        if (error) {
          console.error("Error saving emails:", error);
          throw error;
        }
        
        savedCount += formattedEmails.length;
        
        // Brief pause between batches to prevent overloading the database
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Update last sync date
      const now = new Date().toISOString();
      const { error: syncError } = await supabase
        .from('email_sync_status')
        .upsert({
          user_id: user.id,
          folder: folder,
          last_sync_date: now,
          updated_at: now
        }, { onConflict: 'user_id,folder' });
      
      if (syncError) {
        console.error("Error updating sync status:", syncError);
      }
      
      return {
        success: true,
        savedCount
      };
    } catch (error: any) {
      console.error("Error saving emails to database:", error);
      return {
        success: false,
        savedCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Sync emails in batches with pagination
   */
  public static async syncEmailsWithPagination(
    settings: EmailApiSettings, 
    options: EmailSyncOptions = {}
  ): Promise<{ success: boolean; totalSaved: number; error?: string }> {
    // Prevent multiple sync processes
    if (this.isSyncing) {
      return {
        success: false,
        totalSaved: 0,
        error: "Sync already in progress"
      };
    }
    
    this.isSyncing = true;
    
    try {
      const limit = options.limit || 50;
      let page = 1;
      let hasMore = true;
      let totalSaved = 0;
      
      const startToast = toast.loading("Synchronisiere E-Mails...");
      
      while (hasMore) {
        // Fetch batch of emails with pagination
        const result = await this.fetchEmails(settings, {
          ...options,
          limit,
          offset: (page - 1) * limit // Berechne Offset basierend auf Seite
        });
        
        if (!result.success) {
          toast.dismiss(startToast);
          toast.error("Fehler bei der Synchronisierung", {
            description: result.error
          });
          return {
            success: false,
            totalSaved,
            error: result.error
          };
        }
        
        // Save emails to database
        if (result.emails && result.emails.length > 0) {
          const saveResult = await this.saveEmailsToDatabase(result.emails, settings.folder);
          
          if (!saveResult.success) {
            toast.dismiss(startToast);
            toast.error("Fehler beim Speichern", {
              description: saveResult.error
            });
            return {
              success: false,
              totalSaved,
              error: saveResult.error
            };
          }
          
          totalSaved += saveResult.savedCount;
          
          // Update progress toast
          toast.dismiss(startToast);
          if (result.hasMore) {
            toast.loading(`${totalSaved} E-Mails synchronisiert, lade weitere...`);
          }
        }
        
        // Check if we need to continue
        hasMore = result.hasMore || false;
        
        if (hasMore) {
          page += 1; // Nächste Seite
          // Short delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.dismiss(startToast);
      
      if (totalSaved > 0) {
        toast.success(`E-Mail-Synchronisierung abgeschlossen`, {
          description: `${totalSaved} E-Mails wurden synchronisiert`
        });
      } else {
        toast.info(`Keine neuen E-Mails gefunden`, {
          description: `Alle E-Mails sind bereits synchronisiert`
        });
      }
      
      return {
        success: true,
        totalSaved
      };
    } catch (error: any) {
      console.error("Error in syncEmailsWithPagination:", error);
      toast.error("Synchronisierungsfehler", {
        description: error.message
      });
      return {
        success: false,
        totalSaved: 0,
        error: error.message
      };
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Check if a sync is currently in progress
   */
  public static isSyncInProgress(): boolean {
    return this.isSyncing;
  }
  
  /**
   * Get remaining throttle time for a specific folder
   */
  public static async getThrottleTimeRemaining(folder: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this.THROTTLE_TIME;
    
    const folderKey = `${user.id}:${folder}`;
    const lastSync = this.lastSyncTime[folderKey];
    
    if (!lastSync) return 0;
    
    const now = new Date();
    const timeSinceLastSync = now.getTime() - lastSync.getTime();
    const timeRemaining = Math.max(0, this.THROTTLE_TIME - timeSinceLastSync);
    
    return timeRemaining;
  }
}
