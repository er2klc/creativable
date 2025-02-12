
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
      // Detailliertere Fehlermeldung
      if (error.message.includes("Failed to parse")) {
        console.error("Stream parsing error:", error);
        toast.error("Fehler beim Verarbeiten der Antwort");
      } else if (error.message.includes("Failed to fetch")) {
        console.error("Network error:", error);
        toast.error("Netzwerkfehler - Bitte überprüfen Sie Ihre Verbindung");
      } else {
        toast.error("Fehler beim Senden der Nachricht");
      }
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
    },
    experimental_streamData: true
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

  const wrappedHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Fehler beim Senden der Nachricht");
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: wrappedHandleSubmit,
    setMessages,
    resetMessages,
    isLoading
  };
};
