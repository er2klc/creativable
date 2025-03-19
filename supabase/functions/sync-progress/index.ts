
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Content-Type": "text/event-stream",
  "Connection": "keep-alive",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const folder = url.searchParams.get('folder');
    
    if (!userId || !folder) {
      throw new Error("Missing required parameters: userId and folder");
    }
    
    // Create an event stream response
    const stream = new ReadableStream({
      start: async (controller) => {
        let lastProgress = 0;
        let lastUpdate = Date.now();
        let done = false;
        let reconnectAttempts = 0;
        
        // Send initial connection confirmation
        const initialData = `data: ${JSON.stringify({ connected: true, progress: 0 })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialData));
        
        // Set up polling for progress updates
        while (!done && reconnectAttempts < 30) { // Limit to 30 attempts (5 minutes)
          try {
            const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
            
            if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
              throw new Error("Missing Supabase environment variables");
            }
            
            // Query the sync status
            const syncStatusResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}&select=items_synced`,
              {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!syncStatusResponse.ok) {
              throw new Error(`Failed to fetch sync status: ${syncStatusResponse.status}`);
            }
            
            const syncStatus = await syncStatusResponse.json();
            
            if (syncStatus && syncStatus.length > 0) {
              const itemsSynced = syncStatus[0].items_synced || 0;
              
              // Calculate estimated progress
              // Since we don't know the total, we'll use a reasonable estimate
              // and gradually approach 100% as time passes without updates
              
              let progress = Math.min(95, Math.floor((itemsSynced / 100) * 100));
              
              // If no items synced in a while, increase progress
              const now = Date.now();
              const timeSinceUpdate = now - lastUpdate;
              
              if (progress === lastProgress && timeSinceUpdate > 5000) {
                // Gradually approach 99% if no updates
                const timeBasedProgress = Math.min(99, lastProgress + Math.floor(timeSinceUpdate / 1000));
                progress = Math.max(progress, timeBasedProgress);
              }
              
              // If we reach 99% and no updates for 10 seconds, consider it done
              if (progress >= 99 && timeSinceUpdate > 10000) {
                progress = 100;
                done = true;
              }
              
              // Only send update if progress changed or for the first update
              if (progress !== lastProgress || lastProgress === 0) {
                lastProgress = progress;
                lastUpdate = now;
                
                // Send progress event
                const data = `data: ${JSON.stringify({ progress })}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
              }
            }
          } catch (error) {
            console.error("Error fetching sync progress:", error);
            reconnectAttempts++;
            
            // Send error event
            const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorData));
          }
          
          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Send completion event
        const finalData = `data: ${JSON.stringify({ progress: 100, complete: true })}\n\n`;
        controller.enqueue(new TextEncoder().encode(finalData));
        
        // Close the stream
        controller.close();
      }
    });
    
    // Return the event stream response
    return new Response(stream, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Error in sync-progress function:", error);
    
    // For errors, return a regular JSON response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to track sync progress",
        error: error.message
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 400
      }
    );
  }
});
