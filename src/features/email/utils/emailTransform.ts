
export interface EmailData {
  id: string;
  subject: string;
  from: {
    value: Array<{
      address: string;
      name: string;
    }>;
  };
  to: {
    value: Array<{
      address: string;
      name: string;
    }>;
  };
  date: string;
  text: string;
  html: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  flags: string[];
  seen: boolean;
}

export function transformEmailForStorage(email: EmailData, userId: string, folder: string) {
  return {
    user_id: userId,
    folder,
    message_id: email.id,
    subject: email.subject,
    from_name: email.from?.value?.[0]?.name || '',
    from_email: email.from?.value?.[0]?.address || '',
    to_name: email.to?.value?.[0]?.name || '',
    to_email: email.to?.value?.[0]?.address || '',
    html_content: email.html || '',
    text_content: email.text || '',
    sent_at: email.date,
    received_at: new Date().toISOString(),
    read: email.seen || false,
    starred: false,
    has_attachments: (email.attachments?.length || 0) > 0,
    flags: email.flags || [],
    direction: 'incoming'
  };
}
