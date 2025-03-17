
export interface EmailSettings {
  /**
   * Indicates if email settings are configured and connected
   */
  email_configured?: boolean;
  
  /**
   * Last email synchronization timestamp
   */
  last_email_sync?: string;
  
  /**
   * Configuration status for email features
   */
  email_sync_enabled?: boolean;
}
