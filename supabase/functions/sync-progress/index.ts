
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Parse URL query parameters
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const folder = url.searchParams.get('folder');
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId is required' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 400 
      }
    );
  }

  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    ...corsHeaders
  });

  // Create a transformer to convert ReadableStream data to SSE format
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Create a Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Setup an interval to check for progress updates
  const intervalId = setInterval(async () => {
    try {
      // Get the latest email sync status
      const { data: syncStatus, error } = await supabase
        .from('email_sync_status')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sync status:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
        );
        return;
      }

      if (syncStatus) {
        // Check if we have folder-specific progress
        let progress = syncStatus.progress;
        let status = syncStatus.status;
        let details = syncStatus.details || {};
        
        if (folder && syncStatus.folder_progress && syncStatus.folder_progress[folder]) {
          progress = syncStatus.folder_progress[folder].progress;
          status = syncStatus.folder_progress[folder].status;
          details = syncStatus.folder_progress[folder].details || {};
        }
        
        // Send the progress update
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            progress, 
            status,
            details,
            timestamp: new Date().toISOString()
          })}\n\n`)
        );
        
        // If the sync is complete (progress >= 100 or status is 'completed'), stop checking
        if (progress >= 100 || status === 'completed' || status === 'error') {
          clearInterval(intervalId);
          await writer.close();
        }
      } else {
        // If no status exists yet, just send a default progress of 0
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ progress: 0, status: 'waiting' })}\n\n`)
        );
      }
    } catch (e) {
      console.error('Error in progress check interval:', e);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`)
      );
      clearInterval(intervalId);
      await writer.close();
    }
  }, 1000); // Check every second

  // If the client disconnects, stop the interval
  req.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
  });

  // Return the stream as the response
  return new Response(stream.readable, { headers });
});
