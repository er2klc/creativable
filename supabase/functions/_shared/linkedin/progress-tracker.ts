import { SupabaseClient } from '@supabase/supabase-js';

export class ProgressTracker {
  private supabaseClient: SupabaseClient;
  private leadId: string;

  constructor(supabaseClient: SupabaseClient, leadId: string) {
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