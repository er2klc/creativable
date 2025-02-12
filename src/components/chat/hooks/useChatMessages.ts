
import { useChat } from "ai/react";
import { toast } from "sonner";
import { useCallback } from "react";

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
    handleSubmit: originalHandleSubmit, 
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
    onResponse: (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: (message) => {
      console.log("Chat finished, final message:", message);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      if (error.message.includes("Failed to parse")) {
        console.error("Stream parsing error:", error);
        toast.error("Fehler beim Verarbeiten der Stream-Antwort");
      } else if (error.message.includes("Failed to fetch")) {
        console.error("Network error:", error);
        toast.error("Verbindungsfehler - Bitte überprüfen Sie Ihre Internetverbindung");
      } else {
        toast.error(`Fehler: ${error.message}`);
      }
    }
  });

  const resetMessages = useCallback(() => {
    setMessages([
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ]);
  }, [setMessages, systemMessage]);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((messages) => {
      const updatedMessages = [...messages];
      if (updatedMessages.length > 0) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = content;
        }
      }
      return updatedMessages;
    });
  }, [setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await originalHandleSubmit(e);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Fehler beim Senden der Nachricht");
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    resetMessages,
    updateLastMessage,
    isLoading
  };
};
