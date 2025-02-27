
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'
import OpenAI from "https://esm.sh/openai@4.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface MatchRequest {
  leadId: string;
  userId: string;
  createTask?: boolean; // Optional flag to create a task
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Get request body
    const requestData: MatchRequest = await req.json();
    const { leadId, userId, createTask = true } = requestData;

    if (!leadId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating business match for lead: ${leadId} and user: ${userId}`);

    // Check if analysis already exists
    const { data: existingMatch, error: existingMatchError } = await supabase
      .from('lead_business_match')
      .select('*')
      .eq('lead_id', leadId)
      .maybeSingle();

    if (existingMatchError) {
      console.error("Error checking existing match:", existingMatchError);
      throw existingMatchError;
    }

    if (existingMatch) {
      console.log("Business match already exists for this lead");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Business match already exists", 
          analysis: existingMatch 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        messages (*),
        tasks (*),
        notes (*),
        social_media_posts (*)
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
      throw leadError;
    }

    // Get user info and business details
    const { data: userSettings, error: userSettingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userSettingsError) {
      console.error("Error fetching user settings:", userSettingsError);
      throw userSettingsError;
    }

    // Create prompt for OpenAI
    const systemPrompt = `
      Du bist ein spezialisierter Business-Analyst, der Geschäftsmatches bewertet.
      Analysiere die Übereinstimmung zwischen einem Unternehmer und einem Kontakt.
      Konzentriere dich auf: Branchenkompatibilität, Geschäftsbedürfnisse, potentielle Vorteile,
      gemeinsame Interessen und Wachstumsmöglichkeiten.
      
      Anweisungen:
      1. Analysiere zuerst, wie gut der Kontakt zum Unternehmen passt.
      2. Berechne einen Match-Score von 0 bis 100.
      3. Strukturiere deine Analyse mit diesen Abschnitten:
         - Business Match Score (0-100)
         - Zusammenfassung (kurze Übersicht)
         - Skills (des Kontakts)
         - Gemeinsamkeiten (zwischen Unternehmen und Kontakt)
         - Potentielle Bedarfe (was der Kontakt brauchen könnte)
         - Stärken (des Matches)
         - Empfehlungen (konkrete Handlungsschritte)
      4. Gib eine ehrliche Einschätzung - nicht alle Kontakte sind gute Matches.
      5. Extrahiere Schlüsselpunkte in jedem Abschnitt für die UI-Anzeige.
      
      Bereite am Ende einen EINZIGEN konkreten Vorschlag für einen wichtigen Task vor, der auf dem Match-Score basiert.
      Formatiere den Task so: [TASK] Hier steht der Task-Text [/TASK]
    `;

    // Business owner information
    const businessInfo = {
      company_name: userSettings.company_name || "Not specified",
      business_description: userSettings.business_description || "Not specified",
      products_services: userSettings.products_services || "Not specified",
      target_audience: userSettings.target_audience || "Not specified",
      usp: userSettings.usp || "Not specified"
    };

    // Contact information to analyze
    const contactInfo = {
      name: lead.name,
      industry: lead.industry || "Unknown",
      position: lead.position || "Unknown",
      company: lead.current_company_name || "Unknown",
      bio: lead.social_media_bio || "",
      interests: lead.social_media_interests || [],
      socialMediaFollowers: lead.social_media_followers,
      socialMediaEngagementRate: lead.social_media_engagement_rate,
      notes: (lead.notes || []).map(note => note.content).join("\n"),
      socialMediaCategories: lead.social_media_categories || []
    };

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `
            Business Owner Information:
            - Company: ${businessInfo.company_name}
            - Business Description: ${businessInfo.business_description}
            - Products/Services: ${businessInfo.products_services}
            - Target Audience: ${businessInfo.target_audience}
            - Unique Selling Proposition: ${businessInfo.usp}

            Contact Information:
            - Name: ${contactInfo.name}
            - Industry: ${contactInfo.industry}
            - Position: ${contactInfo.position}
            - Company: ${contactInfo.company}
            - Bio: ${contactInfo.bio}
            - Interests: ${contactInfo.interests.join(", ")}
            - Social Media Categories: ${contactInfo.socialMediaCategories.join(", ")}
            - Social Media Followers: ${contactInfo.socialMediaFollowers || 'Unknown'}
            - Engagement Rate: ${contactInfo.socialMediaEngagementRate || 'Unknown'}
            
            Additional Notes:
            ${contactInfo.notes}

            Bitte erstelle eine vollständige Analyse dieses Business Matches mit allen erforderlichen Abschnitten.
            Ersetze [Name] oder ähnliche Platzhalter im Text mit dem tatsächlichen Namen des Kontakts.
            Schließe mit einem EINZIGEN konkreten Vorschlag für einen Task ab, der auf dem Match-Score basiert.
            Formatiere den Task so: [TASK] Hier steht der Task-Text [/TASK]

            Füge außerdem einen JSON-Abschnitt am Ende mit folgendem Format ein:
            \`\`\`json
            {
              "match_score": <number 0-100>,
              "skills": [<up to 5 skills as strings>],
              "commonalities": [<up to 5 commonalities as strings>],
              "potential_needs": [<up to 5 needs as strings>],
              "strengths": [<up to 5 strengths of the match as strings>]
            }
            \`\`\`
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0].message.content || "";
    console.log("Analysis completed, extracting data");
    
    // Extract JSON data
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
    let extractedData = null;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Error parsing JSON from API response:", e);
      }
    }

    // Extract task from the analysis content
    const taskMatch = responseContent.match(/\[TASK\](.*?)\[\/TASK\]/s);
    const taskContent = taskMatch ? taskMatch[1].trim() : null;

    // Clean content (remove JSON block and task markup)
    let cleanContent = responseContent
      .replace(/```json\s*[\s\S]*?\s*```/, "")
      .replace(/\[TASK\](.*?)\[\/TASK\]/s, "")
      .trim();
    
    // Default data if parsing failed
    const matchData = extractedData || {
      match_score: 50,
      skills: [],
      commonalities: [],
      potential_needs: [],
      strengths: []
    };

    // Store the analysis in the database
    const { data: analysisData, error: analysisError } = await supabase
      .from('lead_business_match')
      .insert({
        lead_id: leadId,
        user_id: userId,
        match_score: matchData.match_score,
        analysis_content: cleanContent,
        skills: matchData.skills,
        commonalities: matchData.commonalities,
        potential_needs: matchData.potential_needs,
        strengths: matchData.strengths,
        metadata: {
          analysis_version: "1.0",
          business_info: {
            company: businessInfo.company_name,
            business_type: businessInfo.business_description ? businessInfo.business_description.slice(0, 100) : null
          },
          contact_info: {
            industry: contactInfo.industry,
            position: contactInfo.position
          }
        }
      })
      .select()
      .single();

    if (analysisError) {
      console.error("Error storing analysis:", analysisError);
      throw analysisError;
    }

    // Create a meaningful task based on the analysis
    if (createTask && taskContent) {
      try {
        const taskPriority = matchData.match_score >= 70 ? "High" : 
                            matchData.match_score >= 40 ? "Medium" : "Low";

        const taskColor = matchData.match_score >= 70 ? "#4CAF50" : 
                         matchData.match_score >= 40 ? "#2196F3" : "#FFC107";

        const taskDueDate = new Date();
        taskDueDate.setDate(taskDueDate.getDate() + 3); // Due in 3 days

        await supabase
          .from('tasks')
          .insert({
            lead_id: leadId,
            title: `**Business Match (${matchData.match_score}%):** ${taskContent}`,
            due_date: taskDueDate.toISOString(),
            priority: taskPriority,
            user_id: userId,
            color: taskColor
          });

        console.log("Created single task based on business match analysis");
      } catch (taskError) {
        console.error("Error creating task:", taskError);
        // Continue even if task creation fails
      }
    } else {
      console.log("Skipping task creation as not requested or no task content available");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Business match analysis created successfully", 
        analysis: analysisData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in business match generation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
