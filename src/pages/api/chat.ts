import { NextRequest } from 'next/server';
import { supabase } from "@/integrations/supabase/client";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { messages, openaiKey, sessionToken } = await req.json();

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API Key fehlt' }), 
        { status: 400 }
      );
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages },
      headers: {
        'OpenAI-Key': openaiKey,
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}