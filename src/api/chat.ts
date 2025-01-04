import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { messages } = req.body;
    const openaiKey = req.headers["authorization"]?.replace("Bearer ", "");

    if (!openaiKey) {
      return res.status(400).json({ error: "No OpenAI API Key provided" });
    }

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
