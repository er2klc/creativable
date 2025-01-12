import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from '@supabase/supabase-js'

console.log('Chat function loaded')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, teamId, platformId, currentTeamId, userId } = await req.json()
    
    console.log('Processing chat request:', {
      messageCount: messages.length,
      teamId,
      platformId,
      currentTeamId,
      userId
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the last user message for context search
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')

    // Search for similar content if we have a user message
    let contextMessages = []
    if (lastUserMessage) {
      try {
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${req.headers.get('x-openai-key')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: lastUserMessage.content,
            model: 'text-embedding-3-small'
          })
        })

        if (!embeddingResponse.ok) {
          throw new Error('Failed to generate embedding')
        }

        const { data: [{ embedding }] } = await embeddingResponse.json()

        // Search for similar content
        const { data: similarContent } = await supabaseClient.rpc('match_content', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5,
          content_type: teamId ? 'team' : 'personal'
        })

        if (similarContent && similarContent.length > 0) {
          contextMessages = similarContent.map(content => ({
            role: 'system',
            content: `Relevant context: ${content.content}`
          }))
        }
      } catch (error) {
        console.error('Error searching similar content:', error)
        // Continue without context if search fails
      }
    }

    // Combine context with user messages
    const processedMessages = [
      ...messages.slice(0, 1), // System message
      ...contextMessages,
      ...messages.slice(1) // User messages
    ]

    console.log('Making request to OpenAI...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        Authorization: `Bearer ${req.headers.get('x-openai-key')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-0613',
        messages: processedMessages.map(({ role, content }) => ({ role, content })),
        stream: true,
        temperature: 0.7,
      }),
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Failed to get response from OpenAI')
    }

    console.log('OpenAI response received, starting stream...')

    // Transform the response stream
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          const trimmedLine = line.replace(/^data: /, '')
          
          // Skip [DONE] marker
          if (trimmedLine === '[DONE]') {
            return
          }

          try {
            const parsed = JSON.parse(trimmedLine)
            const content = parsed.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          } catch (error) {
            console.error('Error parsing chunk:', error)
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