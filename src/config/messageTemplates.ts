// Simple placeholder for message templates
export const FIRST_CONTACT_TEMPLATES = {
  Instagram: { type: "first_contact", platform: "Instagram", structure: {}, rules: {} },
  LinkedIn: { type: "first_contact", platform: "LinkedIn", structure: {}, rules: {} },
  Facebook: { type: "first_contact", platform: "Facebook", structure: {}, rules: {} },
  TikTok: { type: "first_contact", platform: "TikTok", structure: {}, rules: {} },
  Offline: { type: "first_contact", platform: "Offline", structure: {}, rules: {} }
};

export const FOLLOW_UP_TEMPLATES = {
  Instagram: { type: "follow_up", platform: "Instagram", structure: {}, rules: {} },
  LinkedIn: { type: "follow_up", platform: "LinkedIn", structure: {}, rules: {} },
  Facebook: { type: "follow_up", platform: "Facebook", structure: {}, rules: {} },
  TikTok: { type: "follow_up", platform: "TikTok", structure: {}, rules: {} },
  Offline: { type: "follow_up", platform: "Offline", structure: {}, rules: {} }
};

export const EVENT_INVITATION_TEMPLATES = {
  Instagram: { type: "event_invitation", platform: "Instagram", structure: {}, rules: {} },
  LinkedIn: { type: "event_invitation", platform: "LinkedIn", structure: {}, rules: {} },
  Facebook: { type: "event_invitation", platform: "Facebook", structure: {}, rules: {} },
  TikTok: { type: "event_invitation", platform: "TikTok", structure: {}, rules: {} },
  Offline: { type: "event_invitation", platform: "Offline", structure: {}, rules: {} }
};

export const COLLABORATION_TEMPLATES = {
  Instagram: { type: "collaboration", platform: "Instagram", structure: {}, rules: {} },
  LinkedIn: { type: "collaboration", platform: "LinkedIn", structure: {}, rules: {} },
  Facebook: { type: "collaboration", platform: "Facebook", structure: {}, rules: {} },
  TikTok: { type: "collaboration", platform: "TikTok", structure: {}, rules: {} },
  Offline: { type: "collaboration", platform: "Offline", structure: {}, rules: {} }
};

export const FEEDBACK_TEMPLATES = {
  Instagram: { type: "feedback", platform: "Instagram", structure: {}, rules: {} },
  LinkedIn: { type: "feedback", platform: "LinkedIn", structure: {}, rules: {} },
  Facebook: { type: "feedback", platform: "Facebook", structure: {}, rules: {} },
  TikTok: { type: "feedback", platform: "TikTok", structure: {}, rules: {} },
  Offline: { type: "feedback", platform: "Offline", structure: {}, rules: {} }
};

export type Platform = 'Instagram' | 'LinkedIn' | 'Facebook' | 'TikTok' | 'Offline';
export type MessageTemplate = {
  type: string;
  platform: string;
  structure: any;
  rules: any;
};