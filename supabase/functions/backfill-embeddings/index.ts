
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: teamPosts, error: postsError } = await supabase
      .from('team_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;

    const results = [];

    // Process team posts
    for (const post of teamPosts || []) {
      try {
        const { data, error } = await supabase
          .from('content_embeddings')
          .insert({
            content: post.content,
            content_type: 'team',
            metadata: {
              source_table: 'team_posts',
              source_id: post.id,
              created_at: post.created_at
            },
            team_id: post.team_id,
            user_id: post.created_by
          });

        if (error) throw error;
        results.push({ type: 'team_post', id: post.id, success: true });
      } catch (error) {
        console.error(`Error processing team post ${post.id}:`, error);
        results.push({ type: 'team_post', id: post.id, success: false, error: error.message });
      }
    }

    // Process notes
    for (const note of notes || []) {
      try {
        const { data, error } = await supabase
          .from('content_embeddings')
          .insert({
            content: note.content,
            content_type: 'personal',
            metadata: {
              source_table: 'notes',
              source_id: note.id,
              created_at: note.created_at
            },
            user_id: note.user_id
          });

        if (error) throw error;
        results.push({ type: 'note', id: note.id, success: true });
      } catch (error) {
        console.error(`Error processing note ${note.id}:`, error);
        results.push({ type: 'note', id: note.id, success: false, error: error.message });
      }
    }

    // Process messages
    for (const message of messages || []) {
      try {
        const { data, error } = await supabase
          .from('content_embeddings')
          .insert({
            content: message.content,
            content_type: 'personal',
            metadata: {
              source_table: 'messages',
              source_id: message.id,
              created_at: message.created_at
            },
            user_id: message.user_id
          });

        if (error) throw error;
        results.push({ type: 'message', id: message.id, success: true });
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        results.push({ type: 'message', id: message.id, success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in backfill-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
