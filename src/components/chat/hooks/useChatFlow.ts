
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
    queryKey: ['leads'],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleUserMessage = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('nachricht') || lowerMessage.includes('schreib')) {
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
  }, []);

  return {
    flowState,
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
