import { supabase } from "@/integrations/supabase/client";

export async function handleChatRequest(messages: any[], openaiKey: string, sessionToken: string) {
  if (!openaiKey) {
    throw new Error("OpenAI API Key fehlt");
  }

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { messages },
    headers: {
      'OpenAI-Key': openaiKey,
      'Authorization': `Bearer ${sessionToken}`
    }
  });

  if (error) {
    console.error('Supabase function error:', error);
    throw error;
  }

  return data;
}