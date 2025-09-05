import { useChat } from "ai/react";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  const { 
    messages, 
    input, 
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    setMessages,
    setInput,
    isLoading 
  } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    body: {
      teamId: currentTeamId,
      userId: userId,
      currentRoute: window.location.pathname
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

  const handleSubmit = async (e: React.FormEvent, overrideMessage?: string) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    if (isProcessing) {
      console.log("🚫 Already processing a request, skipping...");
      return;
    }
    
    const currentInput = overrideMessage || input.trim();
    if (!currentInput) return;
    
    setIsProcessing(true);
    console.log("🎯 Starting chat request preparation...");
    
    try {
      const userMessage = { id: Date.now().toString(), role: 'user' as const, content: currentInput };
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant' as const, content: '' };
      
      setMessages(prev => [...prev, userMessage]);
      
      if (!overrideMessage) {
        setInput('');
      }
      
      await new Promise(resolve => requestAnimationFrame(resolve));
      setMessages(prev => [...prev, assistantMessage]);

      const recentMessages = messages.length > 10 
        ? [...messages.slice(0, 1), ...messages.slice(-9)]
        : messages;

      const requestData = {
        messages: [
          { role: 'system', content: systemMessage },
          ...recentMessages.filter(m => m.role !== 'system'),
          { role: 'user', content: currentInput }
        ],
        teamId: currentTeamId,
        userId: userId,
        currentRoute: window.location.pathname
      };

      const { data: response, error } = await supabase.functions.invoke('chat', {
        body: requestData,
        headers: {
          'X-OpenAI-Key': apiKey || '',
        }
      });

      if (error) {
        throw new Error(`Chat error: ${error.message}`);
      }

      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        if (lastIndex >= 0 && updatedMessages[lastIndex]?.role === 'assistant') {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: response.content || "Antwort erhalten, aber Inhalt konnte nicht gelesen werden"
          };
        }
        return updatedMessages;
      });
      
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error('Fehler beim Senden der Nachricht');
      
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        if (lastIndex >= 0 && updatedMessages[lastIndex]?.role === 'assistant') {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es erneut.'
          };
        }
        return updatedMessages;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    resetMessages,
    isLoading: isLoading || isProcessing
  };
};
