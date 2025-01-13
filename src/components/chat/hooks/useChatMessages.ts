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
    ],
    onResponse: (response) => {
      console.log("Chat response received:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: (message) => {
      console.log("Chat message finished:", message);
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onStreamingMessage: (message) => {
      console.log("Streaming message received:", message);
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          // Update existing assistant message
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + message.content }
          ];
        } else {
          // Create new assistant message
          return [
            ...prevMessages,
            { 
              id: crypto.randomUUID(), 
              role: 'assistant', 
              content: message.content 
            }
          ];
        }
      });
    }
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