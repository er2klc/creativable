
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
    parse: (text) => {
      // Extrahiere die JSON-Daten nach "data: "
      const dataPrefix = "data: ";
      if (text.startsWith(dataPrefix)) {
        const jsonStr = text.slice(dataPrefix.length);
        try {
          const data = JSON.parse(jsonStr);
          console.log("Parsed message:", data);
          return {
            id: data.id,
            role: data.role,
            content: data.content,
            createdAt: data.createdAt
          };
        } catch (e) {
          console.error("Parse error:", e);
          throw e;
        }
      }
      throw new Error("Invalid message format");
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
