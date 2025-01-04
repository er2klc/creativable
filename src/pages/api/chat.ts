import { NextApiRequest, NextApiResponse } from "next";
import { handleChatRequest } from "@/lib/api/handleChatRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { messages, sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: "No session token provided" });
    }

    const data = await handleChatRequest(messages, sessionToken);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("API Error in /api/chat:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
