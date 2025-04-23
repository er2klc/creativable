import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://lovable.dev",
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

  // Setup error handling for the stream
  const transformStream = new TransformStream();
  const writer = transformStream.writable.getWriter();
  const textEncoder = new TextEncoder();

  try {
    const { messages, teamId, userId, currentRoute } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    
    if (!apiKey) {
      await writer.write(textEncoder.encode(`data: ${JSON.stringify({ error: "OpenAI API key is required" })}\n\n`));
      await writer.close();
      return new Response(transformStream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const openai = new OpenAI({ apiKey });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize enhancedSystemMessage with base content
    let enhancedSystemMessage = messages[0].content + "\n\n";

    try {
      // Get user profile information
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      // Initialize context containers
      let currentContact = null;
      let recentContacts = [];
      let contactContext = null;

      // Always fetch recent contacts for context
      console.log('Fetching recent contacts for context');
      const { data: recentContactsData, error: recentContactsError } = await supabase
        .rpc('get_contact_context', {
          p_user_id: userId,
          p_contact_id: null
        });

      if (recentContactsError) {
        console.error('Error fetching recent contacts:', recentContactsError);
      } else {
        console.log('Found recent contacts:', recentContactsData?.length || 0);
        recentContacts = recentContactsData || [];
      }

      // Get specific contact if on contact route
      if (currentRoute?.startsWith('contacts/')) {
        const contactId = currentRoute.split('/')[1];
        console.log('Fetching detailed contact context for:', contactId);
        
        const { data: contextData, error: contextError } = await supabase
          .rpc('get_contact_context', {
            p_user_id: userId,
            p_contact_id: contactId
          })
          .single();
        
        if (!contextError && contextData) {
          contactContext = contextData;
          currentContact = {
            ...contextData,
            recent_posts: contextData.recent_posts || [],
            recent_notes: contextData.recent_notes || [],
            recent_messages: contextData.recent_messages || []
          };
        }
      }

      // Get last user message for context search
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      
      // Check if message contains a name for contact search
      if (lastUserMessage) {
        const messageText = lastUserMessage.content.toLowerCase();
        if (messageText.includes('nachricht') || messageText.includes('schreib') || messageText.includes('message')) {
          console.log('Message appears to be a contact request, searching for names...');
          
          // Extract potential name from message
          const words = messageText.split(' ');
          const nameIndex = words.findIndex(w => 
            w === 'für' || w === 'an' || w === 'to' || w === 'for'
          );
          
          if (nameIndex !== -1 && words[nameIndex + 1]) {
            const searchName = words[nameIndex + 1];
            console.log('Searching for contact with name:', searchName);
            
            // Search for contacts
            const { data: matchingContacts, error: searchError } = await supabase
              .rpc('match_lead_content', {
                p_user_id: userId,
                query_text: searchName,
                match_count: 5
              });

            if (!searchError && matchingContacts?.length > 0) {
              console.log('Found matching contacts:', matchingContacts);
              // Add contact information to context
              enhancedSystemMessage += "\nGefundene Kontakte:\n";
              matchingContacts.forEach(contact => {
                enhancedSystemMessage += `\n${contact.name}\n`;
                enhancedSystemMessage += `- Platform: ${contact.platform}\n`;
                if (contact.social_media_followers) {
                  enhancedSystemMessage += `- Follower: ${contact.social_media_followers}\n`;
                }
                if (contact.social_media_engagement_rate) {
                  enhancedSystemMessage += `- Engagement Rate: ${(contact.social_media_engagement_rate * 100).toFixed(2)}%\n`;
                }
                if (contact.social_media_bio) {
                  enhancedSystemMessage += `- Bio: ${contact.social_media_bio}\n`;
                }
                enhancedSystemMessage += `- Branche: ${contact.industry}\n`;
                if (contact.notes?.length > 0) {
                  enhancedSystemMessage += `- Letzte Notizen: ${contact.notes[0]}\n`;
                }
              });
            }
          }
        }
      }

      // Add user context if available
      if (userProfile) {
        enhancedSystemMessage += "Benutzerinformationen:\n";
        enhancedSystemMessage += `- Name: ${userProfile.display_name || 'Nicht angegeben'}\n`;
        enhancedSystemMessage += `- Email: ${userProfile.email || 'Nicht angegeben'}\n`;
        if (userProfile.is_admin) enhancedSystemMessage += "- Admin-Benutzer\n";
      }

      // Add recent contacts context
      if (recentContacts.length > 0) {
        enhancedSystemMessage += "\nLetzte Kontakte:\n";
        recentContacts.slice(0, 5).forEach((contact: any) => {
          enhancedSystemMessage += `- ${contact.name} (${contact.platform}, ${contact.industry})\n`;
          if (contact.last_interaction_date) {
            enhancedSystemMessage += `  Letzte Interaktion: ${new Date(contact.last_interaction_date).toLocaleDateString()}\n`;
          }
          if (contact.social_media_followers) {
            enhancedSystemMessage += `  Social: ${contact.social_media_followers} Follower, ${(contact.social_media_engagement_rate || 0).toFixed(2)}% Engagement\n`;
          }
        });
      } else {
        enhancedSystemMessage += "\nHinweis: Bisher wurden keine Kontakte angelegt.\n";
      }

      // Add current contact context if available
      if (currentContact) {
        enhancedSystemMessage += "\nAktueller Kontakt:\n";
        enhancedSystemMessage += `- Name: ${currentContact.name}\n`;
        enhancedSystemMessage += `- Platform: ${currentContact.platform}\n`;
        enhancedSystemMessage += `- Industry: ${currentContact.industry}\n`;
        enhancedSystemMessage += `- Bio: ${currentContact.social_media_bio || 'Keine Bio verfügbar'}\n`;
        enhancedSystemMessage += `- Follower: ${currentContact.social_media_followers || 0}\n`;
        enhancedSystemMessage += `- Engagement Rate: ${(currentContact.social_media_engagement_rate || 0).toFixed(2)}%\n`;
        
        if (currentContact.recent_posts?.length > 0) {
          enhancedSystemMessage += "\nLetzte Posts:\n";
          currentContact.recent_posts.forEach((post: any) => {
            enhancedSystemMessage += `- ${post.content} (${post.likes_count} Likes, ${post.comments_count} Kommentare)\n`;
          });
        }

        if (currentContact.recent_notes?.length > 0) {
          enhancedSystemMessage += "\nLetzte Notizen:\n";
          currentContact.recent_notes.slice(0, 3).forEach((note: string) => {
            enhancedSystemMessage += `- ${note}\n`;
          });
        }

        if (currentContact.recent_messages?.length > 0) {
          enhancedSystemMessage += "\nLetzte Nachrichten:\n";
          currentContact.recent_messages.slice(0, 3).forEach((message: string) => {
            enhancedSystemMessage += `- ${message}\n`;
          });
        }
      }

      // Update system message with context
      const enhancedMessages = [
        { role: 'system', content: enhancedSystemMessage },
        ...messages.slice(1)
      ];

      console.log("Sending request to OpenAI with context...");

      // Get response from OpenAI using the streaming API
      const stream = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: enhancedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const messageId = crypto.randomUUID();
      let accumulatedContent = '';

      // Stream the response in smaller chunks to avoid timeouts
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
      console.log("Successfully streamed OpenAI response");
    } catch (innerError) {
      console.error("Inner processing error:", innerError);
      const errorMessage = {
        error: true,
        message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        details: innerError.message
      };
      await writer.write(textEncoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
      await writer.write(textEncoder.encode('data: [DONE]\n\n'));
    }
    
    await writer.close();
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
    
    try {
      const errorMessage = {
        error: true,
        message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        details: error.message
      };
      
      await writer.write(textEncoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
      await writer.write(textEncoder.encode('data: [DONE]\n\n'));
      await writer.close();
      
      return new Response(transformStream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (streamError) {
      console.error("Error sending error response:", streamError);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json"
        },
      });
    }
  }
});
