import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export class ProgressTracker {
  private supabaseClient: any;
  private leadId: string;

  constructor(supabaseClient: any, leadId: string) {
    this.supabaseClient = supabaseClient;
    this.leadId = leadId;
  }

  async updateProgress(progress: number, message: string) {
    console.log(`Updating scan progress for lead ${this.leadId}: ${progress}% - ${message}`);
    
    try {
      const { error } = await this.supabaseClient
        .from('social_media_scan_history')
        .upsert({
          id: `temp-${this.leadId}`,
          lead_id: this.leadId,
          platform: 'LinkedIn',
          scanned_at: new Date().toISOString(),
          processing_progress: progress,
          current_file: message,
          success: progress === 100
        });

      if (error) {
        console.error('Error updating progress:', error);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }
}