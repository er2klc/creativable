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

// Füge eine Funktion hinzu, um Kontakte direkt abzurufen
const fetchAllContacts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Kontakte (Leads) direkt aus der Datenbank abrufen
    const { data: contacts, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    if (contacts && contacts.length > 0) {
      // Formatiere die Kontakte als lesbare Liste
      return contacts.map(contact => ({
        name: contact.name,
        company: contact.company_name || 'Keine Firma',
        email: contact.email || 'Keine E-Mail',
        phone: contact.phone_number || 'Keine Telefonnummer',
        platform: contact.platform || 'Keine Plattform',
        status: contact.status || 'Kein Status'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Fehler beim Abrufen der Kontakte:', error);
    return [];
  }
};

// Füge diese Funktion zur Unterstützung spezieller Anfragen hinzu
const handleSpecialQueries = async (query: string) => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Prüfe, ob der Benutzer nach seinen Profildaten fragt ("Wer bin ich?")
  if (
    lowerQuery.includes('wer bin ich') || 
    lowerQuery === 'wer bist du' || 
    lowerQuery === 'wie heiße ich'
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "Du bist nicht angemeldet.";
      
      // Benutzerprofil abrufen
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Benutzereinstellungen abrufen
      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return `Du bist ${profile?.display_name || user.email}.\n\n` +
        `E-Mail: ${user.email}\n` +
        `Unternehmen: ${settings?.company_name || 'Nicht angegeben'}\n` +
        `Standort: ${profile?.location || 'Nicht angegeben'}\n` +
        `Status: ${profile?.status || 'Nicht angegeben'}`;
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
      return "Ich konnte deine Benutzerinformationen nicht abrufen.";
    }
  }
  
  // Prüfe, ob der Benutzer nach Kontakten fragt
  if (
    lowerQuery.includes('kontakte') || 
    lowerQuery.includes('leads') || 
    (lowerQuery.includes('gib mir') && lowerQuery.includes('alle')) ||
    lowerQuery === 'alle' ||
    lowerQuery === 'alle kontakte'
  ) {
    const contacts = await fetchAllContacts();
    
    if (contacts.length === 0) {
      return "Ich konnte keine Kontakte in deiner Datenbank finden.";
    }
    
    const contactsListText = contacts.map(contact => 
      `- ${contact.name} (${contact.company}, ${contact.email}, ${contact.phone})`
    ).join('\n');
    
    return `Hier sind alle deine Kontakte:\n\n${contactsListText}`;
  }

  // Prüfe, ob der Benutzer nach seinen Aufgaben fragt
  if (
    lowerQuery.includes('aufgaben') || 
    lowerQuery.includes('tasks') || 
    lowerQuery.includes('todos') ||
    lowerQuery.includes('to-dos') ||
    lowerQuery.includes('to do')
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "Du bist nicht angemeldet.";
      
      // Aufgaben abrufen
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (!tasks || tasks.length === 0) {
        return "Du hast aktuell keine Aufgaben in deiner Liste.";
      }
      
      const tasksListText = tasks.map(task => 
        `- ${task.title} (${task.completed ? 'Abgeschlossen' : 'Ausstehend'}, Fällig: ${task.due_date || 'Kein Datum'})`
      ).join('\n');
      
      return `Hier sind deine Aufgaben:\n\n${tasksListText}`;
    } catch (error) {
      console.error('Fehler beim Abrufen der Aufgaben:', error);
      return "Ich konnte deine Aufgaben nicht abrufen.";
    }
  }
  
  // Prüfe, ob der Benutzer Hilfe zu den Funktionen des Assistenten benötigt
  if (
    lowerQuery === 'hilfe' || 
    lowerQuery === 'help' || 
    lowerQuery === 'was kannst du' ||
    lowerQuery === 'funktionen'
  ) {
    return `Ich kann dir bei verschiedenen Aufgaben helfen. Hier sind einige Beispiele:\n\n` +
      `- **Kontakte anzeigen**: "Zeige mir alle meine Kontakte"\n` +
      `- **Aufgaben verwalten**: "Was sind meine Aufgaben?"\n` +
      `- **Benutzerinformationen**: "Wer bin ich?"\n` +
      `- **Allgemeine Hilfe**: "Hilfe" oder "Was kannst du?"\n\n` +
      `Ich habe direkten Zugriff auf deine Daten in der Anwendung und kann spezifische Informationen abrufen oder Fragen beantworten.`;
  }
  
  return null;
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
      
      // Prüfe, ob es eine spezielle Anfrage ist, die direkt beantwortet werden kann
      const specialResponse = await handleSpecialQueries(currentInput);
      
      if (specialResponse) {
        // Wenn eine spezielle Anfrage erkannt wurde, zeige die Antwort sofort an
        setMessages(prev => [
          ...prev, 
          userMessage,
          { id: crypto.randomUUID(), role: 'assistant' as const, content: specialResponse }
        ]);
        if (!overrideMessage) {
          setInput('');
        }
        setIsProcessing(false);
        return;
      }
      
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
