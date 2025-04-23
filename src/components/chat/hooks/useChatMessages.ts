import { useChat } from "ai/react";
import { toast } from "sonner";
import { useCallback, useState } from "react";

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
    
    if (isProcessing) return;
    
    const currentInput = overrideMessage || input.trim();
    if (!currentInput) return;
    
    setIsProcessing(true);
    
    try {
      console.log("🔄 Chat Anfrage wird vorbereitet...");
      // Setze die Benutzernachricht sofort
      const userMessage = { id: Date.now().toString(), role: 'user' as const, content: currentInput };
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant' as const, content: '' };
      
      // Setze zuerst die Benutzernachricht
      setMessages(prev => [...prev, userMessage]);
      
      // Leere das Input-Feld wenn es keine Override-Nachricht ist
      if (!overrideMessage) {
        setInput('');
      }
      
      // Warte einen Frame für das Rendering
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Füge dann die leere Assistentennachricht hinzu
      setMessages(prev => [...prev, assistantMessage]);

      // Limit messages to prevent context length issues (keeping last 10 messages)
      const recentMessages = messages.length > 10 
        ? [...messages.slice(0, 1), ...messages.slice(-9)] // Keep system prompt + last 9 messages
        : messages;

      console.log('📤 Sende Chat-Anfrage an Supabase-Funktion | API Key vorhanden:', !!apiKey);
      
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
      
      // Debugging-Informationen
      console.log('📊 Request-Details:', {
        endpoint: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        headers: {
          'Authorization vorhanden': !!sessionToken,
          'API-Key vorhanden': !!apiKey,
        },
        userId,
        messageCount: requestData.messages.length,
        userMessage: currentInput
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-OpenAI-Key': apiKey || '',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`❌ Server antwortete mit ${response.status}:`, responseText);
        throw new Error(`Server antwortete mit ${response.status}: ${responseText}`);
      }

      console.log('✅ Server-Antwort erhalten:', response.status, response.statusText);

      if (!response.body) {
        console.error("❌ Response body ist null");
        throw new Error("Response body ist null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      try {
        console.log("🔄 Beginne Antwort-Stream zu lesen");
        let messageCount = 0;
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            console.log("✅ Stream-Lesen abgeschlossen");
            break;
          }

          const chunk = decoder.decode(value);
          console.log(`📩 Chunk erhalten: ${chunk.length} Zeichen`);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log("🏁 [DONE]-Marker erhalten");
              continue;
            }

            try {
              messageCount++;
              const parsed = JSON.parse(data);
              console.log(`📝 Nachricht #${messageCount} verarbeitet:`, 
                parsed.delta ? `Delta mit ${parsed.delta.length} Zeichen` : 
                parsed.content ? `Inhalt mit ${parsed.content.length} Zeichen` : 
                parsed.error ? `FEHLER: ${parsed.message}` : 'unbekanntes Format');
              
              // Check for error responses
              if (parsed.error) {
                console.error('❌ Fehler vom Chat-Service:', parsed);
                toast.error(parsed.message || 'Ein Fehler ist beim Chat aufgetreten');
                
                // Update the assistant message with the error
                setMessages(prev => {
                  const updatedMessages = [...prev];
                  const lastMessage = updatedMessages[updatedMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,
                      content: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
                    };
                  }
                  return updatedMessages;
                });
                
                break;
              }

              if (parsed.delta) {
                accumulatedContent += parsed.delta;
                // Erzwinge ein Re-Rendering mit einer neuen Referenz
                setMessages(prev => {
                  const updatedMessages = [...prev];
                  const lastMessage = updatedMessages[updatedMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    // Erstelle ein neues Objekt für die letzte Nachricht
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,
                      content: accumulatedContent
                    };
                  }
                  return updatedMessages;
                });
              }
            } catch (error) {
              console.error('❌ Fehler beim Parsen des Chunks:', error, 'Rohdaten:', data);
            }
          }
        }
        
        // Reset retry count on success
        setRetryCount(0);
        console.log("✅ Chat-Antwort erfolgreich verarbeitet");
        
      } catch (streamError) {
        console.error('❌ Stream-Verarbeitungsfehler:', streamError);
        
        if (retryCount < MAX_RETRIES) {
          // Increment retry count and try again
          setRetryCount(prev => prev + 1);
          toast.error(`Verbindungsfehler. Automatischer Neuversuch (${retryCount + 1}/${MAX_RETRIES})...`);
          
          // Remove the assistant message before retrying
          setMessages(prev => prev.slice(0, -1));
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          await handleSubmit({ preventDefault: () => {} } as React.FormEvent, currentInput);
          return;
        } else {
          // Max retries reached, show error
          toast.error('Chat konnte nach mehreren Versuchen nicht abgeschlossen werden');
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: 'Es ist ein Verbindungsfehler aufgetreten. Bitte versuchen Sie es später erneut.'
              };
            }
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Fehler beim Senden der Nachricht');
      
      // Update the assistant message with the error
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
