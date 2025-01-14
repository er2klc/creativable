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

    // Get the user's OpenAI API key from their settings
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Error getting user')

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in settings')
    }

    // Generate image with DALL-E
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
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

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate image with DALL-E')
    }

    const { data: imageData } = await openaiResponse.json()
    if (!imageData?.[0]?.url) {
      throw new Error('No image URL in OpenAI response')
    }

    // Download the generated image
    const imageResponse = await fetch(imageData[0].url)
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
      console.error('Storage upload error:', uploadError)
      throw new Error('Failed to upload image to storage')
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
    console.error('Error in generate-vision-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})