import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncOptions {
  forceRefresh?: boolean;
  silent?: boolean;
}

interface SyncResult {
  success: boolean;
  message: string;
  folderCount?: number;
  emailsCount?: number;
  error?: string;
}

/**
 * Service to handle email synchronization with proper caching
 */
export class EmailSyncService {
  private static lastFolderSync: Date | null = null;
  private static syncInProgress: boolean = false;
  private static FOLDER_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Synchronize email folders with improved caching
   */
  public static async syncFolders(options: SyncOptions = {}): Promise<SyncResult> {
    const { forceRefresh = false, silent = true } = options;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: false, 
        message: "Cannot sync folders: Not authenticated"
      };
    }
    
    // Check if we're already syncing or if we synced recently (last 5 min)
    const now = new Date();
    if (!forceRefresh && this.lastFolderSync && 
        (now.getTime() - this.lastFolderSync.getTime() < this.FOLDER_SYNC_INTERVAL)) {
      console.log("Skipping folder sync - last sync too recent");
      return {
        success: true,
        message: "Using cached folder data",
        folderCount: 0
      };
    }
    
    // If already syncing, don't start another sync
    if (this.syncInProgress) {
      console.log("Folder sync already in progress");
      return {
        success: true,
        message: "Folder synchronization already in progress",
        folderCount: 0
      };
    }
    
    try {
      this.syncInProgress = true;
      
      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Show toast notification for folder sync (but only if not silent)
      let syncToastId;
      if (!silent) {
        syncToastId = toast.loading("Syncing email folders...");
      }
      
      // Call the edge function to sync folders
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            force_refresh: forceRefresh,
            detailed_logging: false
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the last sync time
        this.lastFolderSync = new Date();
        
        // Try to fix any duplicate folders in the database (silently)
        try {
          await supabase.rpc('fix_duplicate_email_folders', { user_id_param: user.id });
        } catch (fixError) {
          console.error("Error fixing duplicate folders:", fixError);
        }
        
        // Show success toast (but only if not silent)
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.success(`Email Folders Synced`, {
            description: `Successfully synced ${result.folderCount} folders`
          });
        }
        
        return result;
      } else {
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.error("Folder Sync Failed", {
            description: result.message || "Could not sync email folders"
          });
        }
        
        return result;
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      
      if (!silent) {
        toast.error("Folder Sync Failed", {
          description: error.message || "An unexpected error occurred"
        });
      }
      
      return {
        success: false,
        message: "Failed to sync folders",
        error: error.message || "Unknown error"
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Vollständiges Zurücksetzen der E-Mail-Synchronisation für den aktuellen Benutzer
   * Löscht alle Emails, Ordner und Attachments und setzt Synchronisierungsstatus zurück
   */
  static async resetEmailSync() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Benutzer ist nicht angemeldet");
      }
      
      // Verwende die Funktion cleanup_user_email_data von der Datenbank
      const { data, error } = await supabase.rpc(
        'cleanup_user_email_data',
        { user_id_param: session.user.id }
      );
      
      if (error) {
        console.error("Fehler beim Zurücksetzen der E-Mail-Daten:", error);
        return { 
          success: false, 
          error: error 
        };
      }
      
      return { 
        success: true, 
        message: "E-Mail-Synchronisation wurde zurückgesetzt",
        data: data
      };
    } catch (error) {
      console.error("Ausnahme beim Zurücksetzen der E-Mails:", error);
      return { 
        success: false, 
        error: error 
      };
    }
  }
  
  /**
   * Starten einer vollständigen Synchronisation für den aktuellen Benutzer
   */
  static async startFullSync() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }
      
      toast.info("E-Mail-Synchronisation wird gestartet", {
        description: "Dies kann einige Minuten dauern."
      });
      
      // Abrufen der IMAP-Einstellungen
      const { data: imapSettings, error: imapError } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (imapError || !imapSettings) {
        throw new Error("IMAP-Einstellungen nicht gefunden");
      }
      
      // Synchronisationsoption konfigurieren
      const syncOptions = {
        folder: 'INBOX', // Beginne mit dem Posteingang
        force_refresh: true,
        max_emails: imapSettings.max_emails || 500,
        historical_sync: imapSettings.historical_sync || false,
        batch_processing: true,
        max_batch_size: 25,
        connection_timeout: 60000,
        retry_attempts: 3
      };
      
      // Funktion zur Synchronisierung aufrufen
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(syncOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("E-Mails wurden synchronisiert", {
          description: `${result.emailsCount || 0} neue E-Mails synchronisiert`
        });
        
        return {
          success: true,
          data: result
        };
      } else {
        throw new Error(result.message || 'Fehler bei der E-Mail-Synchronisation');
      }
    } catch (error: any) {
      console.error('Fehler bei der E-Mail-Synchronisation:', error);
      
      toast.error("Synchronisation fehlgeschlagen", {
        description: error.message || 'Ein Fehler ist aufgetreten'
      });
      
      return {
        success: false, 
        error: error
      };
    }
  }
  
  /**
   * E-Mail-Anhänge für eine bestimmte E-Mail abrufen
   */
  static async getAttachments(emailId: string) {
    try {
      const { data, error } = await supabase
        .from('email_attachments')
        .select('*')
        .eq('email_id', emailId);
      
      if (error) throw error;
      
      return {
        success: true,
        attachments: data
      };
    } catch (error) {
      console.error('Fehler beim Abrufen von Anhängen:', error);
      return {
        success: false,
        error: error,
        attachments: []
      };
    }
  }
  
  /**
   * Inhalt eines Anhangs abrufen
   */
  static async getAttachmentContent(attachmentId: string) {
    try {
      const { data, error } = await supabase
        .from('email_attachments')
        .select('file_content, file_name, file_type')
        .eq('id', attachmentId)
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        attachment: data
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Anhanginhalts:', error);
      return {
        success: false,
        error: error
      };
    }
  }
}
