
export interface EmailSettings {
  /**
   * Whether email is properly configured
   */
  email_configured?: boolean;
  
  /**
   * The last time email was synced
   */
  last_email_sync?: string | null;
  
  /**
   * Whether email syncing is enabled
   */
  email_sync_enabled?: boolean;
}
