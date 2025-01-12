import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Chat function loaded')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, teamId, platformId, currentTeamId, userId } = await req.json()

    if (!messages?.length) {
      throw new Error('Messages are required')
    }

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Ensure all messages have IDs
    const processedMessages = messages.map((msg: any) => ({
      ...msg,
      id: msg.id || `${msg.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    console.log('Processing chat request:', { 
      messageCount: processedMessages.length,
      teamId,
      platformId,
      currentTeamId,
      userId,
    })

    const openaiApiKey = req.headers.get('x-openai-key')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: processedMessages.map(({ role, content }) => ({ role, content })),
        stream: true,
        temperature: 0.7,
      }),
      method: 'POST',
    })

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    })
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})