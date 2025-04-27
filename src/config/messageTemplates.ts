
export type MessageTemplateType = 
  | "first_contact"
  | "follow_up"
  | "event_invitation"
  | "collaboration"
  | "feedback";

export const messageTemplates: Record<MessageTemplateType, (contactName: string) => string> = {
  first_contact: (name) => 
    `Hallo ${name},\n\nIch bin auf dein Profil gestoßen und finde deine Arbeit sehr inspirierend. Ich würde mich freuen, wenn wir uns vernetzen könnten.\n\nViele Grüße`,
  
  follow_up: (name) => 
    `Hallo ${name},\n\nIch hoffe, es geht dir gut. Ich wollte mich nochmal bei dir melden, nachdem wir uns letztens unterhalten haben.\n\nHättest du Interesse an einem weiteren Austausch?\n\nViele Grüße`,
  
  event_invitation: (name) => 
    `Hallo ${name},\n\nIch möchte dich herzlich zu unserem Event einladen. Es wird eine großartige Gelegenheit sein, sich zu vernetzen und auszutauschen.\n\nWürdest du teilnehmen können?\n\nViele Grüße`,
  
  collaboration: (name) => 
    `Hallo ${name},\n\nIch arbeite gerade an einem spannenden Projekt und denke, dass wir gut zusammenarbeiten könnten. Ich würde mich freuen, wenn wir uns darüber austauschen könnten.\n\nViele Grüße`,
  
  feedback: (name) => 
    `Hallo ${name},\n\nIch würde mich über dein Feedback zu meinem neuesten Projekt freuen. Deine Meinung ist mir sehr wichtig.\n\nViele Grüße`,
};
