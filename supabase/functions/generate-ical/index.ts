import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("[iCal] Starting iCal generation process");
    
    const authHeader = req.headers.get('Authorization');
    console.log("[iCal] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Unauthorized: No Authorization header provided");
    }

    // Create a Supabase client with the user's JWT
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Create an admin client with service role for storage operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error("[iCal] User auth error:", userError);
      throw new Error("Unauthorized: Invalid token");
    }

    const { teamId } = await req.json();

    // Generate calendar content based on whether it's a team or personal calendar
    let calendarContent;
    if (teamId) {
      console.log("[iCal] Generating team calendar for team:", teamId);
      
      // Verify team membership
      const { data: membership, error: membershipError } = await userClient
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.error("[iCal] Team membership verification failed:", membershipError);
        throw new Error("Unauthorized: Not a team member");
      }
      
      // Generate team calendar content
      const { data: events, error: eventsError } = await userClient
        .from('team_calendar_events')
        .select('*')
        .eq('team_id', teamId);

      if (eventsError) {
        console.error("[iCal] Error fetching team events:", eventsError);
        throw eventsError;
      }

      calendarContent = generateICalContent(events, true);
    } else {
      console.log("[iCal] Generating personal calendar for user:", user.id);
      
      // Generate personal calendar content
      const { data: tasks, error: tasksError } = await userClient
        .from('tasks')
        .select('*, leads(name)')
        .eq('user_id', user.id)
        .not('due_date', 'is', null);

      if (tasksError) {
        console.error("[iCal] Error fetching tasks:", tasksError);
        throw tasksError;
      }

      calendarContent = generateICalContent(tasks, false);
    }

    // Create a unique filename for the calendar that matches our RLS policies
    const filename = teamId 
      ? `${teamId}/calendar.ics`
      : `${user.id}/calendar.ics`;

    console.log("[iCal] Uploading calendar file:", filename);

    // Use the admin client for storage operations
    const { data, error: uploadError } = await adminClient
      .storage
      .from('calendars')
      .upload(filename, calendarContent, {
        contentType: 'text/calendar',
        upsert: true
      });

    if (uploadError) {
      console.error("[iCal] Upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl }, error: urlError } = adminClient
      .storage
      .from('calendars')
      .getPublicUrl(filename);

    if (urlError) {
      console.error("[iCal] Error getting public URL:", urlError);
      throw urlError;
    }

    console.log("[iCal] Successfully generated calendar URL");

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );

  } catch (error) {
    console.error("[iCal] Error:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: error.message?.includes('Unauthorized') ? 401 : 500,
      },
    );
  }
});

function generateICalContent(events: any[], isTeamCalendar: boolean): string {
  let iCalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lovable//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((event) => {
    if (isTeamCalendar) {
      // Handle team calendar events
      const startDate = new Date(event.start_time);
      const endDate = event.end_time ? new Date(event.end_time) : startDate;
      
      iCalContent = iCalContent.concat([
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${formatDate(startDate)}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        'END:VEVENT',
      ]);
    } else {
      // Handle personal calendar events (tasks)
      const dueDate = new Date(event.due_date);
      const leadName = event.leads?.name || '';
      
      iCalContent = iCalContent.concat([
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${formatDate(dueDate)}`,
        `DTSTART:${formatDate(dueDate)}`,
        `SUMMARY:${event.title}${leadName ? ` mit ${leadName}` : ''}`,
        'END:VEVENT',
      ]);
    }
  });

  iCalContent.push('END:VCALENDAR');
  return iCalContent.join('\r\n');
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}