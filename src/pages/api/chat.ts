import { handleChatRequest } from "@/api/chat";

export async function POST(req: Request) {
  try {
    const { messages, openaiKey, sessionToken } = await req.json();
    const response = await handleChatRequest(messages, openaiKey, sessionToken);
    return new Response(JSON.stringify(response));
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500 }
    );
  }
}