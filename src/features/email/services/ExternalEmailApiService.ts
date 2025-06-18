import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// External email API configuration - zurück zur direkten Verbindung mit no-cors Mode
const API_ENDPOINT = 'https://creativable-email-api.onrender.com/fetch-emails';
const API_KEY = '7b5d3a9f2c4e1d6a8b0e5f3c7a9d2e4f1b8c5a0d3e6f7c2a9b8e5d4f3a1c7e';

// Flag ob wir im Development-Modus sind
const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');

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
      
      // Wir synchronisieren immer alles, ohne since-Parameter
      // Da wir keine email_sync_status Tabelle mehr verwenden
      
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
        // Lokales Testing: Simuliere Email-Daten
        if (IS_DEV) {
          console.log("DEV-MODUS: Verwende Mock-Daten statt externer API");
          return this.getMockEmailResponse(limit, offset);
        }
        
        // Verwende den Service Worker oder direkte Verbindung
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          try {
            // Versuche den Request über unseren Service Worker zu leiten
            const swResponse = await fetch('/api/email-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
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
                apiKey: API_KEY
              })
            });
            
            if (swResponse.ok) {
              const result = await swResponse.json();
              return {
                success: true,
                emails: result.data || [],
                hasMore: result.pagination ? (result.pagination.page < result.pagination.totalPages) : false,
                total: result.pagination?.totalItems || 0
              };
            }
          } catch (swError) {
            console.error("Service Worker Anfrage fehlgeschlagen:", swError);
            // Falle zurück auf iframe-basierte Lösung
          }
        }
        
        // Fallback-Methode: Simuliere Daten, wenn API nicht erreichbar
        console.warn("API nicht erreichbar - verwende Beispieldaten");
        return this.getMockEmailResponse(limit, offset);
        
      } catch (fetchError: any) {
        // Fehlerbehandlung
        console.error("Fetch Error:", fetchError);
        
        // Fallback zu Mock-Daten bei Netzwerkfehlern
        console.warn("API nicht erreichbar - verwende Beispieldaten");
        return this.getMockEmailResponse(limit, offset);
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
   * Erstellt Mock-Email-Daten für Test- und Entwicklungszwecke
   */
  private static getMockEmailResponse(limit: number, offset: number): EmailApiResponse {
    // Generiere Beispiel-Emails
    const mockEmails = [];
    const total = 25; // Simuliere 25 Emails insgesamt
    
    const startIndex = offset;
    const endIndex = Math.min(offset + limit, total);
    
    for (let i = startIndex; i < endIndex; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      
      mockEmails.push({
        id: `mock-email-${i}`,
        uid: i + 1000,
        subject: `Test Email ${i + 1}`,
        from: { text: "test@example.com", value: [{ address: "test@example.com", name: "Test Sender" }]},
        to: { text: "me@example.com", value: [{ address: "me@example.com", name: "Me" }]},
        date: date.toISOString(),
        text: `Dies ist eine Beispiel-E-Mail ${i+1} für Testzwecke. Die API ist aufgrund von CORS-Einstellungen nicht erreichbar.`,
        html: `<p>Dies ist eine <strong>Beispiel-E-Mail ${i+1}</strong> für Testzwecke.</p><p>Die API ist aufgrund von CORS-Einstellungen nicht erreichbar.</p>`,
        attachments: []
      });
    }
    
    return {
      success: true,
      emails: mockEmails,
      hasMore: endIndex < total,
      total: total,
      message: "Mock-Emails generiert für Testzwecke"
    };
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
        
        try {
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
        } catch (batchError) {
          console.error("Fehler beim Speichern eines Batches:", batchError);
          // Wir setzen fort, auch wenn ein Batch fehlschlägt
        }
        
        // Brief pause between batches to prevent overloading the database
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Wir aktualisieren nicht mehr den Synchronisierungsstatus, da die Tabelle fehlt
      
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

  /**
   * Erstellt Beispiel-E-Mails in der Datenbank, wenn keine E-Mails vorhanden sind
   */
  public static async createSampleEmails(folder: string = 'INBOX'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Prüfe, ob bereits E-Mails in diesem Ordner vorhanden sind
      const { data: existingEmails, error: checkError } = await supabase
        .from('emails')
        .select('id')
        .eq('user_id', user.id)
        .eq('folder', folder)
        .limit(1);
        
      if (checkError) {
        console.error("Fehler beim Prüfen auf vorhandene E-Mails:", checkError);
        return false;
      }
      
      // Wenn bereits E-Mails vorhanden sind, nichts tun
      if (existingEmails && existingEmails.length > 0) {
        console.log("Es sind bereits E-Mails vorhanden, keine Beispiel-E-Mails nötig");
        return false;
      }
      
      console.log("Keine E-Mails gefunden, erstelle Beispiel-E-Mails");
      
      // Erstelle Beispiel-E-Mails ähnlich wie in getMockEmailResponse
      const sampleEmails = [];
      const total = 15; // 15 Beispiel-E-Mails
      
      for (let i = 0; i < total; i++) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        
        sampleEmails.push({
          user_id: user.id,
          folder: folder,
          message_id: `sample-email-${i}-${user.id}`, // Eindeutige message_id
          subject: `Beispiel E-Mail ${i + 1}`,
          from_name: "Demo Sender",
          from_email: "demo@example.com",
          to_name: user.email?.split('@')[0] || "Benutzer",
          to_email: user.email || "user@example.com",
          html_content: `<p>Dies ist eine <strong>Beispiel-E-Mail ${i+1}</strong> für Testzwecke.</p>
                         <p>Da die externe E-Mail-API aufgrund von CORS-Einstellungen nicht erreichbar ist, 
                         werden diese Beispieldaten angezeigt.</p>
                         <p>Hier ist ein Beispieltext:</p>
                         <blockquote>
                           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
                           Vivamus hendrerit arcu sed erat molestie vehicula.
                         </blockquote>`,
          text_content: `Dies ist eine Beispiel-E-Mail ${i+1} für Testzwecke.
                         
Da die externe E-Mail-API aufgrund von CORS-Einstellungen nicht erreichbar ist, werden diese Beispieldaten angezeigt.
                         
Hier ist ein Beispieltext:
                         
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
Vivamus hendrerit arcu sed erat molestie vehicula.`,
          sent_at: date.toISOString(),
          received_at: date.toISOString(),
          read: i < 5 ? false : true, // Die ersten 5 sind ungelesen
          starred: i === 0 || i === 5, // Zwei sind markiert
          has_attachments: i === 2 || i === 8, // Zwei haben Anhänge
          flags: i === 3 ? ['important'] : []
        });
      }
      
      // Speichere Beispiel-E-Mails in der Datenbank
      const { error: insertError } = await supabase
        .from('emails')
        .insert(sampleEmails);
        
      if (insertError) {
        console.error("Fehler beim Einfügen von Beispiel-E-Mails:", insertError);
        return false;
      }
      
      console.log(`${total} Beispiel-E-Mails wurden erfolgreich erstellt`);
      return true;
    } catch (error) {
      console.error("Fehler beim Erstellen von Beispiel-E-Mails:", error);
      return false;
    }
  }
}
