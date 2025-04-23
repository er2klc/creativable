
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type FlowState = 'inactive' | 'contact_selection' | 'template_selection' | 'message_preview';
type TemplateType = 'introduction' | 'follow_up' | 'business_offer' | 'custom';

export const useChatFlow = (userId: string | null) => {
  const [flowState, setFlowState] = useState<FlowState>('inactive');
  const [selectedContact, setSelectedContact] = useState<Tables<"leads"> | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType | null>(null);

  const { data: contacts = [] } = useQuery({
    queryKey: ['chat-contacts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading contacts for chat:', error);
        return [];
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const reset = useCallback(() => {
    setFlowState('inactive');
    setSelectedContact(null);
    setSelectedTemplateType(null);
  }, []);

  // Extract command intent from user message
  const handleUserMessage = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    // Message command detection
    if (lowerMessage.includes('nachricht für') || 
        lowerMessage.includes('nachricht an') ||
        lowerMessage.includes('message to') ||
        lowerMessage.includes('erstell eine nachricht')) {
      
      setFlowState('contact_selection');
      return true;
    }
    
    return false;
  }, []);

  // Handle contact selection
  const handleContactSelection = useCallback((contact: Tables<"leads">) => {
    setSelectedContact(contact);
    setFlowState('template_selection');
  }, []);

  // Handle template type selection
  const handleTemplateSelection = useCallback((templateType: TemplateType) => {
    setSelectedTemplateType(templateType);
    setFlowState('message_preview');
  }, []);

  // Generate template message based on selection
  const generateTemplateMessage = useCallback((): string | null => {
    if (!selectedContact || !selectedTemplateType) return null;

    const { name, platform } = selectedContact;
    
    switch (selectedTemplateType) {
      case 'introduction':
        return `Hallo ${name},\n\nIch bin auf dein Profil auf ${platform} gestoßen und finde deine Inhalte sehr interessant. Ich würde mich freuen, wenn wir uns austauschen könnten.\n\nViele Grüße`;
      
      case 'follow_up':
        return `Hallo ${name},\n\nIch wollte mich nach unserem letzten Gespräch noch einmal bei dir melden. Wie sieht es bei dir aus mit einem weiteren Austausch?\n\nViele Grüße`;
      
      case 'business_offer':
        return `Hallo ${name},\n\nIch habe ein Angebot, das für dich interessant sein könnte. Lass uns gerne darüber sprechen, wie wir zusammenarbeiten können.\n\nViele Grüße`;
      
      case 'custom':
        return `Hallo ${name},\n\n[Personalisierte Nachricht hier einfügen]\n\nViele Grüße`;
      
      default:
        return null;
    }
  }, [selectedContact, selectedTemplateType]);

  useEffect(() => {
    // Reset on unmount
    return () => {
      reset();
    };
  }, [reset]);

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
