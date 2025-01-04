import { supabase } from "@/integrations/supabase/client";

export const handleChatRequest = async (messages: any, sessionToken: string) => {
  try {
    if (!sessionToken) {
      throw new Error("No session token provided");
    }

    // Authentifizierung prüfen
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionToken);

    if (authError || !user) {
      console.error("Authentication error:", authError?.message || "No user found");
      throw new Error("Unauthorized");
    }

    const userId = user.id;
    console.log("Authentifizierter Benutzer:", userId);

    // OpenAI API Key aus der settings-Tabelle abrufen
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("openai_api_key")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error("Settings error:", settingsError?.message || "No API key found");
      throw new Error("No OpenAI API Key found for the user");
    }

    console.log("OpenAI API Key geladen:", settings.openai_api_key);
    const openaiKey = settings.openai_api_key;

    // Anfrage an die Supabase-Funktion "ai-chat" weiterleiten
    const { data, error } = await supabase.functions.invoke("ai-chat", {
      body: { messages },
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error("API Error in handleChatRequest:", error.message);
    throw error;
  }
};