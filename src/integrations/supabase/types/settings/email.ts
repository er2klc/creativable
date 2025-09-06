
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
  
  /**
   * Whether a time discrepancy was detected
   */
  time_discrepancy_detected?: boolean;
  
  /**
   * The time difference in minutes if a discrepancy was detected
   */
  time_discrepancy_minutes?: number;
}
