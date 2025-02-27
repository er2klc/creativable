
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request data
    const { 
      leadId, 
      userName, 
      messageType, 
      platform, 
      platformConfig, 
      leadData, 
      existingAnalysis, 
      settings 
    } = await req.json();
    
    if (!leadId || !userName || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating message for lead: ${leadId}, platform: ${platform}, message type: ${messageType}`);

    // Use existing data or fetch fresh
    let lead = leadData;
    if (!lead) {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          social_media_posts:social_media_posts(content, platform, posted_at, likes_count, comments_count),
          notes:notes(content, created_at)
        `)
        .eq('id', leadId)
        .single();

      if (error) throw error;
      lead = data;
    }

    // Get existing analysis if not provided
    let analysis = existingAnalysis || '';
    if (!analysis) {
      const { data, error } = await supabase
        .from('phase_based_analyses')
        .select('content')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (!error && data) {
        analysis = data.content;
      }
    }

    // Get platform-specific config
    const config = platformConfig || {
      name: platform,
      maxLength: 2000,
      emoji: platform !== 'LinkedIn' && platform !== 'Email',
      styling: platform === 'LinkedIn' || platform === 'Email' ? 'professional' : 'casual'
    };
    
    // Define message context based on type
    let messageContext = "";
    const language = settings?.language || 'de';
    
    if (language === 'en') {
      switch(messageType) {
        case 'introduction':
          messageContext = "This is a first contact message. Focus on brief introduction and creating interest.";
          break;
        case 'follow_up':
          messageContext = "This is a follow-up message. Reference previous contact and provide value.";
          break;
        case 'response':
          messageContext = "This is a response to an inquiry. Be helpful and provide clear next steps.";
          break;
      }
    } else {
      switch(messageType) {
        case 'introduction':
          messageContext = "Dies ist eine Erstkontakt-Nachricht. Fokus auf kurze Vorstellung und Interesse wecken.";
          break;
        case 'follow_up':
          messageContext = "Dies ist eine Folgenachricht. Bezug auf vorherigen Kontakt nehmen und Mehrwert bieten.";
          break;
        case 'response':
          messageContext = "Dies ist eine Antwort auf eine Anfrage. Hilfreich sein und klare nächste Schritte anbieten.";
          break;
      }
    }

    // Extract recent posts and interactions for context
    const recentPosts = lead.social_media_posts 
      ? lead.social_media_posts.slice(0, 2).map(post => post.content).join('\n')
      : '';
      
    const recentNotes = lead.notes
      ? lead.notes.slice(0, 2).map(note => note.content).join('\n')
      : '';

    // Prepare system prompt based on language and platform
    const systemPrompt = language === 'en'
      ? `You are a ${platform} messaging expert creating an effective ${messageType} message for ${userName} to send to ${lead.name}.
         Create a ${config.styling} message optimized for ${platform} with these specifications:
         - Maximum length: ${config.maxLength} characters
         - Use of emojis: ${config.emoji ? 'Yes, tastefully' : 'No, keep it professional'}
         - Tone: ${config.styling === 'professional' ? 'Professional and courteous' : config.styling === 'formal' ? 'Formal and respectful' : config.styling === 'casual' ? 'Casual and friendly' : 'Neutral and clear'}
         
         ${messageContext}
         
         Write the message exactly as ${userName} should send it, ready to copy and paste.
         ${platform === 'LinkedIn' ? 'For LinkedIn, include a personalized connection request if appropriate.' : ''}
         ${platform === 'Instagram' ? 'For Instagram, keep it visually descriptive and engaging.' : ''}
         ${platform === 'Email' ? 'For Email, include a clear subject line suggestion at the beginning.' : ''}
         
         The message should be authentic, personal, and create a genuine connection.`
      
      : `Du bist ein ${platform}-Nachrichten-Experte und erstellst eine effektive ${messageType === 'introduction' ? 'Erstkontakt' : messageType === 'follow_up' ? 'Folge' : 'Antwort'}-Nachricht für ${userName} an ${lead.name}.
         Erstelle eine ${config.styling === 'professional' ? 'professionelle' : config.styling === 'formal' ? 'formelle' : config.styling === 'casual' ? 'lockere' : 'neutrale'} Nachricht, optimiert für ${platform} mit diesen Spezifikationen:
         - Maximale Länge: ${config.maxLength} Zeichen
         - Verwendung von Emojis: ${config.emoji ? 'Ja, geschmackvoll' : 'Nein, professionell halten'}
         - Tonfall: ${config.styling === 'professional' ? 'Professionell und höflich' : config.styling === 'formal' ? 'Formell und respektvoll' : config.styling === 'casual' ? 'Locker und freundlich' : 'Neutral und klar'}
         
         ${messageContext}
         
         Schreibe die Nachricht genau so, wie ${userName} sie senden sollte, bereit zum Kopieren und Einfügen.
         ${platform === 'LinkedIn' ? 'Für LinkedIn einen personalisierten Kontaktanfrage-Text einfügen, falls angebracht.' : ''}
         ${platform === 'Instagram' ? 'Für Instagram visuell ansprechend und engagierend gestalten.' : ''}
         ${platform === 'Email' ? 'Für E-Mail am Anfang einen klaren Betreff-Vorschlag angeben.' : ''}
         
         Die Nachricht sollte authentisch, persönlich sein und eine echte Verbindung herstellen.`;

    // Prepare user prompt with lead info and context
    const userPrompt = JSON.stringify({
      contact: {
        name: lead.name,
        platform: lead.platform,
        industry: lead.industry || 'Not specified',
        position: lead.position,
        company_name: lead.company_name,
        social_media_username: lead.social_media_username,
        social_media_bio: lead.social_media_bio,
        social_media_followers: lead.social_media_followers,
        social_media_following: lead.social_media_following,
        email: lead.email,
        phone_number: lead.phone_number,
      },
      sender: {
        name: userName,
        business_info: {
          company_name: settings?.company_name || '',
          products_services: settings?.products_services || '',
          target_audience: settings?.target_audience || '',
          usp: settings?.usp || '',
        }
      },
      existing_analysis: analysis,
      recent_social_media_posts: recentPosts,
      recent_interactions: recentNotes
    });

    // Generate message using OpenAI
    console.log('Sending request to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(2000, Math.floor(config.maxLength / 2)),
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const message = openAIData.choices[0].message.content;

    console.log('Message generated successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
