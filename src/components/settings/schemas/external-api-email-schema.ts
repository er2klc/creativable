
import * as z from "zod";

export const externalApiSettingsSchema = z.object({
  host: z.string().min(1, "Server ist erforderlich"),
  port: z.number().min(1, "Port ist erforderlich").default(993),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  folder: z.string().min(1, "Ordner ist erforderlich").default("INBOX"),
  tls: z.boolean().default(true)
});

// Documentation for common email servers
export const commonEmailServers = [
  {
    name: "Gmail",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    notes: "Für Gmail benötigen Sie ein App-Passwort, wenn Sie 2FA aktiviert haben"
  },
  {
    name: "Yahoo",
    host: "imap.mail.yahoo.com",
    port: 993,
    tls: true,
    notes: "Für Yahoo benötigen Sie möglicherweise ein App-Passwort"
  },
  {
    name: "Outlook/Hotmail",
    host: "outlook.office365.com",
    port: 993,
    tls: true,
    notes: "Verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzername"
  },
  {
    name: "iCloud",
    host: "imap.mail.me.com",
    port: 993,
    tls: true,
    notes: "Für iCloud benötigen Sie ein anwendungsspezifisches Passwort"
  },
  {
    name: "GMX",
    host: "imap.gmx.com",
    port: 993,
    tls: true,
    notes: "Verwenden Sie Ihre vollständige GMX-E-Mail-Adresse als Benutzername"
  },
  {
    name: "Web.de",
    host: "imap.web.de", 
    port: 993,
    tls: true,
    notes: "Verwenden Sie Ihre vollständige Web.de-E-Mail-Adresse als Benutzername"
  },
  {
    name: "T-Online",
    host: "secureimap.t-online.de",
    port: 993,
    tls: true,
    notes: "Für T-Online-Konten kann eine spezielle Formatierung für den Benutzernamen erforderlich sein"
  }
];

export type ApiEmailSettingsFormData = z.infer<typeof externalApiSettingsSchema>;
