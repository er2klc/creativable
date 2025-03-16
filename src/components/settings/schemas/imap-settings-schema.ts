
import * as z from "zod";

export const imapSettingsSchema = z.object({
  host: z.string().min(1, "IMAP Server ist erforderlich"),
  port: z.number().min(1, "Port ist erforderlich"),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  secure: z.boolean().default(true),
  max_emails: z.coerce.number().int().positive().default(100),
  historical_sync: z.boolean().default(false),
  historical_sync_date: z.date().optional()
});

export type ImapSettingsFormData = z.infer<typeof imapSettingsSchema>;
