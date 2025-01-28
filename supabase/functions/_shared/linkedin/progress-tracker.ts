import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export class ProgressTracker {
  private supabaseClient: any;
  private leadId: string;

  constructor(supabaseClient: any, leadId: string) {
    this.supabaseClient = supabaseClient;
    this.leadId = leadId;
  }

  async updateProgress(progress: number, message: string) {
    console.log(`Updating scan progress: ${progress}% - ${message}`);
    
    await this.supabaseClient
      .from('social_media_posts')
      .upsert({ 
        id: `temp-${this.leadId}`,
        lead_id: this.leadId,
        platform: 'LinkedIn',
        post_type: 'post',
        processing_progress: progress,
        current_file: message,
        media_processing_status: progress === 100 ? 'completed' : 'processing'
      });
  }
}