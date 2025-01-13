import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1/dist/module/index.js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the session from the request
    const authHeader = req.headers.get('Authorization')!
    
    // Create clients with the user JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError) throw userError
    if (!user) throw new Error('User not found')

    console.log('Deleting user data for user:', user.id)

    // Delete all user data from all tables
    const tables = [
      'documents',
      'keywords',
      'lead_phases',
      'leads',
      'message_templates',
      'messages',
      'notes',
      'platform_auth_status',
      'settings',
      'tasks'
    ]

    for (const table of tables) {
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .eq('user_id', user.id)
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error)
      }
    }

    // Delete the user from Supabase Auth
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    console.log('Successfully deleted user:', user.id)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})