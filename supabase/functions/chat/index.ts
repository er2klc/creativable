
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key, origin, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Expose-Headers": "*"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { messages, teamId, userId, currentRoute } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Initialize OpenAI with the new API version
    const openai = new OpenAI({ apiKey });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile information
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Get current contact if on contact route
    let currentContact = null;
    if (currentRoute?.startsWith('contacts/')) {
      const contactId = currentRoute.split('/')[1];
      const { data: contact, error: contactError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (!contactError && contact) {
        currentContact = contact;
      }
    }

    // Get last user message for context search
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    // Suche nach relevanten Kontakten
    console.log('Searching for leads with query:', lastUserMessage.content);
    const { data: relevantLeads, error: leadsError } = await supabase.rpc(
      'match_lead_content',
      {
        p_user_id: userId,
        query_text: lastUserMessage.content,
        match_count: 5
      }
    );

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
    } else {
      console.log('Found relevant leads:', relevantLeads);
    }

    // Get embedding for the last message
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: lastUserMessage.content,
    });
    
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Suche nach relevantem Kontext mit dem Embedding
    console.log('Searching for context with embedding');
    const { data: relevantContext, error: searchError } = await supabase.rpc(
      'match_combined_content',
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.7,
        match_count: 5,
        p_user_id: userId,
        p_team_id: teamId
      }
    );

    if (searchError) {
      console.error('Error searching for context:', searchError);
    } else {
      console.log('Found relevant context:', relevantContext);
    }
    
    // Build enhanced system message with context
    let enhancedSystemMessage = messages[0].content + "\n\n";

    // Add user context if available
    if (userProfile) {
      enhancedSystemMessage += "Benutzerinformationen:\n";
      enhancedSystemMessage += `- Name: ${userProfile.display_name || 'Nicht angegeben'}\n`;
      enhancedSystemMessage += `- Email: ${userProfile.email || 'Nicht angegeben'}\n`;
      if (userProfile.is_admin) enhancedSystemMessage += "- Admin-Benutzer\n";
    }

    // Add current contact context if available
    if (currentContact) {
      enhancedSystemMessage += "\nAktueller Kontakt:\n";
      enhancedSystemMessage += `- Name: ${currentContact.name}\n`;
      enhancedSystemMessage += `- Platform: ${currentContact.platform}\n`;
      enhancedSystemMessage += `- Industry: ${currentContact.industry}\n`;
      if (currentContact.last_interaction_date) {
        enhancedSystemMessage += `- Letzte Interaktion: ${new Date(currentContact.last_interaction_date).toLocaleDateString()}\n`;
      }
    }
    
    // Add relevant contacts
    if (relevantLeads && relevantLeads.length > 0) {
      enhancedSystemMessage += "\nRelevante Kontakte:\n";
      relevantLeads.forEach(lead => {
        enhancedSystemMessage += `- ${lead.name} (${lead.platform}): ${lead.industry}, Status: ${lead.status}\n`;
        if (lead.notes && lead.notes.length > 0) {
          enhancedSystemMessage += `  Letzte Notizen: ${lead.notes[0]}\n`;
        }
      });
    }

    // Add other context
    if (relevantContext && relevantContext.length > 0) {
      enhancedSystemMessage += "\nWeiterer relevanter Kontext:\n";
      relevantContext.forEach(ctx => {
        enhancedSystemMessage += `[${ctx.source}] ${ctx.content}\n`;
      });
    }

    // Update system message with context
    const enhancedMessages = [
      { role: 'system', content: enhancedSystemMessage },
      ...messages.slice(1)
    ];

    console.log('Enhanced system message:', enhancedSystemMessage);

    // Get response from OpenAI using the streaming API
    const stream = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: enhancedMessages,
      stream: true,
    });

    const textEncoder = new TextEncoder();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const messageId = crypto.randomUUID();
    let accumulatedContent = '';

    (async () => {
      try {
        for await (const part of stream) {
          const delta = part.choices[0]?.delta?.content || '';
          if (delta) {
            accumulatedContent += delta;
            const message = {
              id: messageId,
              role: 'assistant',
              delta: delta
            };
            await writer.write(textEncoder.encode(`data: ${JSON.stringify(message)}\n\n`));
          }
        }
        // Send the final message
        const finalMessage = {
          id: messageId,
          role: 'assistant',
          content: accumulatedContent,
          done: true
        };
        await writer.write(textEncoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
        await writer.write(textEncoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(transformStream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      },
    });
  }
});
