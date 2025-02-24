
import * as z from "zod";

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "SMTP Server ist erforderlich"),
  port: z.number().min(1, "Port ist erforderlich"),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  from_email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  from_name: z.string().min(1, "Absender Name ist erforderlich"),
  secure: z.boolean().default(true)
});

export type SmtpSettingsFormData = z.infer<typeof smtpSettingsSchema>;
