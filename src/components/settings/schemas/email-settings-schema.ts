
import * as z from "zod";

export const connectionTypes = [
  { value: "SSL/TLS", label: "SSL/TLS (Empfohlen)" },
  { value: "STARTTLS", label: "STARTTLS" },
  { value: "None", label: "Keine Verschlüsselung (unsicher)" }
] as const;

export type ConnectionType = typeof connectionTypes[number]["value"];

// IMAP Settings schema with improved validation
export const imapSettingsSchema = z.object({
  host: z.string().min(1, "Server ist erforderlich"),
  port: z.coerce.number().int().positive("Port muss eine positive Zahl sein").default(993),
  username: z.string().min(1, "E-Mail-Adresse ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  connection_type: z.enum(["SSL/TLS", "STARTTLS", "None"]).default("SSL/TLS"),
  connection_timeout: z.coerce.number().int().min(30000).max(300000).default(120000),
  max_emails: z.coerce.number().int().positive().min(10).max(1000).default(100)
});

// SMTP Settings schema with improved validation
export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "Server ist erforderlich"),
  port: z.coerce.number().int().positive("Port muss eine positive Zahl sein").default(587),
  username: z.string().min(1, "E-Mail-Adresse ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  connection_type: z.enum(["SSL/TLS", "STARTTLS", "None"]).default("STARTTLS"),
  from_email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  from_name: z.string().min(1, "Absender Name ist erforderlich"),
  connection_timeout: z.coerce.number().int().min(30000).max(180000).default(60000)
});

export type ImapSettingsFormData = z.infer<typeof imapSettingsSchema>;
export type SmtpSettingsFormData = z.infer<typeof smtpSettingsSchema>;

// Documentation for common email servers
export const commonEmailServers = [
  {
    name: "Gmail",
    imap: {
      host: "imap.gmail.com",
      port: 993,
      connection_type: "SSL/TLS" as const,
      notes: "Für Gmail benötigen Sie ein App-Passwort, wenn Sie die Zwei-Faktor-Authentifizierung aktiviert haben"
    },
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      connection_type: "STARTTLS" as const,
      notes: "Verwenden Sie Ihre vollständige Gmail-Adresse als Benutzernamen"
    }
  },
  {
    name: "Outlook/Hotmail",
    imap: {
      host: "outlook.office365.com",
      port: 993,
      connection_type: "SSL/TLS" as const,
      notes: "Verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen"
    },
    smtp: {
      host: "smtp.office365.com",
      port: 587,
      connection_type: "STARTTLS" as const,
      notes: "Verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen"
    }
  },
  {
    name: "Web.de",
    imap: {
      host: "imap.web.de",
      port: 993,
      connection_type: "SSL/TLS" as const,
      notes: "Verwenden Sie Ihre vollständige Web.de-Adresse als Benutzernamen"
    },
    smtp: {
      host: "smtp.web.de",
      port: 587,
      connection_type: "STARTTLS" as const,
      notes: "Verwenden Sie Ihre vollständige Web.de-Adresse als Benutzernamen"
    }
  },
  {
    name: "GMX",
    imap: {
      host: "imap.gmx.net",
      port: 993,
      connection_type: "SSL/TLS" as const,
      notes: "Verwenden Sie Ihre vollständige GMX-Adresse als Benutzernamen"
    },
    smtp: {
      host: "mail.gmx.net",
      port: 587,
      connection_type: "STARTTLS" as const,
      notes: "Verwenden Sie Ihre vollständige GMX-Adresse als Benutzernamen"
    }
  },
  {
    name: "1&1",
    imap: {
      host: "imap.1und1.de",
      port: 993,
      connection_type: "SSL/TLS" as const,
      notes: "Verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen"
    },
    smtp: {
      host: "smtp.1und1.de",
      port: 587,
      connection_type: "STARTTLS" as const,
      notes: "Verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen"
    }
  }
];
