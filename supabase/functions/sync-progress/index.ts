import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // For SSE, we need to send specific headers
  const responseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    ...corsHeaders
  };

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const folder = url.searchParams.get('folder');
    
    if (!userId || !folder) {
      return new Response("Missing userId or folder parameter", { 
        status: 400,
        headers: corsHeaders 
      });
    }
    
    // Get the user's JWT from the request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      return new Response("Authentication required", { 
        status: 401,
        headers: corsHeaders 
      });
    }
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Server configuration error", { 
        status: 500,
        headers: corsHeaders 
      });
    }
    
    // Verify the user is accessing their own data
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY
      },
    });
    
    const userData = await userResponse.json();
    if (!userData.id || userData.id !== userId) {
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }
    
    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start: async (controller) => {
        let lastProgress = null;
        let consecutiveNoChanges = 0;
        
        // Keep track of whether the client has disconnected
        const intervalId = setInterval(async () => {
          try {
            // Query the email_sync_status table for the latest progress
            const progressResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}&select=progress,status,updated_at`,
              {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY
                }
              }
            );
            
            if (!progressResponse.ok) {
              throw new Error("Failed to fetch sync progress");
            }
            
            const progressData = await progressResponse.json();
            let currentProgress = null;
            
            if (progressData && progressData.length > 0) {
              currentProgress = progressData[0].progress;
              
              // Only send an update if the progress has changed
              if (currentProgress !== lastProgress) {
                const eventData = JSON.stringify({
                  progress: currentProgress,
                  status: progressData[0].status,
                  timestamp: progressData[0].updated_at
                });
                
                controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
                lastProgress = currentProgress;
                consecutiveNoChanges = 0;
              } else {
                consecutiveNoChanges++;
              }
              
              // If progress is 100, we're done
              if (currentProgress === 100) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: 100, status: "completed" })}\n\n`));
                clearInterval(intervalId);
                controller.close();
              }
              
              // If no progress changes for a while, close the connection
              if (consecutiveNoChanges > 10) {
                clearInterval(intervalId);
                controller.close();
              }
            } else {
              // No sync status found
              consecutiveNoChanges++;
              
              // After several attempts with no data, close the connection
              if (consecutiveNoChanges > 5) {
                clearInterval(intervalId);
                controller.close();
              }
            }
          } catch (error) {
            console.error("Error fetching sync progress:", error);
            clearInterval(intervalId);
            controller.close();
          }
        }, 2000); // Check every 2 seconds
        
        // Send an initial message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: 0, status: "initializing" })}\n\n`));
        
        // Ensure the interval is cleared if the client disconnects
        req.signal.addEventListener("abort", () => {
          clearInterval(intervalId);
          controller.close();
        });
      }
    });
    
    return new Response(stream, { headers: responseHeaders });
    
  } catch (error) {
    console.error("Error in sync-progress function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 500,
      }
    );
  }
});
