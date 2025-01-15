import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Received request headers:", Object.fromEntries(req.headers.entries()));
    
    // Get auth token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("No authorization header found");
      throw new Error('No authorization token provided');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("Extracted token:", token ? "Token present" : "No token");

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error('Invalid token');
    }

    console.log("Fetching appointments for user:", user.id);

    // Fetch user's appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    console.log("Found appointments:", appointments?.length);

    // Convert appointments to iCal events with proper date formatting
    const events = appointments.map((appointment) => {
      const startDate = new Date(appointment.due_date);
      const endDate = appointment.end_date ? new Date(appointment.end_date) : new Date(appointment.due_date);
      
      // Format dates as arrays: [year, month, day, hour, minute]
      const formatDateToArray = (date: Date) => [
        date.getFullYear(),
        date.getMonth() + 1, // months are 0-based
        date.getDate(),
        date.getHours(),
        date.getMinutes()
      ];

      return {
        start: formatDateToArray(startDate),
        end: formatDateToArray(endDate),
        title: appointment.title,
        description: `Meeting with ${appointment.leads?.name || 'Unknown'}`,
        location: appointment.meeting_type || '',
        status: appointment.completed ? 'COMPLETED' : 'CONFIRMED',
      };
    });

    console.log("Formatted events:", events);

    // Generate iCal file
    const { error: icsError, value: icsContent } = createEvents(events);

    if (icsError) {
      console.error("ICS error:", icsError);
      throw icsError;
    }

    // Store the iCal file in Supabase Storage
    const fileName = `${user.id}/calendar.ics`;
    const { error: uploadError } = await supabase.storage
      .from('calendars')  // Using the new 'calendars' bucket
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true // Override if exists
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error('Failed to upload calendar file');
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('calendars')  // Using the new 'calendars' bucket
      .getPublicUrl(fileName);

    // Return the public URL
    return new Response(
      JSON.stringify({ url: publicUrl }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})