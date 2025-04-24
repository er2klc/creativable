import { useChat } from "ai/react";
import { toast } from "sonner";
import { useCallback, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchUserContent, searchSimilarContent } from "@/utils/embeddings";

interface UseChatMessagesProps {
  sessionToken: string | null;
  apiKey: string | null;
  userId: string | null;
  currentTeamId: string | null;
  systemMessage: string;
}

/**
 * Lädt den Benutzerkontext für den Chatbot beim Start der Konversation
 */
const loadUserContextForChat = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // 1. Benutzerprofil laden
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // 2. Benutzereinstellungen laden
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // 3. Erstelle einen Initialkontext für den Chatbot
    const initialContext = `
      Benutzerinformationen:
      Name: ${profile?.display_name || 'Unbekannt'}
      Email: ${user.email}
      Unternehmen: ${settings?.company_name || 'Nicht angegeben'}
      Position: ${profile?.status || 'Nicht angegeben'}
    `.trim();
    
    return initialContext;
  } catch (error) {
    console.error('Fehler beim Laden des Benutzerkontexts:', error);
    return "";
  }
};

export const useChatMessages = ({
  sessionToken,
  apiKey,
  userId,
  currentTeamId,
  systemMessage,
}: UseChatMessagesProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [userContext, setUserContext] = useState("");
  const MAX_RETRIES = 2;
  
  // Lade den Benutzerkontext beim ersten Rendern
  useEffect(() => {
    const fetchUserContext = async () => {
      const context = await loadUserContextForChat();
      setUserContext(context);
    };
    
    if (userId) {
      fetchUserContext();
    }
  }, [userId]);
  
  // Erweitere den System-Prompt mit dem Benutzerkontext
  const enhancedSystemMessage = userContext 
    ? `${systemMessage}\n\n${userContext}` 
    : systemMessage;
  
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
        content: enhancedSystemMessage,
      }
    ]
  });

  // Aktualisiere die Systemnachricht, wenn sich der Benutzerkontext ändert
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'system') {
      setMessages(prev => [
        { ...prev[0], content: enhancedSystemMessage },
        ...prev.slice(1)
      ]);
    }
  }, [enhancedSystemMessage, setMessages]);

  const resetMessages = useCallback(() => {
    setMessages([
      {
        id: "system",
        role: "system",
        content: enhancedSystemMessage,
      }
    ]);
  }, [setMessages, enhancedSystemMessage]);

  // Funktion zum Finden von relevanten Kontextinformationen basierend auf der Benutzereingabe
  const findRelevantContext = async (query: string) => {
    try {
      // Suche in persönlichen Daten
      const personalContext = await searchUserContent(query);
      
      // Suche in Teamdaten, falls ein Team ausgewählt ist
      let teamContext = [];
      if (currentTeamId) {
        const teamResults = await searchSimilarContent(query, 'team', currentTeamId);
        if (teamResults && teamResults.length > 0) {
          teamContext = teamResults;
        }
      } else if (userId) {
        // Falls kein Team ausgewählt ist, hole alle Teams des Benutzers
        const { data: userTeams } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId);
        
        if (userTeams && userTeams.length > 0) {
          for (const team of userTeams) {
            const teamResults = await searchSimilarContent(query, 'team', team.team_id);
            if (teamResults && teamResults.length > 0) {
              teamContext.push(...teamResults);
            }
          }
        }
      }
      
      // Kombiniere persönlichen Kontext und Teamkontext
      const combinedContext = [...(personalContext || []), ...(teamContext || [])];
      
      // Filtere die relevantesten Ergebnisse
      const topResults = combinedContext
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
      
      if (topResults.length > 0) {
        return "Relevante Informationen:\n" + 
          topResults.map(item => `${item.content}`).join("\n---\n");
      }
      
      return "";
    } catch (error) {
      console.error('Fehler beim Suchen relevanter Kontextinformationen:', error);
      return "";
    }
  };

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

      // Suche nach relevantem Kontext für die aktuelle Anfrage
      const relevantContext = await findRelevantContext(currentInput);
      
      const recentMessages = messages.length > 10 
        ? [...messages.slice(0, 1), ...messages.slice(-9)]
        : messages;

      const requestData = {
        messages: [
          { role: 'system', content: enhancedSystemMessage },
          ...recentMessages.filter(m => m.role !== 'system'),
          { role: 'user', content: currentInput }
        ],
        teamId: currentTeamId,
        userId: userId,
        currentRoute: window.location.pathname
      };

      // Füge relevanten Kontext als Systemnachricht hinzu, wenn vorhanden
      if (relevantContext) {
        requestData.messages.push({ 
          role: 'system', 
          content: relevantContext 
        });
      }

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
