
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
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
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
    experimental_onStreamMessage: (message) => {
      console.log("Received stream message:", message);
    },
    parse: (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("Parsed stream data:", parsedData);
        return parsedData;
      } catch (e) {
        console.error("Error parsing stream data:", e);
        throw e;
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
      
      try {
        handleSubmit(e);
      } catch (error) {
        console.error("Error submitting message:", error);
        toast.error("Fehler beim Senden der Nachricht");
      }
    },
    setMessages,
    resetMessages
  };
};
