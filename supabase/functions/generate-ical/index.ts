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
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { 
          headers: { 
            Authorization: authHeader,
          },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    console.log("Authenticated user:", user.id);

    // Fetch user's appointments
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return new Response(
        JSON.stringify({ error: "Error fetching appointments", details: appointmentsError }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    console.log(`Found ${appointments.length} appointments`);

    // Format appointments for iCal
    const events = appointments.map((appointment) => {
      const startDate = new Date(appointment.due_date)
      return {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        ],
        duration: { hours: 1 },
        title: appointment.title,
        description: `Meeting with ${appointment.leads?.name || 'Client'}`,
        location: appointment.meeting_type || 'on_site',
        status: appointment.completed ? 'COMPLETED' : 'CONFIRMED',
      }
    })

    // Generate iCal content
    const { error: icsError, value: icsContent } = createEvents(events)

    if (icsError || !icsContent) {
      console.error('ICS error:', icsError)
      return new Response(
        JSON.stringify({ error: "Error generating iCal feed", details: icsError }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // Store the iCal file in Supabase Storage
    const fileName = `${user.id}/calendar.ics`
    const { error: uploadError } = await supabaseClient.storage
      .from('calendars')
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true // Override if exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: "Failed to upload calendar file", details: uploadError }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('calendars')
      .getPublicUrl(fileName)

    console.log("Generated calendar URL:", publicUrl);

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
    console.error('Error generating iCal feed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})