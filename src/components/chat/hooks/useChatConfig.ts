import { Message } from "ai";
import { searchSimilarContent } from "@/utils/embeddings";
import { toast } from "sonner";

export const useChatConfig = (
  sessionToken: string | null,
  apiKey: string | null,
  userId: string | null,
  currentTeamId: string | null,
  systemMessage: string,
  scrollRef: React.RefObject<HTMLDivElement>,
  messages: Message[]
) => {
  return {
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    initialMessages: [
      {
        id: "system-1",
        role: "system" as const,
        content: systemMessage,
      }
    ] as Message[],
    body: {
      teamId: currentTeamId,
      platformId: null,
      currentTeamId: currentTeamId,
      userId: userId
    },
    onResponse: (response: Response) => {
      if (!response.ok) {
        console.error('Chat response error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: async (message: Message) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      
      try {
        if (message.role === 'assistant') {
          const userMessage = messages[messages.length - 2];
          if (userMessage?.role === 'user') {
            const similarContent = await searchSimilarContent(userMessage.content, 'personal');
            console.log('Similar content found:', similarContent);
          }
        }
      } catch (error) {
        console.error('Error searching similar content:', error);
      }
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.");
    },
    parser: (text: string) => {
      try {
        return text
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.replace('data: ', '');
                if (jsonStr === '[DONE]') return null;
                
                // Parse and validate the message format
                const parsed = JSON.parse(jsonStr);
                console.log('Parsed message:', parsed);
                
                if (!parsed || !parsed.id || !parsed.role || !parsed.content || !parsed.createdAt) {
                  console.error('Invalid message format:', parsed);
                  return null;
                }
                
                return {
                  id: parsed.id,
                  role: parsed.role as 'assistant',
                  content: parsed.content,
                  createdAt: parsed.createdAt
                };
              } catch (e) {
                console.error('Error parsing line:', line, e);
                return null;
              }
            }
            return null;
          })
          .filter(Boolean);
      } catch (error) {
        console.error('Error in stream parser:', error);
        return [];
      }
    }
  };
};