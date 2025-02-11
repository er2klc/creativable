
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
    experimental_streamData: true,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht");
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
      // Konsolidiere die finale Nachricht
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id ? { ...m, content: message.content } : m
        )
      );
    },
    async onStream(stream) {
      const reader = stream.getReader();
      let currentMessageId: string | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          try {
            const data = JSON.parse(value.data);
            console.log("Stream data:", data);

            if (data.id && data.role === 'assistant') {
              if (!currentMessageId) {
                // Erste Nachricht des Streams
                currentMessageId = data.id;
                setMessages(prev => [
                  ...prev,
                  {
                    id: data.id,
                    role: 'assistant',
                    content: data.content,
                    createdAt: new Date().toISOString()
                  }
                ]);
              } else {
                // Update existierende Nachricht
                setMessages(prev => 
                  prev.map(m => 
                    m.id === currentMessageId 
                      ? { ...m, content: data.content } 
                      : m
                  )
                );
              }
            }
          } catch (e) {
            console.error('Stream parsing error:', e);
          }
        }
      } catch (error) {
        console.error('Stream reading error:', error);
      } finally {
        reader.releaseLock();
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
