import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { format } from "https://esm.sh/date-fns@2.30.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const [teamId, userId] = url.pathname.split('/').slice(-2)

    if (!teamId || !userId) {
      throw new Error("Team ID and User ID are required")
    }

    console.log("[Team Calendar] Generating calendar for team:", teamId, "user:", userId)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Check if user is a member of the team
    const { data: teamMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (memberError || !teamMember) {
      throw new Error("User is not a member of this team")
    }

    // Fetch team calendar events
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('team_calendar_events')
      .select('*')
      .eq('team_id', teamId)
      .not('start_time', 'is', null)

    if (eventsError) {
      console.error("[Team Calendar] Error fetching events:", eventsError)
      throw eventsError
    }

    // Generate iCal content
    let iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lovable//Team Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    events.forEach((event) => {
      const startDate = new Date(event.start_time)
      const formattedStart = format(startDate, "yyyyMMdd'T'HHmmss'Z'")
      
      let eventContent = [
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${formattedStart}`,
        `DTSTART:${formattedStart}`,
      ]

      if (event.end_time) {
        const endDate = new Date(event.end_time)
        const formattedEnd = format(endDate, "yyyyMMdd'T'HHmmss'Z'")
        eventContent.push(`DTEND:${formattedEnd}`)
      }

      eventContent = eventContent.concat([
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        'END:VEVENT',
      ])

      iCalContent = iCalContent.concat(eventContent)
    })

    iCalContent.push('END:VCALENDAR')

    return new Response(iCalContent.join('\r\n'), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename=team-calendar.ics',
      },
    })

  } catch (error) {
    console.error("[Team Calendar] Error:", error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})