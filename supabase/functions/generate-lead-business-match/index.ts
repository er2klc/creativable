
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'
import { corsHeaders } from '../_shared/cors.ts'
import OpenAI from "https://esm.sh/openai@4.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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
    const { leadId, userId, createTask = false } = requestData;

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
      You are a business analyst specializing in evaluating business matches. 
      Analyze the potential match between a business owner and a contact.
      Focus on: Industry compatibility, business needs, potential benefits,
      common interests, and growth opportunities.
      
      Instructions:
      1. First, analyze how well the contact matches with the business.
      2. Calculate a match score from 0 to 100.
      3. Structure your analysis with these sections:
         - Business Match Score (0-100)
         - Summary (brief overview)
         - Skills (of the contact)
         - Commonalities (between business and contact)
         - Potential Needs (what the contact might need)
         - Strengths (of the match)
         - Recommendations (actionable steps)
      4. Provide an honest assessment - not all contacts are good matches.
      5. Extract key points in each section for UI display.
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

            Please provide a complete analysis of this potential business match with all required sections.
            Include a JSON section at the end with the format:
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

    // Clean content (remove JSON block)
    let cleanContent = responseContent.replace(/```json\s*[\s\S]*?\s*```/, "");
    
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

    // Create a single meaningful task based on match score
    if (createTask) {
      try {
        const taskTitle = matchData.match_score >= 70
          ? `**Wichtig:** Termin mit ${lead.name} vereinbaren - Business Match Score ${matchData.match_score}%`
          : matchData.match_score >= 40
            ? `Kontakt mit ${lead.name} aufnehmen - Business Match Score ${matchData.match_score}%`
            : `Mehr Informationen über ${lead.name} sammeln (Match Score: ${matchData.match_score}%)`;

        const taskDueDate = new Date();
        taskDueDate.setDate(taskDueDate.getDate() + 3); // Due in 3 days

        await supabase
          .from('tasks')
          .insert({
            lead_id: leadId,
            title: taskTitle,
            due_date: taskDueDate.toISOString(),
            priority: matchData.match_score >= 70 ? "High" : "Medium",
            user_id: userId,
            color: matchData.match_score >= 70 ? "#4CAF50" : "#2196F3"
          });

        console.log("Created single task based on business match score");
      } catch (taskError) {
        console.error("Error creating task:", taskError);
        // Continue even if task creation fails
      }
    } else {
      console.log("Skipping task creation as not requested");
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
