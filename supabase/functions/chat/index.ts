import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Chat Function started')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    const openaiKey = req.headers.get('X-OpenAI-Key')
    if (!openaiKey) {
      throw new Error('No OpenAI API key provided')
    }

    const { messages } = await req.json()
    
    console.log('Processing chat request for user:', user.id)

    // Fetch user settings and context
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Build system message with user context
    const systemMessage = {
      role: 'system',
      content: `Du bist ein hilfreicher Assistent für ${settings?.company_name || 'das Unternehmen'}. 
                Nutze folgende Informationen über das Unternehmen:
                ${settings?.business_description || ''}
                Produkte/Services: ${settings?.products_services || ''}
                Zielgruppe: ${settings?.target_audience || ''}
                USP: ${settings?.usp || ''}
                Antworte kurz und präzise auf Deutsch.`
    }

    console.log('Sending request to OpenAI API')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error('Failed to get response from OpenAI')
    }

    const reader = response.body?.getReader()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              break
            }

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              if (line.startsWith('data: ')) {
                try {
                  const json = JSON.parse(line.slice(6))
                  const content = json.choices[0]?.delta?.content
                  if (content) {
                    console.log('Streaming content:', content)
                    const streamData = JSON.stringify({ content })
                    controller.enqueue(encoder.encode(`data: ${streamData}\n\n`))
                  }
                } catch (error) {
                  console.warn('Invalid JSON in chunk:', line)
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in stream processing:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
