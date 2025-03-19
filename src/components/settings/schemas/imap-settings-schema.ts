
import * as z from "zod";

export const imapSettingsSchema = z.object({
  host: z.string().min(1, "IMAP Server ist erforderlich"),
  port: z.number().min(1, "Port ist erforderlich").default(993),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  secure: z.boolean().default(true),
  max_emails: z.coerce.number().int().positive().default(100),
  auto_reconnect: z.boolean().default(true),
  connection_timeout: z.coerce.number().int().positive().default(60000)
});

// Documentation for common IMAP servers
export const commonImapServers = [
  {
    name: "Gmail",
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    notes: "For Gmail, you need to use an App Password if you have 2FA enabled"
  },
  {
    name: "Yahoo",
    host: "imap.mail.yahoo.com",
    port: 993,
    secure: true,
    notes: "For Yahoo, you might need to generate an App Password"
  },
  {
    name: "Outlook/Hotmail",
    host: "outlook.office365.com",
    port: 993,
    secure: true,
    notes: "Use your full email address as the username"
  },
  {
    name: "iCloud",
    host: "imap.mail.me.com",
    port: 993,
    secure: true,
    notes: "For iCloud, you need to generate an app-specific password"
  },
  {
    name: "GMX",
    host: "imap.gmx.com",
    port: 993,
    secure: true,
    notes: "Use your full GMX email address as the username"
  },
  {
    name: "Web.de",
    host: "imap.web.de", 
    port: 993,
    secure: true,
    notes: "Use your full Web.de email address as the username"
  },
  {
    name: "AOL",
    host: "imap.aol.com",
    port: 993,
    secure: true,
    notes: "Use your full AOL email address as the username"
  },
  {
    name: "Strato",
    host: "imap.strato.de",
    port: 993,
    secure: true,
    notes: "Use your full Strato email address as the username"
  },
  {
    name: "1&1",
    host: "imap.1und1.de",
    port: 993,
    secure: true,
    notes: "Use your full 1&1 email address as the username"
  },
  {
    name: "T-Online",
    host: "secureimap.t-online.de",
    port: 993,
    secure: true,
    notes: "For T-Online accounts, special formatting may be required for username"
  }
];

export type ImapSettingsFormData = z.infer<typeof imapSettingsSchema>;
