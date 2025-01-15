import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/calendar',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Invalid token')
    }

    console.log('Fetching appointments for user:', user.id)

    // Fetch user's appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', user.id)
      .eq('cancelled', false)
      .order('due_date', { ascending: true })

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

    console.log('Found appointments:', appointments?.length)

    // Convert appointments to iCal events
    const events = appointments.map((appointment) => ({
      start: new Date(appointment.due_date),
      end: appointment.end_date ? new Date(appointment.end_date) : new Date(appointment.due_date),
      title: appointment.title,
      description: `Meeting with ${appointment.leads?.name || 'Unknown'}`,
      location: appointment.meeting_type || '',
      status: appointment.completed ? 'COMPLETED' : 'CONFIRMED',
    }))

    // Generate iCal file
    const { error: icsError, value: icsContent } = createEvents(events)

    if (icsError) {
      console.error('ICS error:', icsError)
      throw icsError
    }

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Disposition': 'attachment; filename="calendar.ics"',
      },
    })
  } catch (error) {
    console.error('Error generating iCal feed:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})