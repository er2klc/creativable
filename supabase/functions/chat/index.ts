import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Chat function loaded')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get similar content if available
    let contextMessages = []
    if (messages?.length > 0) {
      const userMessage = messages[messages.length - 1]
      if (userMessage.role === 'user') {
        try {
          const { data: similarContent, error } = await supabase.rpc('match_content', {
            query_embedding: userMessage.content,
            match_threshold: 0.5,
            match_count: 5,
            content_type: 'personal'
          })

          if (error) {
            console.error('Error finding similar content:', error)
            throw error
          }

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
        const { data: teamContent, error } = await supabase.rpc('match_content', {
          query_embedding: messages[messages.length - 1].content,
          match_threshold: 0.5,
          match_count: 5,
          content_type: 'team'
        })

        if (error) {
          console.error('Error finding team content:', error)
          throw error
        }

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

    // Create stream transformer
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start OpenAI request
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    console.log('OpenAI response received, starting stream...')

    // Process the stream
    const reader = openAIResponse.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    // Stream processing loop
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('Stream complete')
            await writer.close()
            break
          }

          // Decode the chunk
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          
          for (const line of lines) {
            if (line.includes('[DONE]')) {
              console.log('Received [DONE] signal')
              continue
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
                
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
                )
              }
            } catch (error) {
              console.error('Error parsing chunk:', error)
              console.error('Problematic line:', line)
            }
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error)
        await writer.abort(error)
      }
    }

    // Start processing the stream
    processStream()

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})