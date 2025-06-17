
import { MessageTemplateType, messageTemplates } from '@/config/messageTemplates';
import { Tables } from "@/integrations/supabase/types";

interface TemplateContext {
  contact: Tables<"leads">;
  userProfile: {
    display_name: string | null;
    email: string | null;
  };
}

export const useChatTemplates = () => {
  const generateMessage = (type: MessageTemplateType, context: TemplateContext): string => {
    const template = messageTemplates[type];
    const contactName = context.contact.name || 'dort';
    
    return template(contactName);
  };

  return {
    generateMessage,
  };
};
