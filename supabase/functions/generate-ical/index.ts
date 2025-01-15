import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { createEvent, createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Fetch user's appointments
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true })

    if (appointmentsError) {
      throw new Error('Error fetching appointments')
    }

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
        end: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours() + 1,
          startDate.getMinutes()
        ],
        title: appointment.title,
        description: Meeting with ${appointment.lead_id ? 'Client' : 'Unknown'},
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

    // Store the iCal file in Supabase Storage
    const fileName = ${user.id}/calendar.ics
    const { error: uploadError } = await supabaseClient.storage
      .from('calendars')
      .upload(fileName, icsContent, {
        contentType: 'text/calendar',
        upsert: true // Override if exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload calendar file')
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('calendars')
      .getPublicUrl(fileName)

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
