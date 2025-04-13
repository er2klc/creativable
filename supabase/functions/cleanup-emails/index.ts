
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('Authentication error:', userError);
      throw new Error('Authentication failed: ' + userError.message);
    }
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }
    
    console.log(`Cleaning up email data for user ${user.id}`);
    
    // Try to use the database function first (more efficient method)
    try {
      const { data, error } = await supabaseClient.rpc(
        'cleanup_user_email_data',
        { user_id_param: user.id }
      );
      
      if (!error) {
        console.log('Successfully reset email data using DB function');
        return new Response(
          JSON.stringify({
            success: true,
            message: 'E-Mail-Daten erfolgreich zurückgesetzt',
            method: 'database_function'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
      
      // If database function failed, continue with manual deletions
      console.log('Database function not available or failed, using manual deletion');
    } catch (dbFunctionError) {
      console.log('Database function error, falling back to manual deletion:', dbFunctionError);
    }
    
    // 1. Delete emails
    const { error: emailsError } = await supabaseClient
      .from('emails')
      .delete()
      .eq('user_id', user.id);
      
    if (emailsError) {
      console.error('Error deleting emails:', emailsError);
    }
    
    // 2. Delete email folders
    const { error: foldersError } = await supabaseClient
      .from('email_folders')
      .delete()
      .eq('user_id', user.id);
      
    if (foldersError) {
      console.error('Error deleting email folders:', foldersError);
    }
    
    // 3. Delete email attachments (email_id linked to deleted emails will cascade)
    // This might be handled by cascade deletes depending on your schema
    
    // 4. Delete email sync status entries
    const { error: syncError } = await supabaseClient
      .from('email_sync_status')
      .delete()
      .eq('user_id', user.id);
      
    if (syncError) {
      console.error('Error deleting sync status:', syncError);
    }
    
    // 5. Reset IMAP settings last sync date
    const { error: resetError } = await supabaseClient
      .from('imap_settings')
      .update({
        last_sync_date: null,
        historical_sync: false,
        syncing_historical: false,
        last_sync_status: null,
        sync_progress: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
    if (resetError) {
      console.error('Error resetting IMAP settings:', resetError);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-Mail-Daten erfolgreich zurückgesetzt',
        method: 'manual_deletion'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error in cleanup-emails function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Ein unbekannter Fehler ist aufgetreten"
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
