import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { createEvent, createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[iCal] Starting iCal generation process");
    
    // Log headers for debugging
    const authHeader = req.headers.get('Authorization');
    console.log("[iCal] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      console.error("[iCal] User authentication error:", userError);
      throw new Error('Unauthorized: Invalid token');
    }

    if (!user) {
      console.error("[iCal] No user found in token");
      throw new Error('Unauthorized: No user found');
    }

    console.log("[iCal] Fetching appointments for user:", user.id);

    // Fetch user's appointments
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true })

    if (appointmentsError) {
      console.error("[iCal] Error fetching appointments:", appointmentsError);
      throw new Error('Error fetching appointments');
    }

    console.log(`[iCal] Found ${appointments?.length || 0} appointments`);

    // Format appointments for iCal
    const events = appointments.map((appointment) => {
      const startDate = new Date(appointment.due_date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      return {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        ],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes()
        ],
        title: appointment.title,
        description: appointment.leads ? `Meeting with ${appointment.leads.name}` : 'Appointment',
        location: appointment.meeting_type || 'on_site',
        status: appointment.completed ? 'COMPLETED' : 'CONFIRMED',
        busyStatus: 'BUSY'
      }
    });

    console.log("[iCal] Generating iCal content");

    // Generate iCal content
    const { error: icsError, value: icsContent } = createEvents(events);

    if (icsError || !icsContent) {
      console.error('[iCal] ICS generation error:', icsError);
      throw new Error('Error generating iCal feed');
    }

    // Store the iCal file in Supabase Storage
    const fileName = `${user.id}/calendar.ics`;
    const { error: uploadError } = await supabaseClient.storage
      .from('calendars')
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true // Override if exists
      });

    if (uploadError) {
      console.error('[iCal] Upload error:', uploadError);
      throw new Error('Failed to upload calendar file');
    }

    console.log("[iCal] Calendar file uploaded successfully");

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('calendars')
      .getPublicUrl(fileName);

    console.log("[iCal] Generated public URL:", publicUrl);

    // Return the public URL
    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('[iCal] Error in generate-ical function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: error.message.includes('Unauthorized') ? 401 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})