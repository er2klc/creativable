import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ICalButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [iCalUrl, setICalUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateICalUrl = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Bitte melde dich an, um eine iCal URL zu generieren");
        return;
      }

      // Get the base URL from Supabase client
      const { data: { publicUrl } } = await supabase.storage.from('public').getPublicUrl('');
      const baseUrl = publicUrl.split('/storage/')[0];
      const functionUrl = `${baseUrl}/functions/v1/generate-ical`;

      console.log("Making request to:", functionUrl);
      console.log("With auth token:", session.access_token);

      // Make the request to generate iCal
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Fehler beim Abrufen der iCal-Daten: ${response.statusText}`);
      }

      const iCalData = await response.text();
      const blob = new Blob([iCalData], { type: 'text/calendar' });
      const iCalUrl = URL.createObjectURL(blob);

      setICalUrl(iCalUrl);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error generating iCal URL:", error);
      toast.error("Fehler beim Generieren der iCal URL");
    }
  };

  // ... keep existing code (handleCopyUrl and render methods)
};
Now, let's update the Edge Function to properly handle the authorization:

supabase/functions/generate-ical/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { createEvents } from "https://esm.sh/ics@3.7.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'text/calendar',
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

    // Convert appointments to iCal events
    const events = appointments.map((appointment) => ({
      start: new Date(appointment.due_date),
      end: appointment.end_date ? new Date(appointment.end_date) : new Date(appointment.due_date),
      title: appointment.title,
      description: `Meeting with ${appointment.leads?.name || 'Unknown'}`,
      location: appointment.meeting_type || '',
      status: appointment.completed ? 'COMPLETED' : 'CONFIRMED',
    }));

    // Generate iCal file
    const { error: icsError, value: icsContent } = createEvents(events);

    if (icsError) {
      console.error("ICS error:", icsError);
      throw icsError;
    }

    // Return the iCal file with proper headers
    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
      },
    });
  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 401, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})
