import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Received request for iCal generation");
    
    // Check for authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      throw new Error('Unauthorized: Invalid authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log("Extracted token, attempting to create Supabase client");

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the user from the JWT token
    console.log("Attempting to get user from token");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error("Auth error:", userError)
      throw new Error('Unauthorized: Invalid user token')
    }

    console.log("Authenticated user:", user.id)

    // Fetch user's appointments
    console.log("Fetching appointments for user");
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      throw new Error('Error fetching appointments')
    }

    console.log(`Found ${appointments.length} appointments`)

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
    console.log("Generating iCal content");
    const { error: icsError, value: icsContent } = createEvents(events)

    if (icsError || !icsContent) {
      console.error('ICS error:', icsError)
      throw new Error('Error generating iCal feed')
    }

    const fileName = `calendar-${user.id}.ics`
    console.log("Uploading calendar file:", fileName);
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('calendars')
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload calendar file')
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('calendars')
      .getPublicUrl(fileName)

    console.log("Generated calendar URL:", publicUrl)

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
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
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