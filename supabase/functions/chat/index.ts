import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const openAiKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, openai_key, language = 'de' } = await req.json()
    const apiKey = openai_key || openAiKey

    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }

    const systemMessage = {
      role: "system",
      content: language === 'de' 
        ? "Du bist ein hilfreicher KI-Assistent. Antworte immer auf Deutsch."
        : "You are a helpful AI assistant. Always respond in English."
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate completion')
    }

    const reader = response.body?.getReader()
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

            const text = decoder.decode(value)
            const lines = text.split('\n')

            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') continue

              try {
                const message = line.replace(/^data: /, '')
                const json = JSON.parse(message)
                const token = json.choices[0]?.delta?.content || ''
                if (token) {
                  const chunk = new TextEncoder().encode(`data: ${JSON.stringify({ content: token })}\n\n`)
                  controller.enqueue(chunk)
                }
              } catch (error) {
                console.error('Error parsing line:', error)
                continue
              }
            }
          }
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})