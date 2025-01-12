import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    console.log('Processing chat request:', { 
      messageCount: messages.length,
      teamId,
      platformId,
      currentTeamId,
      userId,
    })

    // Ensure all messages have IDs
    const processedMessages = messages.map(msg => ({
      ...msg,
      id: msg.id || `${msg.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

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

    // Transform the response stream
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            // Special handling for [DONE] marker
            if (data.trim() === '[DONE]') {
              controller.enqueue('data: [DONE]\n\n')
              continue
            }

            // Forward the line as-is with double newline
            controller.enqueue(line + '\n\n')
          }
        }
      }
    })

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    })
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})