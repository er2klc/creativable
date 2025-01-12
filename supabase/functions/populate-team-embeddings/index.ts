import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Populate team embeddings function loaded')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all teams
    const { data: teams, error: teamsError } = await supabaseClient
      .from('teams')
      .select('*')

    if (teamsError) throw teamsError

    const openAIKey = req.headers.get('x-openai-key')
    if (!openAIKey) {
      throw new Error('OpenAI API key is required')
    }

    console.log(`Processing ${teams.length} teams`)

    for (const team of teams) {
      try {
        // Generate embedding for team description
        if (team.description) {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              input: team.description,
              model: 'text-embedding-3-small'
            })
          })

          if (!embeddingResponse.ok) {
            throw new Error('Failed to generate embedding')
          }

          const { data: [{ embedding }] } = await embeddingResponse.json()

          // Store the embedding
          const { error: insertError } = await supabaseClient
            .from('team_content_embeddings')
            .insert({
              team_id: team.id,
              content_type: 'team',
              content_id: team.id,
              content: team.description,
              embedding,
              metadata: { type: 'description' }
            })

          if (insertError) throw insertError
          console.log(`Processed team description for team ${team.id}`)
        }

        // Get and process team posts
        const { data: posts, error: postsError } = await supabaseClient
          .from('team_posts')
          .select('*')
          .eq('team_id', team.id)

        if (postsError) throw postsError

        for (const post of posts) {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              input: `${post.title} ${post.content}`,
              model: 'text-embedding-3-small'
            })
          })

          if (!embeddingResponse.ok) {
            throw new Error('Failed to generate embedding')
          }

          const { data: [{ embedding }] } = await embeddingResponse.json()

          // Store the embedding
          const { error: insertError } = await supabaseClient
            .from('team_content_embeddings')
            .insert({
              team_id: team.id,
              content_type: 'team',
              content_id: post.id,
              content: `${post.title} ${post.content}`,
              embedding,
              metadata: { type: 'post' }
            })

          if (insertError) throw insertError
          console.log(`Processed post ${post.id} for team ${team.id}`)
        }
      } catch (error) {
        console.error(`Error processing team ${team.id}:`, error)
        // Continue with next team even if one fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Team embeddings population completed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in populate-team-embeddings function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})