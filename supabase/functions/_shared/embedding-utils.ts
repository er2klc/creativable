import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

// Initialize OpenAI
const initOpenAI = (apiKey: string) => {
  const configuration = new Configuration({ apiKey })
  return new OpenAIApi(configuration)
}

// Initialize Supabase client
const initSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// Generate embedding using OpenAI
export async function generateEmbedding(text: string, openai: OpenAIApi) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Store embedding in database
export async function storeEmbedding(
  supabase: any,
  content: string,
  embedding: number[],
  contentType: string,
  metadata: any = {},
  teamId?: string
) {
  try {
    const { data, error } = await supabase
      .from('content_embeddings')
      .insert([
        {
          content,
          embedding,
          content_type: contentType,
          metadata,
          team_id: teamId,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error storing embedding:', error)
    throw error
  }
}

// Process team data
export async function processTeamData(teamId: string, supabase: any, openai: OpenAIApi) {
  try {
    // Fetch team details
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!team) throw new Error('Team not found')

    // Get member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    // Get calendar events
    const { data: events } = await supabase
      .from('team_calendar_events')
      .select('*')
      .eq('team_id', teamId)

    // Get team posts
    const { data: posts } = await supabase
      .from('team_posts')
      .select('*')
      .eq('team_id', teamId)

    // Create comprehensive team description
    const teamDescription = `
      Team Name: ${team.name}
      Description: ${team.description || 'No description'}
      Members: ${memberCount}
      Events: ${events?.length || 0}
      Posts: ${posts?.length || 0}
    `.trim()

    // Generate and store embedding
    const embedding = await generateEmbedding(teamDescription, openai)
    await storeEmbedding(supabase, teamDescription, embedding, 'team', {
      teamId: team.id,
      teamName: team.name,
      type: 'team_overview'
    }, teamId)

    // Process events
    for (const event of events || []) {
      const eventContent = `
        Event: ${event.title}
        Description: ${event.description || 'No description'}
        Date: ${event.start_time}
      `.trim()

      const eventEmbedding = await generateEmbedding(eventContent, openai)
      await storeEmbedding(supabase, eventContent, eventEmbedding, 'team', {
        teamId: team.id,
        eventId: event.id,
        type: 'team_event'
      }, teamId)
    }

    // Process posts
    for (const post of posts || []) {
      const postContent = `
        Post: ${post.title}
        Content: ${post.content}
      `.trim()

      const postEmbedding = await generateEmbedding(postContent, openai)
      await storeEmbedding(supabase, postContent, postEmbedding, 'team', {
        teamId: team.id,
        postId: post.id,
        type: 'team_post'
      }, teamId)
    }

    console.log(`Processed team data for team ${team.name}`)
  } catch (error) {
    console.error('Error processing team data:', error)
    throw error
  }
}

// Process personal data
export async function processPersonalData(userId: string, supabase: any, openai: OpenAIApi) {
  try {
    // Fetch user settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Fetch tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)

    // Fetch leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)

    // Process settings
    if (settings) {
      const settingsContent = `
        Company: ${settings.company_name || 'Not specified'}
        Products/Services: ${settings.products_services || 'Not specified'}
        Target Audience: ${settings.target_audience || 'Not specified'}
        Business Description: ${settings.business_description || 'Not specified'}
      `.trim()

      const settingsEmbedding = await generateEmbedding(settingsContent, openai)
      await storeEmbedding(supabase, settingsContent, settingsEmbedding, 'personal', {
        userId,
        type: 'user_settings'
      })
    }

    // Process tasks
    for (const task of tasks || []) {
      const taskContent = `
        Task: ${task.title}
        Due: ${task.due_date || 'No due date'}
        Status: ${task.completed ? 'Completed' : 'Pending'}
      `.trim()

      const taskEmbedding = await generateEmbedding(taskContent, openai)
      await storeEmbedding(supabase, taskContent, taskEmbedding, 'personal', {
        userId,
        taskId: task.id,
        type: 'user_task'
      })
    }

    // Process leads
    for (const lead of leads || []) {
      const leadContent = `
        Lead: ${lead.name}
        Company: ${lead.company_name || 'Not specified'}
        Industry: ${lead.industry || 'Not specified'}
        Phase: ${lead.phase}
        Notes: ${lead.notes || 'No notes'}
      `.trim()

      const leadEmbedding = await generateEmbedding(leadContent, openai)
      await storeEmbedding(supabase, leadContent, leadEmbedding, 'personal', {
        userId,
        leadId: lead.id,
        type: 'user_lead'
      })
    }

    console.log(`Processed personal data for user ${userId}`)
  } catch (error) {
    console.error('Error processing personal data:', error)
    throw error
  }
}