
import { MessageTemplate, MessageTemplateType, getMessageTemplate } from "@/config/messageTemplates";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "./use-settings";

interface TemplateContext {
  contact: Tables<"leads"];
  userProfile?: {
    display_name?: string | null;
    email?: string | null;
  };
  lastInteraction?: {
    type: string;
    date: string;
  };
}

export const useChatTemplates = () => {
  const { settings } = useSettings();

  const getTemplatePlaceholders = (template: MessageTemplate, context: TemplateContext) => {
    return {
      name: context.contact.name,
      user_name: context.userProfile?.display_name || 'Ich',
      personalization: `Ich finde deine Arbeit im Bereich ${context.contact.industry || 'deiner Branche'} sehr spannend`,
      reason: `finde besonders interessant, dass ${context.contact.social_media_bio || 'du in diesem Bereich tätig bist'}`,
      business_value: `Ich denke, wir könnten von einem Austausch beide profitieren`,
      last_interaction: context.lastInteraction ? 
        `${context.lastInteraction.type} am ${context.lastInteraction.date}` : 
        'unsere letzte Interaktion',
      collaboration_reason: 'ich sehe großes Potential für eine Zusammenarbeit',
      collaboration_details: `Besonders im Bereich ${context.contact.industry || 'deiner Expertise'} könnte ich wertvolle Insights beisteuern`,
      feedback_context: 'ich arbeite gerade an einem spannenden Projekt',
      feedback_request: 'und würde gerne deine professionelle Meinung dazu hören',
      next_steps: 'Lass uns gerne einen Termin für nächste Woche vereinbaren',
      event_introduction: 'ich möchte dich zu einem exklusiven Event einladen',
      event_details: 'Es wird um aktuelle Trends und Entwicklungen in der Branche gehen',
      date: 'nächste Woche Donnerstag',
      location: 'online via Zoom'
    };
  };

  const replacePlaceholders = (text: string, placeholders: Record<string, string>) => {
    return Object.entries(placeholders).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }, text);
  };

  const generateMessage = (
    type: MessageTemplateType,
    context: TemplateContext
  ): string => {
    const template = getMessageTemplate(type, context.contact.platform as Platform);
    const placeholders = getTemplatePlaceholders(template, context);

    const messageParts = [
      template.structure.greeting,
      template.structure.introduction,
      template.structure.main_content,
      template.structure.call_to_action,
      template.structure.closing
    ];

    const message = messageParts
      .map(part => replacePlaceholders(part, placeholders))
      .join('\n\n');

    return message;
  };

  return {
    generateMessage
  };
};
