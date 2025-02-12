
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
    ]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput) return;

    try {
      // Setze die Benutzernachricht sofort und leere das Input-Feld
      const userMessage = { id: Date.now().toString(), role: 'user', content: currentInput };
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: '' };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);

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
            { role: 'user', content: currentInput }
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
            console.log('Parsed data:', parsed);

            if (parsed.delta) {
              accumulatedContent += parsed.delta;
              setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = accumulatedContent;
                }
                return updatedMessages;
              });
            }
          } catch (error) {
            console.error('Error parsing chunk:', error, 'Raw data:', data);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Fehler beim Senden der Nachricht');
    }
  };

  const customHandleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    // Erlaube alle Zeichen inkl. 'ß'
    handleInputChange(e);
  };

  return {
    messages,
    input,
    handleInputChange: customHandleInputChange,
    handleSubmit,
    setMessages,
    resetMessages,
    isLoading
  };
};
