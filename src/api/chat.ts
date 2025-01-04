import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { messages } = req.body;
    const sessionToken = req.headers["authorization"]?.replace("Bearer ", "");

    if (!sessionToken) {
      return res.status(400).json({ error: "No session token provided" });
    }

    // Authentifizierung prüfen
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionToken);

    if (authError || !user) {
      console.error("Authentication error:", authError?.message || "No user found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = user.id;

    // OpenAI API Key aus der settings-Tabelle abrufen
    // OpenAI API Key aus der settings-Tabelle abrufen
const { data: settings, error: settingsError } = await supabase
  .from("settings")
  .select("openai_api_key")
  .eq("user_id", userId)
  .single();

if (settingsError || !settings?.openai_api_key) {
  console.error("Settings error:", settingsError?.message || "No API key found");
  return res.status(400).json({ error: "No OpenAI API Key found for the user" });
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

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("API Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
