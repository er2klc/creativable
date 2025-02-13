
import { Platform } from '@/config/platforms';

export type MessageTemplateType = 
  | 'first_contact'
  | 'follow_up'
  | 'event_invitation'
  | 'collaboration'
  | 'feedback';

export type MessageTone = 'casual' | 'professional' | 'formal';

export interface MessageTemplate {
  type: MessageTemplateType;
  platform: Platform;
  structure: {
    greeting: string;
    introduction: string;
    main_content: string;
    call_to_action: string;
    closing: string;
  };
  rules: {
    max_length: number;
    tone: MessageTone;
    required_elements: string[];
  };
}

export const messageTemplates: Record<MessageTemplateType, Record<Platform, MessageTemplate>> = {
  first_contact: {
    Instagram: {
      type: 'first_contact',
      platform: 'Instagram',
      structure: {
        greeting: 'Hi {{name}} 👋',
        introduction: 'Ich bin auf dein Profil gestoßen und {{reason}}',
        main_content: '{{personalization}}',
        call_to_action: 'Würde mich freuen von dir zu hören!',
        closing: 'Beste Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['personalization', 'reason']
      }
    },
    LinkedIn: {
      type: 'first_contact',
      platform: 'LinkedIn',
      structure: {
        greeting: 'Sehr geehrte/r {{name}}',
        introduction: 'ich bin auf Ihr Profil aufmerksam geworden und {{reason}}',
        main_content: '{{personalization}}',
        call_to_action: 'Ich würde mich über einen fachlichen Austausch sehr freuen.',
        closing: 'Mit besten Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'professional',
        required_elements: ['personalization', 'reason', 'business_value']
      }
    },
    Facebook: {
      type: 'first_contact',
      platform: 'Facebook',
      structure: {
        greeting: 'Hallo {{name}} 👋',
        introduction: 'Ich bin auf dein Profil gestoßen und {{reason}}',
        main_content: '{{personalization}}',
        call_to_action: 'Lass uns gerne in Kontakt bleiben!',
        closing: 'Viele Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['personalization', 'reason']
      }
    }
  },
  follow_up: {
    Instagram: {
      type: 'follow_up',
      platform: 'Instagram',
      structure: {
        greeting: 'Hi {{name}} 👋',
        introduction: 'Danke für {{last_interaction}}',
        main_content: '{{follow_up_content}}',
        call_to_action: '{{next_steps}}',
        closing: 'Beste Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['last_interaction', 'next_steps']
      }
    },
    LinkedIn: {
      type: 'follow_up',
      platform: 'LinkedIn',
      structure: {
        greeting: 'Sehr geehrte/r {{name}}',
        introduction: 'vielen Dank für {{last_interaction}}',
        main_content: '{{follow_up_content}}',
        call_to_action: '{{next_steps}}',
        closing: 'Mit besten Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'professional',
        required_elements: ['last_interaction', 'next_steps']
      }
    },
    Facebook: {
      type: 'follow_up',
      platform: 'Facebook',
      structure: {
        greeting: 'Hallo {{name}} 👋',
        introduction: 'Danke für {{last_interaction}}',
        main_content: '{{follow_up_content}}',
        call_to_action: '{{next_steps}}',
        closing: 'Viele Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['last_interaction', 'next_steps']
      }
    }
  },
  // ... Additional template types follow the same pattern
  event_invitation: {
    Instagram: {
      type: 'event_invitation',
      platform: 'Instagram',
      structure: {
        greeting: 'Hi {{name}} 👋',
        introduction: '{{event_introduction}}',
        main_content: '{{event_details}}',
        call_to_action: 'Bist du dabei? 🎉',
        closing: 'Beste Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['event_details', 'date', 'location']
      }
    },
    LinkedIn: {
      type: 'event_invitation',
      platform: 'LinkedIn',
      structure: {
        greeting: 'Sehr geehrte/r {{name}}',
        introduction: '{{event_introduction}}',
        main_content: '{{event_details}}',
        call_to_action: 'Ich würde mich sehr über Ihre Teilnahme freuen.',
        closing: 'Mit besten Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'professional',
        required_elements: ['event_details', 'date', 'location', 'business_value']
      }
    },
    Facebook: {
      type: 'event_invitation',
      platform: 'Facebook',
      structure: {
        greeting: 'Hallo {{name}} 👋',
        introduction: '{{event_introduction}}',
        main_content: '{{event_details}}',
        call_to_action: 'Bist du dabei? 🎉',
        closing: 'Viele Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['event_details', 'date', 'location']
      }
    }
  },
  collaboration: {
    Instagram: {
      type: 'collaboration',
      platform: 'Instagram',
      structure: {
        greeting: 'Hi {{name}} 👋',
        introduction: '{{collaboration_reason}}',
        main_content: '{{collaboration_details}}',
        call_to_action: 'Was hältst du davon? 🤝',
        closing: 'Beste Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['collaboration_reason', 'collaboration_details']
      }
    },
    LinkedIn: {
      type: 'collaboration',
      platform: 'LinkedIn',
      structure: {
        greeting: 'Sehr geehrte/r {{name}}',
        introduction: '{{collaboration_reason}}',
        main_content: '{{collaboration_details}}',
        call_to_action: 'Ich würde mich über ein Gespräch sehr freuen.',
        closing: 'Mit besten Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'professional',
        required_elements: ['collaboration_reason', 'collaboration_details', 'business_value']
      }
    },
    Facebook: {
      type: 'collaboration',
      platform: 'Facebook',
      structure: {
        greeting: 'Hallo {{name}} 👋',
        introduction: '{{collaboration_reason}}',
        main_content: '{{collaboration_details}}',
        call_to_action: 'Was hältst du davon? 🤝',
        closing: 'Viele Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['collaboration_reason', 'collaboration_details']
      }
    }
  },
  feedback: {
    Instagram: {
      type: 'feedback',
      platform: 'Instagram',
      structure: {
        greeting: 'Hi {{name}} 👋',
        introduction: '{{feedback_context}}',
        main_content: '{{feedback_request}}',
        call_to_action: 'Würde mich über dein Feedback freuen! 🙏',
        closing: 'Beste Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['feedback_context', 'feedback_request']
      }
    },
    LinkedIn: {
      type: 'feedback',
      platform: 'LinkedIn',
      structure: {
        greeting: 'Sehr geehrte/r {{name}}',
        introduction: '{{feedback_context}}',
        main_content: '{{feedback_request}}',
        call_to_action: 'Ich würde mich sehr über Ihr Feedback freuen.',
        closing: 'Mit besten Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'professional',
        required_elements: ['feedback_context', 'feedback_request']
      }
    },
    Facebook: {
      type: 'feedback',
      platform: 'Facebook',
      structure: {
        greeting: 'Hallo {{name}} 👋',
        introduction: '{{feedback_context}}',
        main_content: '{{feedback_request}}',
        call_to_action: 'Würde mich über dein Feedback freuen! 🙏',
        closing: 'Viele Grüße\n{{user_name}}'
      },
      rules: {
        max_length: 500,
        tone: 'casual',
        required_elements: ['feedback_context', 'feedback_request']
      }
    }
  }
};

export const getMessageTemplate = (type: MessageTemplateType, platform: Platform): MessageTemplate => {
  return messageTemplates[type][platform];
};

