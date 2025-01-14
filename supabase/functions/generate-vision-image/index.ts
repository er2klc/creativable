import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { theme } = await req.json()
    
    if (!theme) {
      throw new Error('Theme is required')
    }

    // Get user's OpenAI API key from settings
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new Error('No authorization token')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Error getting user')

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in settings')
    }

    // Generate image with DALL-E using the user's API key
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openai_api_key}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: theme,
        n: 1,
        size: "1024x1024"
      })
    })

    const data = await response.json()
    
    if (!data.data?.[0]?.url) {
      throw new Error('No image URL received from OpenAI')
    }

    // Download the image
    const imageResponse = await fetch(data.data[0].url)
    const imageBlob = await imageResponse.blob()

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vision-board-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vision-board-images')
      .getPublicUrl(fileName)

    return new Response(
      JSON.stringify({ imageUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})