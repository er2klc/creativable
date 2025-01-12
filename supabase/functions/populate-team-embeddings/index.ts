import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')

    if (teamsError) throw teamsError

    const results = []

    for (const team of teams) {
      try {
        // Generate embedding for team description
        if (team.description) {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: team.description,
              model: 'text-embedding-3-small'
            }),
          })

          if (!embeddingResponse.ok) {
            throw new Error(`Failed to generate embedding for team ${team.id}`)
          }

          const { data: [{ embedding }] } = await embeddingResponse.json()

          // Store embedding
          const { error: insertError } = await supabase
            .from('content_embeddings')
            .insert({
              content_type: 'team',
              content_id: team.id,
              content: team.description,
              embedding,
              team_id: team.id,
              metadata: {
                type: 'team_description',
                team_name: team.name
              }
            })

          if (insertError) throw insertError

          results.push({
            team_id: team.id,
            status: 'success'
          })
        }

        // Fetch and process team posts
        const { data: posts, error: postsError } = await supabase
          .from('team_posts')
          .select('*')
          .eq('team_id', team.id)

        if (postsError) throw postsError

        for (const post of posts) {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: `${post.title}\n${post.content}`,
              model: 'text-embedding-3-small'
            }),
          })

          if (!embeddingResponse.ok) {
            throw new Error(`Failed to generate embedding for post ${post.id}`)
          }

          const { data: [{ embedding }] } = await embeddingResponse.json()

          const { error: insertError } = await supabase
            .from('content_embeddings')
            .insert({
              content_type: 'team',
              content_id: post.id,
              content: `${post.title}\n${post.content}`,
              embedding,
              team_id: team.id,
              metadata: {
                type: 'team_post',
                post_title: post.title
              }
            })

          if (insertError) throw insertError

          results.push({
            team_id: team.id,
            post_id: post.id,
            status: 'success'
          })
        }
      } catch (error) {
        console.error(`Error processing team ${team.id}:`, error)
        results.push({
          team_id: team.id,
          status: 'error',
          error: error.message
        })
      }
    }

    return new Response(JSON.stringify({ results }), {
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