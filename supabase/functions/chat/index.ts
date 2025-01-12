import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/types.ts'

const headers = {
  ...corsHeaders,
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

console.log('Chat function loaded')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { messages, teamId, platformId, currentTeamId, userId } = await req.json()
    const authHeader = req.headers.get('Authorization')
    const apiKey = req.headers.get('X-OpenAI-Key')

    if (!authHeader) {
      throw new Error('Missing auth header')
    }

    if (!apiKey) {
      throw new Error('Missing OpenAI API key')
    }

    console.log('Request received:', { 
      messagesCount: messages?.length,
      teamId,
      platformId,
      currentTeamId,
      userId
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get similar content if available
    let contextMessages = []
    if (messages?.length > 0) {
      const userMessage = messages[messages.length - 1]
      if (userMessage.role === 'user') {
        try {
          const { data: similarContent } = await supabase.rpc('match_content', {
            query_embedding: userMessage.content,
            match_threshold: 0.5,
            match_count: 5,
            content_type: 'personal'
          })

          if (similarContent?.length > 0) {
            console.log('Found similar content:', similarContent.length, 'items')
            contextMessages = similarContent.map(item => ({
              role: 'system',
              content: `Related content: ${item.content}`
            }))
          }
        } catch (error) {
          console.error('Error finding similar content:', error)
        }
      }
    }

    // Get team context if available
    if (teamId) {
      try {
        const { data: teamContent } = await supabase.rpc('match_team_content', {
          query_embedding: messages[messages.length - 1].content,
          match_threshold: 0.5,
          match_count: 5,
          team_id: teamId
        })

        if (teamContent?.length > 0) {
          console.log('Found team content:', teamContent.length, 'items')
          contextMessages = [
            ...contextMessages,
            ...teamContent.map(item => ({
              role: 'system',
              content: `Team context: ${item.content}`
            }))
          ]
        }
      } catch (error) {
        console.error('Error finding team content:', error)
      }
    }

    // Prepare messages for OpenAI
    const allMessages = [
      ...messages.slice(0, -1),
      ...contextMessages,
      messages[messages.length - 1]
    ]

    console.log('Sending messages to OpenAI:', allMessages.length)

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4',
        messages: allMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    console.log('OpenAI response received, starting stream...')

    const encoder = new TextEncoder()
    const stream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.includes('[DONE]')) {
            controller.terminate()
            return
          }
          
          try {
            const json = JSON.parse(line.replace(/^data: /, ''))
            const content = json.choices[0]?.delta?.content || ''
            
            if (content) {
              const message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content,
                createdAt: new Date().toISOString()
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
            }
          } catch (error) {
            console.error('Error parsing chunk:', error)
            console.error('Problematic line:', line)
          }
        }
      }
    })

    return new Response(response.body?.pipeThrough(stream), {
      headers
    })

  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})