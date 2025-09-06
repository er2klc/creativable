
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
    },
    TikTok: {
      type: 'first_contact',
      platform: 'TikTok',
      structure: {
        greeting: 'Hey {{name}} ✨',
        introduction: 'Dein Content ist echt cool! {{reason}}',
        main_content: '{{personalization}}',
        call_to_action: 'Lass uns connecten! 🤝',
        closing: 'Peace ✌️\n{{user_name}}'
      },
      rules: {
        max_length: 200,
        tone: 'casual',
        required_elements: ['personalization', 'content_appreciation']
      }
    },
    Offline: {
      type: 'first_contact',
      platform: 'Offline',
      structure: {
        greeting: 'Hallo {{name}}',
        introduction: 'Es freut mich, Sie kennenzulernen. {{reason}}',
        main_content: '{{personalization}}',
        call_to_action: 'Lassen Sie uns gerne in Kontakt bleiben.',
        closing: 'Mit freundlichen Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 300,
        tone: 'professional',
        required_elements: ['personalization', 'meeting_context']
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
    },
    TikTok: {
      type: 'follow_up',
      platform: 'TikTok',
      structure: {
        greeting: 'Hey {{name}} 🔥',
        introduction: 'Dein letzter Post war mega! {{last_interaction}}',
        main_content: '{{follow_up_content}}',
        call_to_action: 'Let\'s talk! 💬',
        closing: 'Stay awesome ✨\n{{user_name}}'
      },
      rules: {
        max_length: 200,
        tone: 'casual',
        required_elements: ['content_reference', 'collaboration_idea']
      }
    },
    Offline: {
      type: 'follow_up',
      platform: 'Offline',
      structure: {
        greeting: 'Hallo {{name}}',
        introduction: 'Bezugnehmend auf {{last_interaction}}',
        main_content: '{{follow_up_content}}',
        call_to_action: 'Können wir einen Termin vereinbaren?',
        closing: 'Mit freundlichen Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 350,
        tone: 'professional',
        required_elements: ['meeting_reference', 'next_steps']
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
    },
    TikTok: {
      type: 'event_invitation',
      platform: 'TikTok',
      structure: {
        greeting: 'Yo {{name}} 🎪',
        introduction: 'Check das aus: {{event_introduction}}',
        main_content: '{{event_details}}',
        call_to_action: 'Be there! 🔥',
        closing: 'See ya! 🚀\n{{user_name}}'
      },
      rules: {
        max_length: 200,
        tone: 'casual',
        required_elements: ['event_details', 'hype_factor']
      }
    },
    Offline: {
      type: 'event_invitation',
      platform: 'Offline',
      structure: {
        greeting: 'Hallo {{name}}',
        introduction: '{{event_introduction}}',
        main_content: '{{event_details}}',
        call_to_action: 'Bitte bestätigen Sie Ihre Teilnahme.',
        closing: 'Mit freundlichen Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 400,
        tone: 'formal',
        required_elements: ['event_details', 'date', 'location', 'rsvp_info']
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
    },
    TikTok: {
      type: 'collaboration',
      platform: 'TikTok',
      structure: {
        greeting: 'Hey {{name}} 🔥',
        introduction: 'Mega Idee: {{collaboration_reason}}',
        main_content: '{{collaboration_details}}',
        call_to_action: 'Let\'s collab! 🚀',
        closing: 'Stay creative ✨\n{{user_name}}'
      },
      rules: {
        max_length: 200,
        tone: 'casual',
        required_elements: ['collaboration_idea', 'mutual_benefit']
      }
    },
    Offline: {
      type: 'collaboration',
      platform: 'Offline',
      structure: {
        greeting: 'Hallo {{name}}',
        introduction: 'Ich möchte Ihnen eine Kooperationsmöglichkeit vorschlagen: {{collaboration_reason}}',
        main_content: '{{collaboration_details}}',
        call_to_action: 'Können wir einen Termin vereinbaren?',
        closing: 'Mit freundlichen Grüßen\n{{user_name}}'
      },
      rules: {
        max_length: 400,
        tone: 'professional',
        required_elements: ['collaboration_proposal', 'business_case', 'next_steps']
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

