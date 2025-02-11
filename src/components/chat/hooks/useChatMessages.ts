
import { useChat } from "ai/react";
import { toast } from "sonner";

interface UseChatMessagesProps {
  sessionToken: string | null;
  apiKey: string | null;
  userId: string | null;
  currentTeamId: string | null;
  systemMessage: string;
}

export const useChatMessages = ({
  sessionToken,
  apiKey,
  userId,
  currentTeamId,
  systemMessage,
}: UseChatMessagesProps) => {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    setMessages,
    isLoading 
  } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    body: {
      teamId: currentTeamId,
      userId: userId
    },
    initialMessages: [
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ],
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht");
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
    },
    parser: (text) => {
      try {
        // Entferne eventuelle Leerzeilen am Anfang und Ende
        const cleanText = text.trim();
        
        // Überspringe nicht-data Zeilen
        if (!cleanText.startsWith('data: ')) {
          console.log('Skipping non-data line:', cleanText);
          return null;
        }
        
        // Extrahiere den JSON-Teil
        const jsonText = cleanText.replace(/^data: /, '');
        console.log('Parsing JSON:', jsonText);
        
        const parsed = JSON.parse(jsonText);
        console.log('Successfully parsed message:', parsed);
        
        return {
          id: parsed.id,
          content: parsed.content,
          role: parsed.role
        };
      } catch (e) {
        console.error('Parser error:', e);
        console.error('Failed to parse text:', text);
        return null;
      }
    }
  });

  const resetMessages = () => {
    setMessages([
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ]);
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      handleSubmit(e);
    },
    setMessages,
    resetMessages,
    isLoading
  };
};
