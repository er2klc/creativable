import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { createEvents } from "https://esm.sh/ics@3.7.2"

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
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

    if (userError || !user) {
      console.error("Auth error:", userError)
      throw new Error('Unauthorized')
    }

    console.log("Authenticated user:", user.id)

    // Fetch user's appointments
    const { data: appointments, error: appointmentsError } = await supabaseClient
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
    const { error: icsError, value: icsContent } = createEvents(events)

    if (icsError || !icsContent) {
      console.error('ICS error:', icsError)
      throw new Error('Error generating iCal feed')
    }

    const fileName = `calendar-${user.id}.ics`
    const { error: uploadError } = await supabaseClient.storage
      .from('calendars')
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload calendar file')
    }

    const { data: { publicUrl } } = supabaseClient.storage
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