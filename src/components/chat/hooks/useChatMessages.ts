
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
    experimental_onFunctionCall: (message) => {
      console.log("Function call:", message);
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

  const updateLastMessage = useCallback((delta: string) => {
    setMessages((prevMessages) => {
      const messages = [...prevMessages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        lastMessage.content = (lastMessage.content || '') + delta;
      }
      return messages;
    });
  }, [setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-OpenAI-Key': apiKey || '',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemMessage },
            ...messages.filter(m => m.role !== 'system'),
            { role: 'user', content: input }
          ],
          teamId: currentTeamId,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) {
              accumulatedContent += parsed.delta;
              updateLastMessage(accumulatedContent);
            } else if (parsed.done) {
              setMessages(prev => {
                const messages = [...prev];
                const lastMessage = messages[messages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = parsed.content;
                }
                return messages;
              });
            }
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Fehler beim Senden der Nachricht');
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
