import { useState, useCallback } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { MessageTemplateType } from '@/config/messageTemplates';
import { useChatTemplates } from '@/hooks/use-chat-templates';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ChatFlowState = 'initial' | 'contact_selection' | 'template_selection' | 'message_preview';

export const useChatFlow = (userId: string | null) => {
  const [flowState, setFlowState] = useState<ChatFlowState>('initial');
  const [selectedContact, setSelectedContact] = useState<Tables<"leads"> | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<MessageTemplateType>('first_contact');
  const { generateMessage } = useChatTemplates();
  const [searchContext, setSearchContext] = useState<{
    context: 'last' | 'phase' | 'posts';
    phaseId?: string;
    keyword?: string;
  }>({ context: 'last' });

  const { data: userProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contextual-contacts', userId, searchContext],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .rpc('get_contextual_contacts', {
          p_user_id: userId,
          p_context: searchContext.context,
          p_phase_id: searchContext.phaseId,
          p_keyword: searchContext.keyword,
          p_limit: 10
        });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleUserMessage = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Letzter Kontakt
    if (lowerMessage.includes('letzter kontakt') || lowerMessage.includes('zuletzt')) {
      setSearchContext({ context: 'last' });
      setFlowState('contact_selection');
      return true;
    }
    
    // Phase-basierte Suche
    const phaseMatch = lowerMessage.match(/phase\s*["']?([^"']+)["']?/i);
    if (phaseMatch) {
      setSearchContext({ 
        context: 'phase',
        phaseId: phaseMatch[1]
      });
      setFlowState('contact_selection');
      return true;
    }
    
    // Content-basierte Suche
    const contentMatch = lowerMessage.match(/(?:über|about)\s+["']?([^"']+)["']?/i);
    if (contentMatch) {
      setSearchContext({
        context: 'posts',
        keyword: contentMatch[1]
      });
      setFlowState('contact_selection');
      return true;
    }
    
    // Allgemeine Nachrichtenerstellung
    if (lowerMessage.includes('nachricht') || lowerMessage.includes('schreib')) {
      setSearchContext({ context: 'last' });
      setFlowState('contact_selection');
      return true;
    }
    
    return false;
  }, []);

  const generateTemplateMessage = useCallback(() => {
    if (!selectedContact || !userProfile) return null;

    const context = {
      contact: selectedContact,
      userProfile: {
        display_name: userProfile.display_name,
        email: userProfile.email
      },
      lastInteraction: selectedContact.last_interaction_date ? {
        type: selectedContact.last_action || 'Interaktion',
        date: new Date(selectedContact.last_interaction_date).toLocaleDateString('de-DE')
      } : undefined
    };

    return generateMessage(selectedTemplateType, context);
  }, [selectedContact, selectedTemplateType, userProfile, generateMessage]);

  const handleContactSelection = useCallback((contact: Tables<"leads">) => {
    setSelectedContact(contact);
    setFlowState('template_selection');
  }, []);

  const handleTemplateSelection = useCallback((type: MessageTemplateType) => {
    setSelectedTemplateType(type);
    setFlowState('message_preview');
  }, []);

  const reset = useCallback(() => {
    setFlowState('initial');
    setSelectedContact(null);
    setSelectedTemplateType('first_contact');
    setSearchContext({ context: 'last' });
  }, []);

  return {
    flowState,
    setFlowState,
    selectedContact,
    selectedTemplateType,
    contacts,
    handleUserMessage,
    handleContactSelection,
    handleTemplateSelection,
    generateTemplateMessage,
    reset
  };
};
