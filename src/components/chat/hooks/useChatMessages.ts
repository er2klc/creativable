import { useChat } from "ai/react";
import { Message } from "ai";

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
        role: "system" as const,
        content: systemMessage,
      }
    ]
  });

  const resetMessages = () => {
    setMessages([
      {
        id: "system",
        role: "system" as const,
        content: systemMessage,
      }
    ]);
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    resetMessages
  };
};