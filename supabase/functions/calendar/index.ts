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
    const userId = url.pathname.split('/').slice(-2)[0] // Get second to last segment

    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      throw new Error("Valid User ID is required")
    }

    console.log("[Personal Calendar] Generating calendar for user:", userId)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch user's tasks (appointments)
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*, leads(name)')
      .eq('user_id', userId)
      .not('due_date', 'is', null)

    if (tasksError) {
      console.error("[Personal Calendar] Error fetching tasks:", tasksError)
      throw tasksError
    }

    // Generate iCal content
    let iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lovable//Personal Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    tasks.forEach((task) => {
      const dueDate = new Date(task.due_date)
      const formattedDate = format(dueDate, "yyyyMMdd'T'HHmmss'Z'")
      const leadName = task.leads?.name || ''
      
      iCalContent = iCalContent.concat([
        'BEGIN:VEVENT',
        `UID:${task.id}`,
        `DTSTAMP:${formattedDate}`,
        `DTSTART:${formattedDate}`,
        `SUMMARY:${task.title}${leadName ? ` mit ${leadName}` : ''}`,
        'END:VEVENT',
      ])
    })

    iCalContent.push('END:VCALENDAR')

    return new Response(iCalContent.join('\r\n'), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename=personal-calendar.ics',
      },
    })

  } catch (error) {
    console.error("[Personal Calendar] Error:", error)
    
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